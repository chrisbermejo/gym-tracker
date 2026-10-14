from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import RoutineSlot, User, Workout, WorkoutExercise, WorkoutType, WorkoutTypeExercise
from app.schemas import SetRoutineIn

router = APIRouter(prefix="/routine")


def _ordered_slots(db: Session, user: User):
    return (
        db.query(RoutineSlot)
        .filter(RoutineSlot.user_id == user.id)
        .order_by(RoutineSlot.order_index)
        .all()
    )


def _serialize_routine(db: Session, user: User) -> dict:
    slots = _ordered_slots(db, user)
    if not slots:
        return {"slots": [], "suggested": None}

    position = user.routine_position % len(slots)
    suggested_type = db.get(WorkoutType, slots[position].workout_type_id)

    return {
        "slots": [
            {"workout_type_id": s.workout_type_id, "name": db.get(WorkoutType, s.workout_type_id).name}
            for s in slots
        ],
        "suggested": {"workout_type_id": suggested_type.id, "name": suggested_type.name},
    }


@router.get("")
def get_routine(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _serialize_routine(db, user)


@router.put("")
def set_routine(payload: SetRoutineIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(RoutineSlot).filter(RoutineSlot.user_id == user.id).delete()
    for index, workout_type_id in enumerate(payload.workout_type_ids):
        db.add(RoutineSlot(user_id=user.id, workout_type_id=workout_type_id, order_index=index))
    user.routine_position = 0
    db.commit()
    return _serialize_routine(db, user)


@router.post("/confirm")
def confirm_today(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    slots = _ordered_slots(db, user)
    if not slots:
        raise HTTPException(status_code=400, detail="No routine configured")

    existing = (
        db.query(Workout)
        .filter(Workout.user_id == user.id, Workout.workout_date == date.today())
        .first()
    )
    if existing is not None:
        raise HTTPException(status_code=400, detail="Today's workout is already set")

    position = user.routine_position % len(slots)
    workout_type = db.get(WorkoutType, slots[position].workout_type_id)

    workout = Workout(user_id=user.id, workout_date=date.today(), label=workout_type.name)
    db.add(workout)
    db.flush()

    if workout_type.name != "Rest":
        links = (
            db.query(WorkoutTypeExercise)
            .filter(WorkoutTypeExercise.workout_type_id == workout_type.id)
            .order_by(WorkoutTypeExercise.order_index)
            .all()
        )
        for link in links:
            db.add(WorkoutExercise(workout_id=workout.id, exercise_id=link.exercise_id, order_index=link.order_index))
    else:
        workout.completed_at = datetime.now(timezone.utc)

    user.routine_position = (position + 1) % len(slots)
    db.commit()
    return _serialize_routine(db, user)