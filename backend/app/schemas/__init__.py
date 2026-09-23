from pydantic import BaseModel, Field


class OnboardingIn(BaseModel):
    weight: float = Field(gt=0)
    height: float = Field(gt=0)