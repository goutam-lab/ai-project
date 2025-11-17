from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import (
    users, monitoring, alerts, dashboard,
    admin_dashboard, admin_ai_models, admin_users, 
    admin_sensors, admin_system, admin_counterfeit,
    kaggle_data,
    admin_products  # <-- 1. IMPORT IT HERE
)
from .auth import get_password_hash
from .routers import ai_predictions

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI Medicine Monitoring API",
    description="Backend API for AI-powered medicine and consumables monitoring system",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", 
        "http://127.0.0.1:8080",
        "http://localhost:5173", 
        "http://localhost:3309", 
        "http://127.0.0.1:3306"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include User routers
app.include_router(users.router)
app.include_router(monitoring.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)

# Include Admin routers
app.include_router(admin_dashboard.router)
app.include_router(admin_ai_models.router)
app.include_router(admin_users.router)
app.include_router(admin_sensors.router)
app.include_router(admin_system.router)
app.include_router(admin_counterfeit.router)
app.include_router(admin_products.router)  # <-- 2. INCLUDE IT HERE

# Include Kaggle Data router
app.include_router(kaggle_data.router)
app.include_router(ai_predictions.router)


@app.get("/")
def read_root():
    return {
        "message": "AI Medicine Monitoring System API",
        "status": "online",
        "version": "2.0.0",
        "docs": "/docs",
    }

# (The rest of your main.py file...)

@app.get("/health")
def health_check():
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "kaggle_integration": "active"
    }