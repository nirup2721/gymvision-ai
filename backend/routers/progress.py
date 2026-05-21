from fastapi import APIRouter, Depends
from database import get_db
from utils.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/log")
async def log_progress(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    doc = {"user_id": str(current_user["_id"]), **data, "logged_at": datetime.utcnow()}
    await db.progress.insert_one(doc)
    return {"message": "Progress logged!"}

@router.get("/history")
async def get_history(db=Depends(get_db), current_user=Depends(get_current_user)):
    entries = await db.progress.find({"user_id": str(current_user["_id"])}).sort("date",-1).limit(90).to_list(90)
    for e in entries: e["_id"] = str(e["_id"])
    return entries

@router.get("/stats")
async def get_stats(db=Depends(get_db), current_user=Depends(get_current_user)):
    entries = await db.progress.find({"user_id": str(current_user["_id"])}).sort("date",1).to_list(None)
    weights = [e["weight"] for e in entries if e.get("weight")]
    workouts = sum(1 for e in entries if e.get("workout_completed"))
    return {"total_entries": len(entries), "weight_change": round(weights[-1]-weights[0],1) if len(weights)>=2 else 0, "current_weight": weights[-1] if weights else None, "starting_weight": weights[0] if weights else None, "workouts_completed": workouts, "streak": current_user.get("streak",0)}
