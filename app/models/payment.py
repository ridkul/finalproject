from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    razorpay_order_id = Column(String, nullable=False)
    razorpay_payment_id = Column(String)
    razorpay_signature = Column(String)
    status = Column(String(20), default="created")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    booking = relationship("Booking", back_populates="payment")