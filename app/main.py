from fastapi import FastAPI
from app.database import engine, Base
from app.routes import auth
from app.models import user  # This is to ensure the model is registered
app = FastAPI()
# Create the database tables
Base.metadata.create_all(bind=engine)
# Include the auth router
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Service Booking API"}