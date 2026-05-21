from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from utils.auth import get_current_user
from services.openai_service import generate_nutrition_plan
from datetime import datetime
import uuid

router = APIRouter()

ACTIVITY = {"sedentary":1.2,"light":1.375,"moderate":1.55,"active":1.725,"very_active":1.9}

def calc_bmr(w,h,a,g): return (88.362+13.397*w+4.799*h-5.677*a) if g=="male" else (447.593+9.247*w+3.098*h-4.330*a)

def calc_targets(tdee, goal):
    if goal=="weight_loss": c=int(tdee*0.8)
    elif goal=="weight_gain": c=int(tdee*1.15)
    else: c=int(tdee*1.10)
    return {"calories":c,"protein":round(c*0.35/4,1),"carbs":round(c*0.40/4,1),"fats":round(c*0.25/9,1)}

@router.post("/generate")
async def generate(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.get("subscription","free") == "free":
        raise HTTPException(status_code=403, detail="Nutrition plan requires Pro subscription.")
    bmr = calc_bmr(data["weight"],data["height"],data["age"],data["gender"])
    tdee = bmr * ACTIVITY.get(data["activity_level"],1.55)
    targets = calc_targets(tdee, data["goal"])
    plan_data = await generate_nutrition_plan({**data,**targets,"target_calories":targets["calories"]})
    doc = {"plan_id":str(uuid.uuid4()),"user_id":str(current_user["_id"]),"bmr":round(bmr,1),"tdee":round(tdee,1),"target_calories":targets["calories"],"macros_split":targets,"days":plan_data.get("days",[]),"created_at":datetime.utcnow(),"active":True}
    await db.nutrition_plans.update_many({"user_id":str(current_user["_id"])},{"$set":{"active":False}})
    await db.nutrition_plans.insert_one(doc)
    doc.pop("_id",None)
    doc["created_at"]=doc["created_at"].isoformat()
    return doc

@router.get("/current")
async def current(db=Depends(get_db), current_user=Depends(get_current_user)):
    plan = await db.nutrition_plans.find_one({"user_id":str(current_user["_id"]),"active":True})
    if not plan: return {"plan":None}
    plan["_id"]=str(plan["_id"])
    plan["created_at"]=plan["created_at"].isoformat()
    return plan

@router.post("/food-log")
async def log_food(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    await db.food_logs.insert_one({"user_id":str(current_user["_id"]),"date":data["date"],"entries":data["entries"],"logged_at":datetime.utcnow()})
    return {"message":"Food logged!"}
