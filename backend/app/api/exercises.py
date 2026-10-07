from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Exercise, User, Set, Workout, WorkoutExercise
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

@router.get("/{exercise_id}/history")
def get_exercise_history(exercise_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = (
        db.query(Workout, WorkoutExercise)
        .join(WorkoutExercise, WorkoutExercise.workout_id == Workout.id)
        .filter(
            Workout.user_id == user.id,
            WorkoutExercise.exercise_id == exercise_id,
            Workout.completed_at.isnot(None),
        )
        .order_by(Workout.workout_date.desc(), Workout.id.desc())
        .first()
    )
    if result is None:
        return None

    workout, workout_exercise = result
    sets = db.query(Set).filter(Set.workout_exercise_id == workout_exercise.id).order_by(Set.set_number).all()
    return {
        "workout_date": workout.workout_date.isoformat(),
        "sets": [{"set_number": s.set_number, "weight": float(s.weight), "reps": s.reps} for s in sets],
    }