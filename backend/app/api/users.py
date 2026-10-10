from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas import OnboardingIn, UpdateSettingsIn

router = APIRouter(prefix="/users")


@router.patch("/me/onboarding")
def complete_onboarding(
    payload: OnboardingIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.weight = payload.weight
    user.height = payload.height
    user.unit_system = payload.unit_system
    user.onboarding_completed_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "weight": float(user.weight),
        "height": float(user.height),
        "unit_system": user.unit_system,
        "onboarding_completed": True,
    }


@router.patch("/me/settings")
def update_settings(
    payload: UpdateSettingsIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.unit_system = payload.unit_system
    db.commit()
    return {"unit_system": user.unit_system}