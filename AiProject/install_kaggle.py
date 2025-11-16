import subprocess
import sys

def install_packages():
    """Install required packages"""
    packages = [
        'kaggle==1.5.16',
        'openpyxl==3.1.2'
    ]
    
    print("Installing Kaggle integration packages...")
    
    for package in packages:
        print(f"\n📦 Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    print("\n✅ All packages installed successfully!")

if __name__ == "__main__":
    install_packages()