from fastapi import APIRouter, Depends
from database import get_db
from utils.auth import get_current_user

router = APIRouter()

@router.put("/profile")
async def update_profile(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    update = {}
    if "name" in data: update["name"] = data["name"]
    if "profile" in data:
        for k, v in data["profile"].items():
            update[f"profile.{k}"] = v
    if update:
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": update})
    return {"message": "Profile updated"}

@router.get("/dashboard-stats")
async def dashboard_stats(db=Depends(get_db), current_user=Depends(get_current_user)):
    scans = await db.equipment_scans.count_documents({"user_id": str(current_user["_id"])})
    workouts = await db.workout_completions.count_documents({"user_id": str(current_user["_id"])})
    has_workout = bool(await db.workout_plans.find_one({"user_id": str(current_user["_id"]), "active": True}))
    has_nutrition = bool(await db.nutrition_plans.find_one({"user_id": str(current_user["_id"]), "active": True}))
    return {"name": current_user.get("name"), "subscription": current_user.get("subscription","free"), "streak": current_user.get("streak",0), "scans_used": current_user.get("scans_used",0), "scans_limit": current_user.get("scans_limit",3), "total_scans": scans, "workouts_completed": workouts, "has_workout_plan": has_workout, "has_nutrition_plan": has_nutrition}
