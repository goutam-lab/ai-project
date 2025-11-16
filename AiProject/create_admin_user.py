from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash
from datetime import datetime

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "admin").first()
        
        if admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@medicinesystem.com",
            username="admin",
            hashed_password=get_password_hash("Admin@123"),  # Change this password!
            company_name="System Administration",
            user_type="admin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✓ Admin user created successfully!")
        print(f"  Username: admin")
        print(f"  Email: admin@medicinesystem.com")
        print(f"  Password: Admin@123")
        print(f"  User ID: {admin_user.id}")
        print("\n⚠️  IMPORTANT: Change the admin password immediately after first login!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()