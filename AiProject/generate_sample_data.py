from app.database import SessionLocal
from app.models import KaggleMedicineData
from datetime import datetime, timedelta
import random

def generate_sample_data(count=100):
    """Generate sample medicine data for training"""
    
    db = SessionLocal()
    
    print(f"Generating {count} sample records...")
    
    medicines = ["Aspirin", "Paracetamol", "Ibuprofen", "Amoxicillin", "Metformin"]
    statuses = ["Good", "Good", "Good", "Degraded", "Counterfeit"]  # 60% Good
    
    for i in range(count):
        record = KaggleMedicineData(
            medicine_name=f"{random.choice(medicines)} {random.choice([250, 500, 1000])}mg",
            batch_id=f"BATCH{2024000 + i}",
            manufacturing_date=datetime.now() - timedelta(days=random.randint(30, 365)),
            expiry_date=datetime.now() + timedelta(days=random.randint(365, 730)),
            storage_temperature=random.uniform(2.0, 8.0),
            storage_humidity=random.uniform(45.0, 75.0),
            ph_level=random.uniform(6.5, 7.5),
            moisture_content=random.uniform(3.0, 7.0),
            impurity_percentage=random.uniform(0.1, 1.0),
            active_ingredient_concentration=random.uniform(90.0, 99.0),
            quality_status=random.choice(statuses),
            inspection_date=datetime.now(),
            manufacturer=f"Pharma{random.randint(1, 5)} Corp",
            country_of_origin=random.choice(["India", "USA", "UK", "Germany"])
        )
        db.add(record)
    
    db.commit()
    print(f"✓ Generated {count} sample records!")
    db.close()

if __name__ == "__main__":
    generate_sample_data(200)