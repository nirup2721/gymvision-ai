from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from utils.auth import get_current_user
from services.openai_service import generate_workout_plan
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/generate")
async def generate(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    plan_data = await generate_workout_plan(data)
    doc = {"plan_id": str(uuid.uuid4()), "user_id": str(current_user["_id"]), "goal": data.get("goal"), "fitness_level": data.get("fitness_level"), "days": plan_data.get("days",[]), "created_at": datetime.utcnow(), "active": True}
    await db.workout_plans.update_many({"user_id": str(current_user["_id"])}, {"$set": {"active": False}})
    await db.workout_plans.insert_one(doc)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc

@router.get("/current")
async def current(db=Depends(get_db), current_user=Depends(get_current_user)):
    plan = await db.workout_plans.find_one({"user_id": str(current_user["_id"]), "active": True}, sort=[("created_at",-1)])
    if not plan: return {"plan": None}
    plan["_id"] = str(plan["_id"])
    plan["created_at"] = plan["created_at"].isoformat()
    return plan

@router.post("/complete-day/{day}")
async def complete_day(day: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": {"last_workout": datetime.utcnow()}, "$inc": {"streak": 1}})
    await db.workout_completions.insert_one({"user_id": str(current_user["_id"]), "day": day, "completed_at": datetime.utcnow()})
    return {"message": "Workout complete!"}
