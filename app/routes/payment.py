import razorpay
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Payment, Booking
from app.schemas import PaymentCreate, PaymentResponse
from app.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

# Initialize Razorpay client
client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

@router.post("/create-order", response_model=PaymentResponse)
def create_payment_order(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify booking
    booking = db.query(Booking).filter(
        Booking.id == payment_data.booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Create Razorpay order
    order_data = {
        "amount": int(payment_data.amount * 100),  # Razorpay expects paise
        "currency": "INR",
        "receipt": f"booking_{booking.id}",
        "payment_capture": 1  # Auto-capture payment
    }
    
    try:
        razorpay_order = client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")
    
    # Create payment record
    new_payment = Payment(
        booking_id=booking.id,
        amount=payment_data.amount,
        razorpay_order_id=razorpay_order["id"],
        status="created"
    )
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    return {
        "id": new_payment.id,
        "booking_id": new_payment.booking_id,
        "amount": new_payment.amount,
        "currency": "INR",
        "razorpay_order_id": new_payment.razorpay_order_id,
        "status": new_payment.status
    }

@router.post("/verify")
def verify_payment(
    payment_id: str,
    signature: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get payment record
    payment = db.query(Payment).filter(
        Payment.razorpay_payment_id == payment_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    # Verify payment signature
    params_dict = {
        "razorpay_order_id": payment.razorpay_order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": signature
    }
    
    try:
        client.utility.verify_payment_signature(params_dict)
        
        # Update payment record
        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = "success"
        
        # Update booking status
        payment.booking.status = "confirmed"
        
        db.commit()
        
        return {"status": "success", "message": "Payment verified"}
    except razorpay.errors.SignatureVerificationError:
        payment.status = "failed"
        db.commit()
        return {"status": "error", "message": "Invalid payment signature"}