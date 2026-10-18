import asyncio
import json
from types import SimpleNamespace

import pytest

from app.schemas.chat import ChatMessage, ChatRole
from app.schemas.job_analysis import JobFitReport
from app.services import ai


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
        "skill_evidence": [
            {"skill": "React.js", "evidence_level": "professional_experience", "evidence": "Named in role responsibilities."}
        ],
        "unverified_or_unconfirmed_skills": [],
    }


class FakeModel:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error

    def invoke(self, messages):
        if self.error:
            raise self.error
        return SimpleNamespace(content=self.response)


class ProviderError(Exception):
    def __init__(self, status_code, message="provider detail"):
        super().__init__(message)
        self.status_code = status_code


def configured_settings(monkeypatch, primary="mistral", fallback="groq"):
    settings = ai.get_settings()
    monkeypatch.setattr(settings, "ai_primary_provider", primary)
    monkeypatch.setattr(settings, "ai_fallback_provider", fallback)
    monkeypatch.setattr(settings, "mistral_api_key", "test-mistral-key")
    monkeypatch.setattr(settings, "groq_api_key", "test-groq-key")
    return settings


def test_mistral_primary_success_does_not_call_groq(monkeypatch):
    configured_settings(monkeypatch)
    calls = []

    def build(provider, **_kwargs):
        calls.append(provider)
        return FakeModel(response="Answer from Mistral")

    monkeypatch.setattr(ai, "_build_model", build)
    result = ai._generate_with_fallback([], max_output_tokens=100, purpose="test")
    assert result == "Answer from Mistral"
    assert calls == ["mistral"]


@pytest.mark.parametrize("status_code", [429, 503, 504])
def test_mistral_retryable_failure_falls_back_to_groq(monkeypatch, status_code):
    configured_settings(monkeypatch)
    calls = []

    def build(provider, **_kwargs):
        calls.append(provider)
        if provider == "mistral":
            return FakeModel(error=ProviderError(status_code))
        return FakeModel(response="Answer from Groq")

    monkeypatch.setattr(ai, "_build_model", build)
    result = ai._generate_with_fallback([], max_output_tokens=100, purpose="test")
    assert result == "Answer from Groq"
    assert calls == ["mistral", "groq"]


def test_groq_can_be_configured_as_primary(monkeypatch):
    configured_settings(monkeypatch, primary="groq", fallback="mistral")
    calls = []

    def build(provider, **_kwargs):
        calls.append(provider)
        return FakeModel(response="Answer from Groq")

    monkeypatch.setattr(ai, "_build_model", build)
    assert ai._generate_with_fallback([], max_output_tokens=100, purpose="test") == "Answer from Groq"
    assert calls == ["groq"]


def test_both_providers_failing_is_bounded_and_safe(monkeypatch):
    configured_settings(monkeypatch)
    calls = []

    def build(provider, **_kwargs):
        calls.append(provider)
        return FakeModel(error=ProviderError(503, "sensitive provider payload"))

    monkeypatch.setattr(ai, "_build_model", build)
    with pytest.raises(ai.AIProviderTemporaryError) as error:
        ai._generate_with_fallback([], max_output_tokens=100, purpose="test")
    assert calls == ["mistral", "groq"]
    assert "sensitive" not in str(error.value)


def test_authentication_error_does_not_fall_back(monkeypatch):
    configured_settings(monkeypatch)
    calls = []

    def build(provider, **_kwargs):
        calls.append(provider)
        return FakeModel(error=ProviderError(401))

    monkeypatch.setattr(ai, "_build_model", build)
    with pytest.raises(ai.AIProviderPermanentError):
        ai._generate_with_fallback([], max_output_tokens=100, purpose="test")
    assert calls == ["mistral"]


def test_missing_primary_key_uses_configured_fallback(monkeypatch):
    settings = configured_settings(monkeypatch)
    monkeypatch.setattr(settings, "mistral_api_key", "")
    calls = []

    def build(provider, **_kwargs):
        calls.append(provider)
        return FakeModel(response="Fallback is configured")

    monkeypatch.setattr(ai, "_build_model", build)
    assert ai._generate_with_fallback([], max_output_tokens=100, purpose="test") == "Fallback is configured"
    assert calls == ["groq"]


def test_missing_all_provider_keys_is_a_configuration_error(monkeypatch):
    settings = configured_settings(monkeypatch)
    monkeypatch.setattr(settings, "mistral_api_key", "")
    monkeypatch.setattr(settings, "groq_api_key", "")
    with pytest.raises(ai.AIConfigurationError):
        ai._generate_with_fallback([], max_output_tokens=100, purpose="test")


def test_job_report_is_validated_against_existing_schema():
    report = ai._parse_job_fit_report(json.dumps(valid_report()))
    assert isinstance(report, JobFitReport)
    assert report.overall_match_score == 72
    with pytest.raises(ai.AIInvalidResponseError):
        ai._parse_job_fit_report('{"overall_match_score": 120}')


def test_chat_response_keeps_existing_string_contract(monkeypatch):
    configured_settings(monkeypatch)

    def generate(messages, **kwargs):
        assert kwargs["purpose"] == "chat"
        assert messages[0].type == "system"
        return "A complete **Markdown** answer."

    monkeypatch.setattr(ai, "_generate_with_fallback", generate)
    result = asyncio.run(ai.generate_chat_answer([ChatMessage(role=ChatRole.user, content="What is MVBook?")]))
    assert result == "A complete **Markdown** answer."
