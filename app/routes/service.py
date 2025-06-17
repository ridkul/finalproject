from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Service, User
from app.schemas import ServiceCreate, ServiceUpdate, Service
from app.auth import get_current_user

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=Service, status_code=status.HTTP_201_CREATED)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can create services"
        )
    
    new_service = Service(
        **service.model_dump(),
        provider_id=current_user.id
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

# Get all services (public endpoint)
@router.get("/", response_model=list[Service])
def get_all_services(
    db: Session = Depends(get_db),
    category: str = None,  # Optional filter
    location: str = None   # Optional filter
):
    query = db.query(Service)
    
    if category:
        query = query.filter(Service.category.ilike(f"%{category}%"))
    
    if location:
        query = query.filter(Service.location.ilike(f"%{location}%"))
    
    return query.all()

# Get services for current provider
@router.get("/my-services", response_model=list[Service])
def get_my_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can view their services"
        )
    
    return db.query(Service).filter(Service.provider_id == current_user.id).all()

# Get single service by ID (public)
@router.get("/{service_id}", response_model=Service)
def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

# Update service (provider only)
@router.put("/{service_id}", response_model=Service)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(Service).filter(Service.id == service_id).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if service.provider_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this service"
        )
    
    # Update only provided fields
    update_data = service_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(service, key, value)
    
    db.commit()
    db.refresh(service)
    return service

# Delete service (provider only)
@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(Service).filter(Service.id == service_id).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if service.provider_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this service"
        )
    
    db.delete(service)
    db.commit()
    return