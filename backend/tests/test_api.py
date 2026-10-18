from unittest.mock import Mock
import pytest

from app.schemas.job_analysis import JobFitReport
from app.services.ai import AIConfigurationError, AIInvalidResponseError, AIProviderRateLimitError, AIProviderTemporaryError, _parse_job_fit_report
from app.tasks.job_analysis import analyze_job_fit


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


def test_job_text_submission_returns_task_id(client, monkeypatch):
    task = Mock()
    task.apply_async.return_value = None
    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit", task)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    assert response.status_code == 202
    assert response.json()["task_id"]
    assert response.json()["access_token"]
    task.apply_async.assert_called_once()


def test_job_submission_requires_exactly_one_input(client):
    response = client.post("/api/v1/job-analysis", data={})
    assert response.status_code == 400


def test_invalid_upload_extension_is_rejected(client):
    response = client.post("/api/v1/job-analysis", files={"file": ("resume.txt", b"not a resume", "text/plain")})
    assert response.status_code == 400


def test_invalid_pdf_is_rejected(client):
    response = client.post("/api/v1/job-analysis", files={"file": ("role.pdf", b"not-a-pdf", "application/pdf")})
    assert response.status_code == 400


def test_job_task_status_requires_task_token(client, fake_redis, monkeypatch):
    task = Mock()
    task.apply_async.return_value = None
    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit", task)
    response = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."})
    task_id = response.json()["task_id"]
    status = client.get(f"/api/v1/job-analysis/{task_id}")
    assert status.status_code == 404


def test_status_does_not_leak_another_task_result(client, fake_redis, monkeypatch):
    other_task_id = "d34cbe8e-0640-4e2b-8b4c-6f5d0025b3b2"
    fake_redis.values[f"analysis-access:{other_task_id}"] = "different-token-hash"
    task_result = Mock(state="SUCCESS", result=valid_report())
    monkeypatch.setattr("app.api.routes.job_analysis.AsyncResult", Mock(return_value=task_result))
    status = client.get(f"/api/v1/job-analysis/{other_task_id}", headers={"X-Analysis-Token": "a-token-for-some-other-task"})
    assert status.status_code == 404


def test_file_size_limit_is_enforced(client):
    payload = b"%PDF-" + b"x" * (5 * 1024 * 1024)
    response = client.post("/api/v1/job-analysis", files={"file": ("large.pdf", payload, "application/pdf")})
    assert response.status_code == 413


def test_report_schema_accepts_and_rejects_invalid_scores():
    assert JobFitReport.model_validate(valid_report()).overall_match_score == 72
    invalid = valid_report() | {"overall_match_score": 101}
    with pytest.raises(ValueError):
        JobFitReport.model_validate(invalid)


def test_job_task_does_not_retry_provider_rate_limit(monkeypatch):
    quota_error = AIProviderRateLimitError(AIProviderRateLimitError.public_message)

    def fail(_text):
        raise quota_error

    monkeypatch.setattr("app.tasks.job_analysis.analyze_job_fit_sync", fail)
    monkeypatch.setattr(analyze_job_fit, "update_state", Mock())
    retry = Mock()
    monkeypatch.setattr(analyze_job_fit, "retry", retry)
    with pytest.raises(AIProviderRateLimitError):
        analyze_job_fit.run("A sufficiently detailed job description for this test.")
    retry.assert_not_called()


def test_job_status_shows_safe_provider_rate_limit_message(client, monkeypatch):
    task = Mock()
    monkeypatch.setattr("app.api.routes.job_analysis.analyze_job_fit", task)
    accepted = client.post("/api/v1/job-analysis", data={"job_description": "We need a full stack engineer with React and Python experience."}).json()
    failed_task = Mock(state="FAILURE", result=AIProviderRateLimitError(AIProviderRateLimitError.public_message))
    monkeypatch.setattr("app.api.routes.job_analysis.AsyncResult", Mock(return_value=failed_task))

    response = client.get(
        f"/api/v1/job-analysis/{accepted['task_id']}",
        headers={"X-Analysis-Token": accepted["access_token"]},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "failed"
    assert response.json()["error"] == AIProviderRateLimitError.public_message


def test_invalid_structured_provider_response_is_rejected():
    with pytest.raises(AIInvalidResponseError):
        _parse_job_fit_report('{"overall_match_score": 120}')


def test_celery_task_calls_analysis(monkeypatch):
    expected = JobFitReport.model_validate(valid_report())
    monkeypatch.setattr("app.tasks.job_analysis.analyze_job_fit_sync", lambda _text: expected)
    monkeypatch.setattr(analyze_job_fit, "update_state", Mock())
    result = analyze_job_fit.run("A sufficiently detailed job description for this test.")
    assert result["overall_match_score"] == 72
