from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from utils.logger import logger
load_dotenv()

class Database:
    client = None
    db = None

db_instance = Database()

async def connect_db():
    db_instance.client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db_instance.db = db_instance.client["gymvision_ai"]
    await db_instance.client.admin.command("ping")
    logger.info("Connected to MongoDB")
    await create_indexes()

async def close_db():
    if db_instance.client:
        db_instance.client.close()

async def create_indexes():
    db = db_instance.db
    await db.users.create_index("email", unique=True)
    await db.equipment_cache.create_index("image_hash", unique=True)

def get_db():
    return db_instance.db
