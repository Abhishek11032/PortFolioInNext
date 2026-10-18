from unittest.mock import Mock

import pytest

from app.schemas.job_analysis import JobFitReport
from app.services.ai import AIConfigurationError, AIInvalidResponseError, AIProviderPermanentError, AIProviderRateLimitError, AIProviderTemporaryError, _parse_job_fit_report


def valid_report():
    return {
        "overall_match_score": 72,
        "summary": "Relevant full stack experience is present.",
        "required_skills_matched": ["React.js"],
        "required_skills_missing": [],
        "preferred_skills_matched": [],
        "preferred_skills_missing": [],
        "relevant_projects": [],
        "verified_experience": ["Software Developer at Gowdanar Technosoft"],
        "strengths": ["Responsive application development"],
        "skill_gaps": [],
        "interview_recommendations": ["Prepare examples of API design."],
        "supporting_evidence": ["React.js appears in verified experience."],
        "skill_evidence": [{"skill": "React.js", "evidence_level": "professional_experience", "evidence": "Named in role responsibilities."}],
        "unverified_or_unconfirmed_skills": [],
    }


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["redis"] == "ok"


def test_chat_validates_latest_user_message(client):
    response = client.post("/api/v1/chat", json={"messages": [{"role": "assistant", "content": "hello"}]})
    assert response.status_code == 422


def test_chat_message_length_is_validated(client):
    response = client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "x" * 501}]})
    assert response.status_code == 422


def test_chat_provider_failure_is_safe(client, monkeypatch):
    async def fail(_messages):
        raise AIProviderTemporaryError("provider detail not for visitors")

    monkeypatch.setattr("app.api.routes.chat.generate_chat_answer", fail)
    response = client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "Tell me about projects"}]})
    assert response.status_code == 503
    assert "provider detail" not in response.text


def test_chat_missing_configuration_returns_actionable_503(client, monkeypatch):
    async def missing(_messages):
        raise AIConfigurationError("Mistral API is not configured")

    monkeypatch.setattr("app.api.routes.chat.generate_chat_answer", missing)
    response = client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "What projects are listed?"}]})
    assert response.status_code == 503
    assert "not configured" in response.json()["detail"]


def test_chat_provider_rate_limit_is_429(client, monkeypatch):
    async def limited(_messages):
        raise AIProviderRateLimitError("provider quota details")

    monkeypatch.setattr("app.api.routes.chat.generate_chat_answer", limited)
    response = client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "What projects are listed?"}]})
    assert response.status_code == 429
    assert "provider quota details" not in response.text


def test_chat_returns_complete_answer(client, monkeypatch):
    async def answer(_messages):
        return "A complete answer with **readable Markdown** and all requested details."

    monkeypatch.setattr("app.api.routes.chat.generate_chat_answer", answer)
    response = client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "Tell me about the portfolio"}]})
    assert response.status_code == 200
    assert response.json()["answer"].endswith("all requested details.")


def test_chat_rate_limit_returns_429(client, fake_redis, monkeypatch):
    from app.core.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "chat_limit_per_minute", 1)
    async def answer(_messages):
        return "ok"

    monkeypatch.setattr("app.api.routes.chat.generate_chat_answer", answer)
    payload = {"messages": [{"role": "user", "content": "Question"}]}
    assert client.post("/api/v1/chat", json=payload).status_code == 200
    assert client.post("/api/v1/chat", json=payload).status_code == 429


def test_job_text_submission_returns_complete_report(client, monkeypatch):
    expected = JobFitReport.model_validate(valid_report())
    analyze = Mock(return_value=expected)
    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit_sync", analyze)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    assert response.status_code == 200
    assert response.json() == expected.model_dump(mode="json")
    analyze.assert_called_once_with("We need a full stack engineer with React and Python experience.")


def test_job_analysis_keeps_redis_rate_limiting(client, fake_redis, monkeypatch):
    from app.core.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "job_analysis_limit_per_minute", 1)
    monkeypatch.setattr(
        "app.api.routes.job_analysis.analyze_job_fit_sync",
        lambda _text: JobFitReport.model_validate(valid_report()),
    )
    payload = {"job_description": "We need a full stack engineer with React and Python experience."}
    assert client.post("/api/v1/job-analysis", data=payload).status_code == 200
    assert client.post("/api/v1/job-analysis", data=payload).status_code == 429


def test_job_submission_requires_exactly_one_input(client):
    response = client.post("/api/v1/job-analysis", data={})
    assert response.status_code == 400


def test_invalid_upload_extension_is_rejected(client):
    response = client.post("/api/v1/job-analysis", files={"file": ("resume.txt", b"not a resume", "text/plain")})
    assert response.status_code == 400


def test_invalid_pdf_is_rejected(client):
    response = client.post("/api/v1/job-analysis", files={"file": ("role.pdf", b"not-a-pdf", "application/pdf")})
    assert response.status_code == 400


def test_file_size_limit_is_enforced(client):
    payload = b"%PDF-" + b"x" * (5 * 1024 * 1024)
    response = client.post("/api/v1/job-analysis", files={"file": ("large.pdf", payload, "application/pdf")})
    assert response.status_code == 413


def test_report_schema_accepts_and_rejects_invalid_scores():
    assert JobFitReport.model_validate(valid_report()).overall_match_score == 72
    invalid = valid_report() | {"overall_match_score": 101}
    with pytest.raises(ValueError):
        JobFitReport.model_validate(invalid)


def test_job_analysis_provider_rate_limit_is_safe_429(client, monkeypatch):
    def limited(_text):
        raise AIProviderRateLimitError("provider quota details")

    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit_sync", limited)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    assert response.status_code == 429
    assert "provider quota details" not in response.text
    assert response.headers["Retry-After"] == "60"


def test_job_analysis_provider_configuration_failure_is_safe_503(client, monkeypatch):
    def missing(_text):
        raise AIConfigurationError("secret provider details")

    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit_sync", missing)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    assert response.status_code == 503
    assert "secret provider details" not in response.text


def test_job_analysis_temporary_provider_failure_is_safe_503(client, monkeypatch):
    def unavailable(_text):
        raise AIProviderTemporaryError("internal provider response")

    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit_sync", unavailable)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    assert response.status_code == 503
    assert "internal provider response" not in response.text


def test_job_analysis_invalid_provider_result_is_safe_502(client, monkeypatch):
    def invalid(_text):
        raise AIInvalidResponseError("private model output")

    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit_sync", invalid)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    assert response.status_code == 502
    assert "private model output" not in response.text


def test_invalid_structured_provider_response_is_rejected():
    with pytest.raises(AIInvalidResponseError):
        _parse_job_fit_report('{"overall_match_score": 120}')
