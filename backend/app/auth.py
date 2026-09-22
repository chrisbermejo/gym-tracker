import os

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

from app.database import SessionLocal
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


@router.get("/google/callback?")
async def callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    #this is basically a post request back to the google server using our google oauth information again (oauth) but with the new temp auth code
    #this completes the signin and gives us the user's information
    userinfo = token["userinfo"]

    db = SessionLocal()
    try:
        user = db.query(User).filter_by(google_id=userinfo["sub"]).first()
        if user is None:
            user = User(google_id=userinfo["sub"], email=userinfo["email"], name=userinfo["name"])
            db.add(user)
            db.commit()
            db.refresh(user)
        request.session["user_id"] = user.id
    finally:
        db.close()

    return RedirectResponse(url="http://localhost:5173/")


@router.get("/me")
def me(request: Request):
    user_id = request.session.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    db = SessionLocal()
    try:
        user = db.get(User, user_id)
    finally:
        db.close()

    return {"id": user.id, "email": user.email, "name": user.name}


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"status": "ok"}