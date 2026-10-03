from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Exercise, Set, User, Workout, WorkoutExercise
from app.schemas import AddSetIn, AddWorkoutExerciseIn, CreateWorkoutIn

router = APIRouter(prefix="/workouts")


def _get_owned_workout(db: Session, workout_id: int, user: User) -> Workout:
    workout = db.get(Workout, workout_id)
    if workout is None or workout.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


def _get_owned_workout_exercise(db: Session, workout_id: int, workout_exercise_id: int, user: User) -> WorkoutExercise:
    _get_owned_workout(db, workout_id, user)
    workout_exercise = db.get(WorkoutExercise, workout_exercise_id)
    if workout_exercise is None or workout_exercise.workout_id != workout_id:
        raise HTTPException(status_code=404, detail="Exercise not found in this workout")
    return workout_exercise


def _serialize(db: Session, workout: Workout) -> dict:
    exercises = (
        db.query(WorkoutExercise)
        .filter(WorkoutExercise.workout_id == workout.id)
        .order_by(WorkoutExercise.order_index)
        .all()
    )
    exercise_list = []
    for we in exercises:
        exercise = db.get(Exercise, we.exercise_id)
        sets = db.query(Set).filter(Set.workout_exercise_id == we.id).order_by(Set.set_number).all()
        exercise_list.append(
            {
                "workout_exercise_id": we.id,
                "exercise_id": exercise.id,
                "name": exercise.name,
                "sets": [{"id": s.id, "set_number": s.set_number, "weight": float(s.weight), "reps": s.reps} for s in sets],
            }
        )
    return {
        "id": workout.id,
        "workout_date": workout.workout_date.isoformat(),
        "label": workout.label,
        "completed_at": workout.completed_at.isoformat() if workout.completed_at else None,
        "exercises": exercise_list,
    }


@router.post("")
def create_workout(payload: CreateWorkoutIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workout = Workout(user_id=user.id, workout_date=date.today(), label=payload.label)
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return _serialize(db, workout)


@router.get("/today")
def get_today_workout(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workout = (
        db.query(Workout)
        .filter(Workout.user_id == user.id, Workout.workout_date == date.today())
        .order_by(Workout.id.desc())
        .first()
    )
    if workout is None:
        return None
    return _serialize(db, workout)


@router.get("/{workout_id}")
def get_workout(workout_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _serialize(db, _get_owned_workout(db, workout_id, user))


@router.post("/{workout_id}/exercises")
def add_exercise(
    workout_id: int,
    payload: AddWorkoutExerciseIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout = _get_owned_workout(db, workout_id, user)
    order_index = db.query(WorkoutExercise).filter(WorkoutExercise.workout_id == workout.id).count()
    db.add(WorkoutExercise(workout_id=workout.id, exercise_id=payload.exercise_id, order_index=order_index))
    db.commit()
    return _serialize(db, workout)


@router.post("/{workout_id}/exercises/{workout_exercise_id}/sets")
def add_set(
    workout_id: int,
    workout_exercise_id: int,
    payload: AddSetIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_exercise = _get_owned_workout_exercise(db, workout_id, workout_exercise_id, user)
    set_number = db.query(Set).filter(Set.workout_exercise_id == workout_exercise.id).count() + 1
    db.add(Set(workout_exercise_id=workout_exercise.id, set_number=set_number, weight=payload.weight, reps=payload.reps))
    db.commit()
    return _serialize(db, _get_owned_workout(db, workout_id, user))


@router.patch("/{workout_id}/complete")
def complete_workout(workout_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workout = _get_owned_workout(db, workout_id, user)
    workout.completed_at = datetime.now(timezone.utc)
    db.commit()
    return _serialize(db, workout)