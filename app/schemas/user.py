from pydantic import BaseModel, EmailStr, ConfigDict  # ADD ConfigDict HERE
from enum import Enum

class UserRole(str, Enum):
    user = "user"
    provider = "provider"

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    name: str
    password: str
    role: UserRole

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    name: str
    role: UserRole

    # UPDATE THIS CONFIG
    model_config = ConfigDict(from_attributes=True)  # This replaces orm_mode

class UserInDB(UserOut):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str
    
class MyModel(BaseModel):
    field: str
    
    model_config = ConfigDict(from_attributes=True)