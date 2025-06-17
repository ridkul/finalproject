from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum

class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class BookingBase(BaseModel):
    service_id: int
    booking_date: datetime
    booking_time: str
    notes: str | None = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: BookingStatus
    notes: str | None = None

class Booking(BookingBase):
    id: int
    user_id: int
    provider_id: int
    status: BookingStatus
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)