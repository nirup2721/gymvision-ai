import os, json
from openai import AsyncOpenAI
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def identify_equipment(image_base64):
    response = await client.chat.completions.create(model="gpt-4o",messages=[{"role":"user","content":[{"type":"text","text":"Identify this gym equipment. Return ONLY JSON: {\"name\":\"...\",\"description\":\"...\",\"muscle_groups\":[...],\"difficulty\":\"beginner|intermediate|advanced\"}"},{"type":"image_url","image_url":{"url":f"data:image/jpeg;base64,{image_base64}","detail":"low"}}]}],max_tokens=400)
    try: return json.loads(response.choices[0].message.content.strip())
    except: return {"name":"Gym Equipment","description":"A piece of gym equipment.","muscle_groups":["full body"],"difficulty":"beginner"}

async def generate_workout_plan(params):
    prompt = f"Create a 5-day workout plan for: Goal:{params.get('goal')}, Age:{params.get('age')}, Weight:{params.get('weight')}kg, Height:{params.get('height')}cm, Level:{params.get('fitness_level')}. Return ONLY JSON: {{\"days\":[{{\"day\":1,\"day_name\":\"Monday\",\"focus\":\"Chest\",\"duration_minutes\":45,\"exercises\":[{{\"name\":\"Push Up\",\"sets\":3,\"reps\":\"10-12\",\"rest_seconds\":60,\"muscle_group\":\"chest\",\"instructions\":\"...\",\"tips\":\"...\"}}]}}]}}"
    r = await client.chat.completions.create(model="gpt-4o",messages=[{"role":"user","content":prompt}],max_tokens=3000,response_format={"type":"json_object"})
    return json.loads(r.choices[0].message.content)

async def generate_nutrition_plan(params):
    style = "Indian meals (roti, dal, rice, sabzi)" if params.get("meal_style")=="indian" else "International meals"
    veg = "VEGETARIAN only" if params.get("dietary_preference")=="veg" else ("VEGAN only" if params.get("dietary_preference")=="vegan" else "Can include meat")
    prompt = f"Create 7-day meal plan: {params.get('target_calories')} calories/day, {veg}, {style}. Return ONLY JSON: {{\"days\":[{{\"day\":1,\"day_name\":\"Monday\",\"meals\":[{{\"meal_type\":\"breakfast\",\"name\":\"...\",\"ingredients\":[\"...\"],\"macros\":{{\"calories\":400,\"protein\":25,\"carbs\":45,\"fats\":12}},\"prep_time\":\"10 mins\"}}],\"daily_totals\":{{\"calories\":1800,\"protein\":140,\"carbs\":200,\"fats\":60}}}}]}}"
    r = await client.chat.completions.create(model="gpt-4o",messages=[{"role":"user","content":prompt}],max_tokens=4000,response_format={"type":"json_object"})
    return json.loads(r.choices[0].message.content)
