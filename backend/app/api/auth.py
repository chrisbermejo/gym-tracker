import os

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_user, get_db
from app.models import User


oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.environ["GOOGLE_CLIENT_ID"],
    client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

router = APIRouter(prefix="/auth")


@router.get("/google/login")
async def login(request: Request):
    redirect_uri = os.environ["GOOGLE_REDIRECT_URI"]
    return await oauth.google.authorize_redirect(request, redirect_uri)

#using authlib, it redirects us to the google sign in site using our google oauth information in the url parameters
#basically saying hey this user is trying to sign into this application
#once the user signs in, it redirect the users to the callback url with a temp auth code 

@router.get("/google/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    #this is basically a post request back to the google server using our google oauth information again (oauth) but with the new temp auth code
    #this completes the signin and gives us the user's information
    userinfo = token["userinfo"]

    user = db.query(User).filter_by(google_id=userinfo["sub"]).first()
    if user is None:
        user = User(google_id=userinfo["sub"], email=userinfo["email"], name=userinfo["name"])
        db.add(user)
        db.commit()
        db.refresh(user)

    request.session["user_id"] = user.id
    return RedirectResponse(url="http://localhost:5173/")


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "weight": float(user.weight) if user.weight is not None else None,
        "height": float(user.height) if user.height is not None else None,
        "onboarding_completed": user.onboarding_completed_at is not None,
    }


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"status": "ok"}