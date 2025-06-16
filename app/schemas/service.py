from pydantic import BaseModel, ConfigDict
from typing import Optional

class ServiceBase(BaseModel):
    title: str
    description: str
    price: float
    category: Optional[str] = None
    location: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    provider_id: int
    
    model_config = ConfigDict(from_attributes=True)