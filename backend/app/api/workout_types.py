from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import User, WorkoutType, Exercise, WorkoutTypeExercise
from app.schemas import CreateWorkoutTypeIn, AttachExerciseIn

router = APIRouter(prefix="/workout-types")


def _serialize(workout_type: WorkoutType) -> dict:
    return {
        "id": workout_type.id,
        "name": workout_type.name,
        "is_predefined": workout_type.user_id is None,
    }


@router.get("")
def list_workout_types(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    types = db.query(WorkoutType).filter((WorkoutType.user_id == user.id)).all()
    return [_serialize(t) for t in types]


@router.post("")
def create_workout_type(
    payload: CreateWorkoutTypeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_type = WorkoutType(user_id=user.id, name=payload.name)
    db.add(workout_type)
    db.commit()
    db.refresh(workout_type)
    return _serialize(workout_type)

@router.delete("/{workout_type_id}")
def delete_workout_type(
    workout_type_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_type = db.get(WorkoutType, workout_type_id)
    if workout_type is None or workout_type.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workout type not found")

    db.delete(workout_type)
    db.commit()
    return {"status": "ok"}

@router.patch("/{workout_type_id}")
def update_workout_type(
    workout_type_id: int,
    payload: CreateWorkoutTypeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_type = db.get(WorkoutType, workout_type_id)
    if workout_type is None or workout_type.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workout type not found")

    workout_type.name = payload.name
    db.commit()
    db.refresh(workout_type)
    return _serialize(workout_type)

@router.get("/{workout_type_id}/exercises")
def list_workout_type_exercises(
    workout_type_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_type = db.get(WorkoutType, workout_type_id)
    if workout_type is None or (workout_type.user_id is not None and workout_type.user_id != user.id):
        raise HTTPException(status_code=404, detail="Workout type not found")
    links = (
        db.query(WorkoutTypeExercise)
        .filter(WorkoutTypeExercise.workout_type_id == workout_type_id)
        .order_by(WorkoutTypeExercise.order_index)
        .all()
    )
    return [
        {"exercise_id": link.exercise_id, "name": db.get(Exercise, link.exercise_id).name, "order_index": link.order_index}
        for link in links
    ]


@router.post("/{workout_type_id}/exercises")
def add_exercise_to_workout_type(
    workout_type_id: int,
    payload: AttachExerciseIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_type = db.get(WorkoutType, workout_type_id)
    if workout_type is None or workout_type.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workout type not found")

    link = WorkoutTypeExercise(
        workout_type_id=workout_type_id,
        exercise_id=payload.exercise_id,
        order_index=payload.order_index,
    )
    db.add(link)
    db.commit()
    return {"status": "ok"}


@router.delete("/{workout_type_id}/exercises/{exercise_id}")
def remove_exercise_from_workout_type(
    workout_type_id: int,
    exercise_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_type = db.get(WorkoutType, workout_type_id)
    if workout_type is None or workout_type.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workout type not found")
    db.query(WorkoutTypeExercise).filter(
        WorkoutTypeExercise.workout_type_id == workout_type_id,
        WorkoutTypeExercise.exercise_id == exercise_id,
    ).delete()
    db.commit()
    return {"status": "ok"}