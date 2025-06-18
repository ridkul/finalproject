from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from fastapi.concurrency import run_in_threadpool
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token, PasswordResetRequest, PasswordReset, UserLogin
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_password_reset_token, verify_reset_token
from app.utils.email import send_welcome_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
async def register(
    user: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Check for existing user - using async syntax
    query = select(exists().where(User.email == user.email))
    result = await db.execute(query)
    if result.scalar():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password asynchronously
    hashed_password = await run_in_threadpool(hash_password, user.password)
    
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    
    db.add(new_user)
    await db.commit()  # Use commit instead of flush in async context
    await db.refresh(new_user)  # Refresh to get the new user's data
    
    # Move email sending to background
    if user.role == "provider":
        background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    return new_user

# UPDATED LOGIN ENDPOINT TO USE UserLogin SCHEMA
@router.post("/login", response_model=Token)
async def login(user_login: UserLogin, db: AsyncSession = Depends(get_db)):  # Changed parameter
    user = db.query(User).filter(User.email == user_login.email).first()
    if not user or not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "If your email exists, you'll receive a reset link"}
    
    reset_token = create_password_reset_token(user.email)
    background_tasks.add_task(send_password_reset_email, user.email, reset_token)
    
    return {"message": "Password reset email sent if account exists"}

@router.post("/reset-password")
def reset_password(request: PasswordReset, db: AsyncSession = Depends(get_db)):
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    return {"message": "Password has been reset successfully"}


