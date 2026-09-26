from pydantic import BaseModel, Field


class OnboardingIn(BaseModel):
    weight: float = Field(gt=0)
    height: float = Field(gt=0)

class CreateWorkoutTypeIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)

class CreateExerciseIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    muscle_group: str | None = Field(default=None, max_length=50)


class AttachExerciseIn(BaseModel):
    exercise_id: int
    order_index: int = 0