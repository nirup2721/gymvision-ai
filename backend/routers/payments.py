from fastapi import APIRouter, HTTPException, Depends, Request
from database import get_db
from utils.auth import get_current_user
from datetime import datetime, timedelta
import os, hmac, hashlib

router = APIRouter()
PLANS = {"pro_monthly":{"INR":99900,"USD":1200,"name":"Pro Monthly","days":30},"elite_annual":{"INR":799900,"USD":8900,"name":"Elite Annual","days":365}}

@router.post("/razorpay/create-order")
async def razorpay_order(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    import razorpay
    client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"),os.getenv("RAZORPAY_KEY_SECRET")))
    plan = PLANS[data["plan"]]
    order = client.order.create({"amount":plan["INR"],"currency":"INR","receipt":f"gv_{str(current_user['_id'])}","notes":{"user_id":str(current_user["_id"]),"plan":data["plan"]}})
    return {"order_id":order["id"],"amount":plan["INR"],"currency":"INR","key_id":os.getenv("RAZORPAY_KEY_ID"),"plan_name":plan["name"]}

@router.post("/razorpay/verify")
async def razorpay_verify(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    body = f"{data['razorpay_order_id']}|{data['razorpay_payment_id']}"
    expected = hmac.new(os.getenv("RAZORPAY_WEBHOOK_SECRET","").encode(),body.encode(),hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,data["razorpay_signature"]): raise HTTPException(400,"Invalid signature")
    plan = PLANS.get(data["plan"],{})
    sub = "elite" if "elite" in data["plan"] else "pro"
    await db.users.update_one({"_id":current_user["_id"]},{"$set":{"subscription":sub,"subscription_expiry":datetime.utcnow()+timedelta(days=plan.get("days",30)),"scans_limit":999999}})
    return {"message":"Payment verified!","subscription":sub}

@router.post("/stripe/create-session")
async def stripe_session(data: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    plan = PLANS[data["plan"]]
    fe = os.getenv("FRONTEND_URL","http://localhost:3000")
    session = stripe.checkout.Session.create(payment_method_types=["card"],line_items=[{"price_data":{"currency":"usd","product_data":{"name":f"GymVision AI {plan['name']}"},"unit_amount":plan["USD"]},"quantity":1}],mode="payment",success_url=f"{fe}/dashboard?payment=success",cancel_url=f"{fe}/pricing",metadata={"user_id":str(current_user["_id"]),"plan":data["plan"]})
    return {"session_id":session.id,"url":session.url}

@router.get("/status")
async def status(current_user=Depends(get_current_user)):
    return {"subscription":current_user.get("subscription","free"),"scans_used":current_user.get("scans_used",0),"scans_limit":current_user.get("scans_limit",3)}
