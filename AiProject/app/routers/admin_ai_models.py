from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_admin_user
import json

router = APIRouter(prefix="/admin/ai-models", tags=["admin-ai-models"])

@router.post("/", response_model=schemas.AIModel)
def create_ai_model(
    model: schemas.AIModelCreate,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new AI model"""
    db_model = crud.create_ai_model(db, model)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="CREATE_AI_MODEL",
        table_name="ai_models",
        record_id=db_model.id,
        new_value=json.dumps({"name": model.model_name, "type": model.model_type})
    )
    
    return db_model

@router.get("/", response_model=List[schemas.AIModel])
def get_all_ai_models(
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all AI models"""
    return crud.get_all_ai_models(db)

@router.get("/{model_id}", response_model=schemas.AIModel)
def get_ai_model(
    model_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific AI model by ID"""
    model = crud.get_ai_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI Model not found")
    return model

@router.put("/{model_id}/train")
def train_ai_model(
    model_id: int,
    accuracy: Optional[float] = None,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update AI model training status"""
    model = crud.get_ai_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI Model not found")
    
    # Update model status to training
    updated_model = crud.update_ai_model(db, model_id, accuracy=accuracy, status="training")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="TRAIN_AI_MODEL",
        table_name="ai_models",
        record_id=model_id,
        new_value=f"Training started with accuracy: {accuracy}"
    )
    
    # Here you would trigger the actual AI model training
    # For now, we'll just update the status
    
    return {"message": "AI model training initiated", "model": updated_model}

@router.put("/{model_id}/status")
def update_model_status(
    model_id: int,
    status: str,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update AI model status (active, training, inactive)"""
    model = crud.update_ai_model(db, model_id, status=status)
    if not model:
        raise HTTPException(status_code=404, detail="AI Model not found")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="UPDATE_MODEL_STATUS",
        table_name="ai_models",
        record_id=model_id,
        new_value=status
    )
    
    return {"message": f"Model status updated to {status}", "model": model}

@router.post("/{model_id}/training-data", response_model=schemas.TrainingData)
def add_training_data(
    model_id: int,
    training_data: schemas.TrainingDataCreate,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Add training data to an AI model"""
    # Verify model exists
    model = crud.get_ai_model_by_id(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI Model not found")
    
    db_training_data = crud.create_training_data(db, training_data)
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="ADD_TRAINING_DATA",
        table_name="training_data",
        record_id=db_training_data.id
    )
    
    return db_training_data

@router.get("/{model_id}/training-data", response_model=List[schemas.TrainingData])
def get_model_training_data(
    model_id: int,
    skip: int = 0,
    limit: int = 100,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get training data for a specific AI model"""
    return crud.get_training_data_by_model(db, model_id, skip, limit)

@router.put("/training-data/{data_id}/validate")
def validate_training_data(
    data_id: int,
    admin_user: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Validate training data"""
    data = crud.validate_training_data(db, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Training data not found")
    
    # Log the action
    crud.create_audit_log(
        db,
        user_id=admin_user.id,
        action="VALIDATE_TRAINING_DATA",
        table_name="training_data",
        record_id=data_id
    )
    
    return {"message": "Training data validated", "data": data}