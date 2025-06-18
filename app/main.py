from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import auth, service
from app.models import user  # This is to ensure the model is registered

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

# Include the routers
app.include_router(auth.router, prefix="/api")
app.include_router(service.router, prefix="/api")

@app.get("/")
def home():
    return {"message": "Service Booking API"}