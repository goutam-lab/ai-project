from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import (
    users, 
    monitoring, 
    alerts, 
    dashboard,
    admin_dashboard, 
    admin_ai_models, 
    admin_users, 
    admin_sensors, 
    admin_system, 
    admin_counterfeit,
    admin_products,
    kaggle_data,
    ai_predictions,
    chat  # <--- NEW: Import the chat router
)
from .auth import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI Medicine Monitoring API",
    description="Backend API for AI-powered medicine and consumables monitoring system with Mistral AI integration",
    version="2.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", 
        "[http://127.0.0.1:8080](http://127.0.0.1:8080)",
        "http://localhost:5173", 
        "[http://127.0.0.1:5173](http://127.0.0.1:5173)",
        "http://localhost:3000",
        "[http://127.0.0.1:3306](http://127.0.0.1:3306)",
        "http://localhost:3309"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---

# Core Functionality
app.include_router(users.router)
app.include_router(monitoring.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)

# Admin Modules
app.include_router(admin_dashboard.router)
app.include_router(admin_ai_models.router)
app.include_router(admin_users.router)
app.include_router(admin_sensors.router)
app.include_router(admin_system.router)
app.include_router(admin_counterfeit.router)
app.include_router(admin_products.router)

# AI & Data Modules
app.include_router(kaggle_data.router)
app.include_router(ai_predictions.router)
app.include_router(chat.router) # <--- NEW: Register the chat router

@app.get("/")
def read_root():
    return {
        "message": "AI Medicine Monitoring System API",
        "status": "online",
        "version": "2.1.0",
        "docs": "/docs",
    }

@app.get("/health")
def health_check():
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_services": "active"
    }