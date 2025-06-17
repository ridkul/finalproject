from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token, PasswordResetRequest, PasswordReset, UserLogin  # ADD UserLogin
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_password_reset_token, verify_reset_token
from app.utils import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# UPDATED LOGIN ENDPOINT TO USE UserLogin SCHEMA
@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):  # Changed parameter
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
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "If your email exists, you'll receive a reset link"}
    
    reset_token = create_password_reset_token(user.email)
    background_tasks.add_task(send_password_reset_email, user.email, reset_token)
    
    return {"message": "Password reset email sent if account exists"}

@router.post("/reset-password")
def reset_password(request: PasswordReset, db: Session = Depends(get_db)):
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    return {"message": "Password has been reset successfully"}


