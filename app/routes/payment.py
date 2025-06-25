from app.services.cashfree_service import get_cashfree_client
from datetime import datetime
import json

# Create Cashfree order
@router.post("/create-order", response_model=PaymentResponse)
def create_payment_order(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ... booking verification ...
    
    payments, _ = get_cashfree_client()
    
    # Create order ID
    order_id = f"ORDER_{int(datetime.now().timestamp())}_{booking.id}"
    
    # Create order request
    order_request = {
        "order_id": order_id,
        "order_amount": float(payment_data.amount),
        "order_currency": "INR",
        "customer_details": {
            "customer_id": str(current_user.id),
            "customer_name": current_user.name,
            "customer_email": current_user.email,
            "customer_phone": ""  # Add if available
        },
        "order_meta": {
            "return_url": f"{os.getenv('FRONTEND_URL')}/payment/callback?booking_id={booking.id}"
        }
    }
    
    try:
        # Create Cashfree order
        response = payments.create_order(order_request)
        if response["status"] != "OK":
            raise HTTPException(status_code=500, detail="Payment gateway error")
        
        # Create payment record
        new_payment = Payment(
            booking_id=booking.id,
            amount=payment_data.amount,
            cashfree_order_id=order_id,
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
            "cashfree_order_id": new_payment.cashfree_order_id,
            "payment_link": response["payment_link"],
            "status": new_payment.status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cashfree error: {str(e)}")

# Verify payment (webhook)
@router.post("/webhook")
async def cashfree_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    # Get signature from header
    signature = request.headers.get("x-cf-signature")
    
    # Read raw body
    body = await request.body()
    
    # Verify signature
    payments, _ = get_cashfree_client()
    if not payments.verify_webhook_signature(body, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Process webhook
    data = await request.json()
    order_id = data["orderId"]
    
    # Update payment status
    payment = db.query(Payment).filter(
        Payment.cashfree_order_id == order_id
    ).first()
    
    if payment:
        payment.status = data["orderStatus"].lower()
        payment.cashfree_payment_id = data.get("referenceId", "")
        payment.payment_method = data.get("paymentMethod", "")
        
        # Update booking status
        if data["orderStatus"] == "PAID":
            payment.booking.status = "confirmed"
        
        db.commit()
    
    return {"status": "success"}