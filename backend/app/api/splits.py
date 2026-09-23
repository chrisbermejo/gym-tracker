from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import SplitDay, User, WorkoutSplit
from app.schemas import UpdateSplitDayIn

router = APIRouter(prefix="/splits")


def _serialize_split(split: WorkoutSplit, days: list[SplitDay]) -> dict:
    return {
        "id": split.id,
        "name": split.name,
        "is_predefined": split.user_id is None,
        "days": [{"day_of_week": d.day_of_week, "label": d.label} for d in sorted(days, key=lambda d: d.day_of_week)],
    }


@router.get("")
def list_splits(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    splits = db.query(WorkoutSplit).filter(
        (WorkoutSplit.user_id.is_(None)) | (WorkoutSplit.user_id == user.id)
    ).all()

    result = []
    for split in splits:
        days = db.query(SplitDay).filter(SplitDay.split_id == split.id).all()
        result.append(_serialize_split(split, days))
    return result


@router.post("/{split_id}/select")
def select_split(split_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    split = db.get(WorkoutSplit, split_id)
    if split is None or (split.user_id is not None and split.user_id != user.id):
        raise HTTPException(status_code=404, detail="Split not found")

    if split.user_id is None:
        new_split = WorkoutSplit(user_id=user.id, name=split.name)
        db.add(new_split)
        db.flush()

        for day in db.query(SplitDay).filter(SplitDay.split_id == split.id).all():
            db.add(SplitDay(split_id=new_split.id, day_of_week=day.day_of_week, label=day.label))

        user.current_split_id = new_split.id
        db.commit()
        split = new_split
    else:
        user.current_split_id = split.id
        db.commit()

    days = db.query(SplitDay).filter(SplitDay.split_id == split.id).all()
    return _serialize_split(split, days)


@router.patch("/{split_id}/days/{day_of_week}")
def update_split_day(
    split_id: int,
    day_of_week: int,
    payload: UpdateSplitDayIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    split = db.get(WorkoutSplit, split_id)
    if split is None or split.user_id != user.id:
        raise HTTPException(status_code=404, detail="Split not found")

    day = db.query(SplitDay).filter(SplitDay.split_id == split_id, SplitDay.day_of_week == day_of_week).first()
    if day is None:
        raise HTTPException(status_code=404, detail="Day not found")

    day.label = payload.label
    db.commit()

    return {"day_of_week": day.day_of_week, "label": day.label}