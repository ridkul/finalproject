from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_date = Column(DateTime, nullable=False)
    booking_time = Column(String(20), nullable=False)  # HH:MM format
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String(500), nullable=True)

    service = relationship("Service", back_populates="bookings")
    user = relationship("User", foreign_keys=[user_id], back_populates="bookings")
    provider = relationship("User", foreign_keys=[provider_id])