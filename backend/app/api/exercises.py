from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Exercise, User
from app.schemas import CreateExerciseIn

router = APIRouter(prefix="/exercises")


def _serialize(exercise: Exercise) -> dict:
    return {
        "id": exercise.id,
        "name": exercise.name,
        "muscle_group": exercise.muscle_group,
        "is_predefined": exercise.user_id is None,
    }


@router.get("")
def list_exercises(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exercises = db.query(Exercise).filter(
        (Exercise.user_id.is_(None)) | (Exercise.user_id == user.id)
    ).all()
    return [_serialize(e) for e in exercises]


@router.post("")
def create_exercise(
    payload: CreateExerciseIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exercise = Exercise(user_id=user.id, name=payload.name, muscle_group=payload.muscle_group)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return _serialize(exercise)