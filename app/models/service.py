from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(50))
    location = Column(String(100))
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    provider = relationship("User", back_populates="services")
    bookings = relationship("Booking", back_populates="service")