import pandas as pd
import numpy as np
from pathlib import Path
from sqlalchemy import create_engine, text
from app.database import SessionLocal, engine
from app import models
from datetime import datetime, timedelta
import json

def load_csv_files():
    """Load all CSV files from the dataset"""
    
    data_dir = Path('data/kaggle_dataset')
    csv_files = list(data_dir.glob('*.csv'))
    
    if not csv_files:
        print("❌ No CSV files found in data/kaggle_dataset/")
        return None
    
    print(f"✓ Found {len(csv_files)} CSV file(s)")
    
    dataframes = {}
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file)
            dataframes[csv_file.stem] = df
            print(f"  ✓ Loaded: {csv_file.name} ({len(df)} rows)")
        except Exception as e:
            print(f"  ❌ Error loading {csv_file.name}: {e}")
    
    return dataframes

def clean_data(df):
    """Clean and prepare data for import"""
    
    print("\n🧹 Cleaning data...")
    
    # Remove duplicates
    original_count = len(df)
    df = df.drop_duplicates()
    print(f"  ✓ Removed {original_count - len(df)} duplicates")
    
    # Handle missing values
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].mean())
    
    # Handle missing categorical values
    categorical_columns = df.select_dtypes(include=['object']).columns
    for col in categorical_columns:
        df[col] = df[col].fillna('Unknown')
    
    print(f"  ✓ Cleaned {len(df)} rows")
    
    return df

def map_columns(df):
    """
    Map dataset columns to our database schema
    Adjust this based on actual dataset columns
    """
    
    # Common column name variations
    column_mapping = {
        # Medicine identification
        'Medicine_Name': 'medicine_name',
        'Drug_Name': 'medicine_name',
        'Product_Name': 'medicine_name',
        'medicine_name': 'medicine_name',
        
        # Batch information
        'Batch_ID': 'batch_id',
        'Batch_Number': 'batch_id',
        'batch_id': 'batch_id',
        
        # Dates
        'Manufacturing_Date': 'manufacturing_date',
        'Mfg_Date': 'manufacturing_date',
        'Expiry_Date': 'expiry_date',
        'Exp_Date': 'expiry_date',
        
        # Chemical properties
        'pH': 'ph_level',
        'pH_Level': 'ph_level',
        'Moisture': 'moisture_content',
        'Moisture_Content': 'moisture_content',
        'Impurity': 'impurity_percentage',
        'Active_Ingredient': 'active_ingredient_concentration',
        
        # Physical properties
        'Weight': 'tablet_weight',
        'Tablet_Weight': 'tablet_weight',
        'Thickness': 'tablet_thickness',
        'Hardness': 'hardness',
        'Friability': 'friability',
        
        # Storage
        'Temperature': 'storage_temperature',
        'Storage_Temperature': 'storage_temperature',
        'Humidity': 'storage_humidity',
        'Storage_Humidity': 'storage_humidity',
        
        # Quality
        'Quality': 'quality_status',
        'Quality_Status': 'quality_status',
        'Status': 'quality_status',
        
        # Other
        'Manufacturer': 'manufacturer',
        'Country': 'country_of_origin',
    }
    
    # Rename columns
    df = df.rename(columns=column_mapping)
    
    return df

def import_to_mysql(df, db_session):
    """Import data to MySQL database"""
    
    print("\n📤 Importing to MySQL...")
    
    imported_count = 0
    error_count = 0
    
    for index, row in df.iterrows():
        try:
            # Prepare data
            data = {
                'medicine_name': str(row.get('medicine_name', 'Unknown')),
                'batch_id': str(row.get('batch_id', f'BATCH_{index}')),
                'manufacturing_date': parse_date(row.get('manufacturing_date')),
                'expiry_date': parse_date(row.get('expiry_date')),
                
                # Chemical properties
                'ph_level': parse_float(row.get('ph_level')),
                'moisture_content': parse_float(row.get('moisture_content')),
                'impurity_percentage': parse_float(row.get('impurity_percentage')),
                'active_ingredient_concentration': parse_float(row.get('active_ingredient_concentration')),
                
                # Physical properties
                'tablet_weight': parse_float(row.get('tablet_weight')),
                'tablet_thickness': parse_float(row.get('tablet_thickness')),
                'hardness': parse_float(row.get('hardness')),
                'friability': parse_float(row.get('friability')),
                
                # Storage
                'storage_temperature': parse_float(row.get('storage_temperature')),
                'storage_humidity': parse_float(row.get('storage_humidity')),
                
                # Quality
                'quality_status': str(row.get('quality_status', 'Unknown')),
                'inspection_date': datetime.now().date(),
                
                # Other
                'manufacturer': str(row.get('manufacturer', 'Unknown')),
                'country_of_origin': str(row.get('country_of_origin', 'Unknown')),
            }
            
            # Create database record
            kaggle_data = models.KaggleMedicineData(**data)
            db_session.add(kaggle_data)
            
            imported_count += 1
            
            # Commit in batches
            if imported_count % 100 == 0:
                db_session.commit()
                print(f"  ✓ Imported {imported_count} records...")
        
        except Exception as e:
            error_count += 1
            print(f"  ❌ Error importing row {index}: {e}")
            continue
    
    # Final commit
    db_session.commit()
    
    print(f"\n✅ Import complete!")
    print(f"  ✓ Successfully imported: {imported_count}")
    print(f"  ❌ Errors: {error_count}")
    
    return imported_count

def parse_date(date_value):
    """Parse date from various formats"""
    if pd.isna(date_value) or date_value is None:
        return None
    
    try:
        return pd.to_datetime(date_value).date()
    except:
        return None

def parse_float(value):
    """Parse float value"""
    if pd.isna(value) or value is None:
        return None
    
    try:
        return float(value)
    except:
        return None

def link_to_products(db_session):
    """
    Link imported Kaggle data to existing products in our system
    based on medicine name and batch number
    """
    
    print("\n🔗 Linking to existing products...")
    
    kaggle_records = db_session.query(models.KaggleMedicineData).filter(
        models.KaggleMedicineData.product_id == None
    ).all()
    
    linked_count = 0
    
    for record in kaggle_records:
        # Try to find matching product
        product = db_session.query(models.Product).filter(
            models.Product.name.like(f"%{record.medicine_name}%"),
            models.Product.batch_number == record.batch_id
        ).first()
        
        if product:
            record.product_id = product.id
            linked_count += 1
    
    db_session.commit()
    
    print(f"  ✓ Linked {linked_count} records to existing products")

def generate_statistics(db_session):
    """Generate statistics from imported data"""
    
    print("\n📊 Generating statistics...")
    
    total_records = db_session.query(models.KaggleMedicineData).count()
    
    # Quality distribution
    quality_dist = db_session.execute(text("""
        SELECT quality_status, COUNT(*) as count 
        FROM kaggle_medicine_data 
        GROUP BY quality_status
    """)).fetchall()
    
    print(f"\n  Total records: {total_records}")
    print(f"\n  Quality Distribution:")
    for status, count in quality_dist:
        percentage = (count / total_records * 100) if total_records > 0 else 0
        print(f"    {status}: {count} ({percentage:.1f}%)")
    
    # Average values
    avg_stats = db_session.execute(text("""
        SELECT 
            AVG(ph_level) as avg_ph,
            AVG(moisture_content) as avg_moisture,
            AVG(storage_temperature) as avg_temp,
            AVG(storage_humidity) as avg_humidity
        FROM kaggle_medicine_data
        WHERE ph_level IS NOT NULL
    """)).fetchone()
    
    if avg_stats:
        print(f"\n  Average Values:")
        print(f"    pH Level: {avg_stats[0]:.2f}" if avg_stats[0] else "    pH Level: N/A")
        print(f"    Moisture: {avg_stats[1]:.2f}%" if avg_stats[1] else "    Moisture: N/A")
        print(f"    Temperature: {avg_stats[2]:.2f}°C" if avg_stats[2] else "    Temperature: N/A")
        print(f"    Humidity: {avg_stats[3]:.2f}%" if avg_stats[3] else "    Humidity: N/A")

def main():
    print("=" * 60)
    print("KAGGLE DATASET IMPORTER")
    print("Medicine Quality Assessment Dataset → MySQL")
    print("=" * 60)
    
    # Load CSV files
    dataframes = load_csv_files()
    if not dataframes:
        return
    
    # Process each dataframe
    db = SessionLocal()
    
    try:
        for name, df in dataframes.items():
            print(f"\n\n{'=' * 60}")
            print(f"Processing: {name}")
            print('=' * 60)
            
            # Show columns
            print(f"\n📋 Dataset columns:")
            for i, col in enumerate(df.columns, 1):
                print(f"  {i}. {col}")
            
            # Clean data
            df = clean_data(df)
            
            # Map columns
            df = map_columns(df)
            
            # Import to MySQL
            import_to_mysql(df, db)
        
        # Link to products
        link_to_products(db)
        
        # Generate statistics
        generate_statistics(db)
        
        print("\n" + "=" * 60)
        print("✅ IMPORT COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()