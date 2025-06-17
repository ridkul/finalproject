from pydantic import BaseModel, ConfigDict
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    receiver_id: int

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    read: bool
    
    model_config = ConfigDict(from_attributes=True)