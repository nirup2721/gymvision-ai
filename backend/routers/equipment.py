from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from database import get_db
from utils.auth import get_current_user
from services.openai_service import identify_equipment
from services.runway_service import generate_equipment_video
import hashlib
from datetime import datetime
from bson import ObjectId

router = APIRouter()

def hash_image(b64): return hashlib.md5(b64[:500].encode()).hexdigest()

async def generate_video_bg(name, image_hash, scan_id, db):
    try:
        url = await generate_equipment_video(name)
        await db.equipment_cache.update_one({"image_hash": image_hash}, {"$set": {"video_url": url, "video_status": "ready"}})
        await db.equipment_scans.update_one({"_id": ObjectId(scan_id)}, {"$set": {"video_url": url, "video_status": "ready"}})
    except: pass

@router.post("/scan")
async def scan(data: dict, bg: BackgroundTasks, db=Depends(get_db), current_user=Depends(get_current_user)):
    sub = current_user.get("subscription","free")
    if sub == "free" and current_user.get("scans_used",0) >= current_user.get("scans_limit",3):
        raise HTTPException(status_code=403, detail="Free plan limit reached. Upgrade to Pro.")
    image_hash = hash_image(data["image_base64"])
    cached = await db.equipment_cache.find_one({"image_hash": image_hash})
    if cached:
        await db.users.update_one({"_id": current_user["_id"]}, {"$inc": {"scans_used": 1}})
        return {**cached, "_id": str(cached["_id"]), "cache_hit": True}
    eq = await identify_equipment(data["image_base64"])
    cache_doc = {"image_hash": image_hash, "equipment_name": eq["name"], "description": eq["description"], "muscle_groups": eq["muscle_groups"], "difficulty": eq["difficulty"], "video_url": None, "video_status": "generating", "created_at": datetime.utcnow()}
    await db.equipment_cache.insert_one(cache_doc)
    scan_doc = {"user_id": str(current_user["_id"]), "image_hash": image_hash, "equipment_name": eq["name"], "video_status": "generating", "video_url": None, "created_at": datetime.utcnow()}
    result = await db.equipment_scans.insert_one(scan_doc)
    await db.users.update_one({"_id": current_user["_id"]}, {"$inc": {"scans_used": 1}})
    if sub in ["pro","elite"]:
        bg.add_task(generate_video_bg, eq["name"], image_hash, str(result.inserted_id), db)
    return {"equipment_name": eq["name"], "description": eq["description"], "muscle_groups": eq["muscle_groups"], "difficulty": eq["difficulty"], "video_url": None, "video_status": "generating" if sub in ["pro","elite"] else "upgrade_required", "cache_hit": False}

@router.get("/history")
async def history(db=Depends(get_db), current_user=Depends(get_current_user)):
    scans = await db.equipment_scans.find({"user_id": str(current_user["_id"])}).sort("created_at",-1).limit(20).to_list(20)
    for s in scans: s["_id"] = str(s["_id"])
    return scans
