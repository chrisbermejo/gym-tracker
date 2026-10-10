from pydantic import BaseModel, Field
from typing import Literal


class OnboardingIn(BaseModel):
    weight: float = Field(gt=0)
    height: float = Field(gt=0)
    unit_system: Literal["metric", "imperial"]

class CreateWorkoutTypeIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)

class CreateExerciseIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    muscle_group: str | None = Field(default=None, max_length=50)

class AttachExerciseIn(BaseModel):
    exercise_id: int
    order_index: int = 0

class CreateWorkoutIn(BaseModel):
    label: str = Field(min_length=1, max_length=50)

class AddWorkoutExerciseIn(BaseModel):
    exercise_id: int

class AddSetIn(BaseModel):
    weight: float = Field(gt=0)
    reps: int = Field(gt=0)

class CreateWorkoutIn(BaseModel):
    label: str = Field(min_length=1, max_length=50)
    workout_type_id: int | None = None

class UpdateSettingsIn(BaseModel):
    unit_system: Literal["metric", "imperial"]