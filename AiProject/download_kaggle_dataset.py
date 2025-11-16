import os
import zipfile
import kaggle
from pathlib import Path

def setup_kaggle_credentials():
    """
    Setup Kaggle API credentials
    
    Instructions:
    1. Go to https://www.kaggle.com/account
    2. Scroll to API section
    3. Click "Create New API Token"
    4. Download kaggle.json
    5. Place it in: ~/.kaggle/kaggle.json (Linux/Mac) or C:\\Users\\YourName\\.kaggle\\kaggle.json (Windows)
    """
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_json = kaggle_dir / 'kaggle.json'
    
    if not kaggle_json.exists():
        print("❌ Kaggle credentials not found!")
        print("\nPlease follow these steps:")
        print("1. Go to https://www.kaggle.com/account")
        print("2. Scroll to 'API' section")
        print("3. Click 'Create New API Token'")
        print("4. Download kaggle.json")
        print(f"5. Place it in: {kaggle_dir}")
        return False
    
    # Set permissions (Unix-like systems)
    if os.name != 'nt':
        os.chmod(kaggle_json, 0o600)
    
    print("✓ Kaggle credentials found!")
    return True

def download_dataset():
    """Download the medicine quality assessment dataset"""
    
    print("\n📥 Downloading Kaggle dataset...")
    
    # Create data directory
    data_dir = Path('data/kaggle_dataset')
    data_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Download dataset
        kaggle.api.dataset_download_files(
            'chaitanya205/medicine-quality-assessment-dataset',
            path=str(data_dir),
            unzip=True
        )
        
        print(f"✓ Dataset downloaded to: {data_dir}")
        
        # List downloaded files
        print("\n📁 Downloaded files:")
        for file in data_dir.glob('*'):
            print(f"   - {file.name}")
        
        return data_dir
        
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("KAGGLE DATASET DOWNLOADER")
    print("Medicine Quality Assessment Dataset")
    print("=" * 60)
    
    if setup_kaggle_credentials():
        dataset_path = download_dataset()
        if dataset_path:
            print(f"\n✅ Dataset ready at: {dataset_path}")
            print("\nNext step: Run 'import_kaggle_data.py' to import into MySQL")

