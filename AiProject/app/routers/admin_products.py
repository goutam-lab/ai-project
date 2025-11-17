from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import SessionLocal

router = APIRouter(
    prefix="/admin/products",
    tags=["Admin - Products"],
    # You might want to add admin-only dependency here later
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.Product]) # Assuming you have a Product schema
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all products.
    """
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

# Add other CRUD operations here (create, update, delete) as needed