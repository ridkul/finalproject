from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

# Add Cashfree specific fields
class Payment(Base):
    # ... existing fields ...
    cashfree_order_id = Column(String)
    cashfree_payment_id = Column(String)
    cashfree_signature = Column(String)
    payment_method = Column(String)  # UPI, card, netbanking, etc.