from pydantic import BaseModel, ConfigDict

class PaymentBase(BaseModel):
    booking_id: int
    amount: float

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    razorpay_order_id: str
    currency: str
    status: str
    
    model_config = ConfigDict(from_attributes=True)