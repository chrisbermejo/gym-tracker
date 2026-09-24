from pydantic import BaseModel, Field


class OnboardingIn(BaseModel):
    weight: float = Field(gt=0)
    height: float = Field(gt=0)

class CreateWorkoutTypeIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)