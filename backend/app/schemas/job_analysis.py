from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


ShortText = Annotated[str, StringConstraints(min_length=1, max_length=600)]


class SkillEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    skill: Annotated[str, StringConstraints(min_length=1, max_length=120)]
    evidence_level: Literal["professional_experience", "project", "skills_list_only", "not_found"]
    evidence: Annotated[str, StringConstraints(min_length=1, max_length=600)]


class ProjectRelevance(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_name: Annotated[str, StringConstraints(min_length=1, max_length=160)]
    relevance: ShortText
    evidence: ShortText


class JobFitReport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overall_match_score: int = Field(ge=0, le=100)
    summary: Annotated[str, StringConstraints(min_length=1, max_length=1200)]
    required_skills_matched: list[ShortText] = Field(max_length=30)
    required_skills_missing: list[ShortText] = Field(max_length=30)
    preferred_skills_matched: list[ShortText] = Field(max_length=30)
    preferred_skills_missing: list[ShortText] = Field(max_length=30)
    relevant_projects: list[ProjectRelevance] = Field(max_length=8)
    verified_experience: list[ShortText] = Field(max_length=12)
    strengths: list[ShortText] = Field(max_length=12)
    skill_gaps: list[ShortText] = Field(max_length=12)
    interview_recommendations: list[ShortText] = Field(max_length=12)
    supporting_evidence: list[ShortText] = Field(max_length=16)
    skill_evidence: list[SkillEvidence] = Field(max_length=40)
    unverified_or_unconfirmed_skills: list[ShortText] = Field(max_length=30)
