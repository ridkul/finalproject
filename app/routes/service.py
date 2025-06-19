from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.service import Service as ServiceModel
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceUpdate, Service as ServiceSchema
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceSchema, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can create services"
        )
    
    new_service = ServiceModel(
        **service.model_dump(),
        provider_id=current_user.id
    )
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    return new_service

# Get all services (public endpoint)
@router.get("/", response_model=list[ServiceSchema])
async def get_all_services(
    db: AsyncSession = Depends(get_db),
    category: str = None,  # Optional filter
    location: str = None   # Optional filter
):
    query = select(ServiceModel)
    
    if category:
        query = query.where(ServiceModel.category.ilike(f"%{category}%"))
    
    if location:
        query = query.where(ServiceModel.location.ilike(f"%{location}%"))
    
    result = await db.execute(query)
    return result.scalars().all()

# Get services for current provider
@router.get("/my-services", response_model=list[ServiceSchema])
async def get_my_services(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can view their services"
        )
    
    query = select(ServiceModel).where(ServiceModel.provider_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()

# Get single service by ID (public)
@router.get("/{service_id}", response_model=ServiceSchema)
async def get_service(
    service_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(ServiceModel).where(ServiceModel.id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

# Update service (provider only)
@router.put("/{service_id}", response_model=ServiceSchema)
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(ServiceModel).where(ServiceModel.id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    
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
    
    await db.commit()
    await db.refresh(service)
    return service

# Delete service (provider only)
@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(ServiceModel).where(ServiceModel.id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    
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
    
    await db.delete(service)
    await db.commit()
    return