from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    user = "user"
    provider = "provider"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(Enum(UserRole), default="user")
    
    # If you have relationships, add this:
    __mapper_args__ = {
        "eager_defaults": True
    }
# Add this to the User class
    services = relationship("Service", back_populates="provider")
