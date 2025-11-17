from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import (
    users, monitoring, alerts, dashboard,
    admin_dashboard, admin_ai_models, admin_users, 
    admin_sensors, admin_system, admin_counterfeit,
    kaggle_data
)
from .auth import get_password_hash  # ✅ Import password hashing function
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
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:3309", "http://127.0.0.1:3306"], # ⬅️ This list is correct
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

# Include Kaggle Data router
app.include_router(kaggle_data.router)
app.include_router(ai_predictions.router)

# ✅ --- Create Demo User on Startup (COMMENTED OUT TO PREVENT CONFLICT) ---
# @app.on_event("startup")
# def create_demo_user():
#     from . import models  # local import to avoid circular dependency
#     db = SessionLocal()
#     try:
#         existing_user = db.query(models.User).filter_by(email="user@pharma.com").first()
#         if not existing_user:
#             demo_user = models.User(
#                 email="user@pharma.com",
#                 username="pharma_user",
#                 hashed_password=get_password_hash("User@123"),
#                 company_name="PharmaCorp Inc.",
#                 user_type="user",
#                 is_active=True
#             )
#             db.add(demo_user)
#             db.commit()
#             db.refresh(demo_user)
#             print(f"   ✓ Created demo user: {demo_user.username}")
#         else:
#             print(f"   ⚠️ Demo user already exists: {existing_user.username}")
#     except Exception as e:
#         print(f"   ❌ Error creating demo user: {e}")
#         db.rollback()
#     finally:
#         db.close()
# ✅ --- End Demo User Block ---


@app.get("/")
def read_root():
    return {
        "message": "AI Medicine Monitoring System API",
        "status": "online",
        "version": "2.0.0",
        "features": "Kaggle Dataset Integration Enabled",
        "docs": "/docs",
        "user_endpoints": "/users, /monitoring, /alerts, /dashboard",
        "admin_endpoints": "/admin/*",
        "kaggle_endpoints": "/kaggle-data"
    }


@app.get("/health")
def health_check():
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "kaggle_integration": "active"
    }