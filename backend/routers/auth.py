from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

def serialize_user(user):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "country": user.get("country","IN"), "subscription": user.get("subscription","free"), "profile": user.get("profile",{}), "scans_used": user.get("scans_used",0), "scans_limit": user.get("scans_limit",3), "streak": user.get("streak",0)}

@router.post("/register")
async def register(data: dict, db=Depends(get_db)):
    if await db.users.find_one({"email": data["email"]}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {"name": data["name"], "email": data["email"], "password": hash_password(data["password"]), "country": data.get("country","IN"), "subscription": "free", "scans_used": 0, "scans_limit": 3, "profile": {}, "streak": 0, "created_at": datetime.utcnow()}
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(doc)}

@router.post("/login")
async def login(data: dict, db=Depends(get_db)):
    user = await db.users.find_one({"email": data["email"]})
    if not user or not verify_password(data["password"], user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return serialize_user(current_user)
