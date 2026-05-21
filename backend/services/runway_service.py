import os, httpx, asyncio
from utils.logger import logger

async def generate_equipment_video(equipment_name):
    key = os.getenv("RUNWAY_API_KEY")
    if not key: return None
    headers = {"Authorization":f"Bearer {key}","Content-Type":"application/json","X-Runway-Version":"2024-11-06"}
    prompt = f"Professional fitness trainer demonstrating correct form using {equipment_name} in a modern gym. Clear shots showing proper technique."
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post("https://api.dev.runwayml.com/v1/image_to_video",headers=headers,json={"model":"gen4_turbo","promptText":prompt,"duration":10,"ratio":"1280:720"})
        r.raise_for_status()
        task_id = r.json().get("id")
        if not task_id: return None
        for _ in range(60):
            await asyncio.sleep(5)
            s = await c.get(f"https://api.dev.runwayml.com/v1/tasks/{task_id}",headers=headers)
            data = s.json()
            if data.get("status") == "SUCCEEDED":
                out = data.get("output",[])
                return out[0] if out else None
            if data.get("status") == "FAILED": return None
    return None
