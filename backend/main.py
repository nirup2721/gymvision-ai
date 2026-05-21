from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routers import auth, equipment, workout, nutrition, payments, progress, user
from utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="GymVision AI API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(workout.router, prefix="/api/workout", tags=["Workout"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["Nutrition"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(user.router, prefix="/api/user", tags=["User"])

@app.get("/")
async def root():
    return {"message": "GymVision AI API is running 💪"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    # Write requirements.txt
Set-Content -Path "backend\requirements.txt" -Value @"
fastapi==0.115.0
uvicorn[standard]==0.30.6
motor==3.6.0
pymongo==4.10.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.1
openai==1.51.0
httpx==0.27.2
razorpay==1.4.1
stripe==10.11.0
python-multipart==0.0.12
pydantic[email]==2.9.2
"@

# Write .env.example
Set-Content -Path "backend\.env.example" -Value @"
OPENAI_API_KEY=sk-...
RUNWAY_API_KEY=...
MONGODB_URL=mongodb+srv://gymvision:PASSWORD@cluster0.obwyl30.mongodb.net/gymvision_ai?retryWrites=true&w=majority
JWT_SECRET=change-this-to-random-string
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
"@

# Write routers __init__
Set-Content -Path "backend\routers\__init__.py" -Value "# Routers package"

Write-Host "Done! requirements.txt and .env.example written!" -ForegroundColor Green
