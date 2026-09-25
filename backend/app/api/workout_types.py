from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import User, WorkoutType
from app.schemas import CreateWorkoutTypeIn

router = APIRouter(prefix="/workout-types")


@router.get("")
def list_workout_types(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    types = db.query(WorkoutType).filter((WorkoutType.user_id == user.id)).all()
    return [{"id": t.id, "name": t.name, "is_predefined": t.user_id is None} for t in types]


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
    return {"id": workout_type.id, "name": workout_type.name, "is_predefined": False}

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
    return {
        "id": workout_type.id,
        "name": workout_type.name,
        "is_predefined": False,
    }