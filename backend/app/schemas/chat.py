from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ChatRole(str, Enum):
    user = "user"
    assistant = "assistant"


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: ChatRole
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    messages: list[ChatMessage] = Field(min_length=1, max_length=6)

    @model_validator(mode="after")
    def validate_conversation(self):
        for message in self.messages:
            if not message.content.strip():
                raise ValueError("Messages cannot be empty.")
            limit = 500 if message.role is ChatRole.user else 4_000
            if len(message.content) > limit:
                label = "User question" if message.role is ChatRole.user else "Assistant context"
                raise ValueError(f"{label} must be no more than {limit} characters.")
        if self.messages[-1].role is not ChatRole.user:
            raise ValueError("The latest message must be from you.")
        return self


class ChatResponse(BaseModel):
    answer: str = Field(min_length=1)
