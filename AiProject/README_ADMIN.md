# AI Medicine Monitoring System - Admin Backend Documentation

## 🎯 Overview

This is the complete admin backend for the AI Medicine Monitoring System. The admin interface provides comprehensive control over:

- **AI Model Management**: Train, monitor, and deploy AI models
- **User Management**: Manage all system users and their permissions
- **IoT Sensor Management**: Configure, calibrate, and monitor IoT sensors
- **System Configuration**: Control system parameters and thresholds
- **Audit & Security**: Track all system activities and maintain security
- **Counterfeit Detection**: Verify and manage counterfeit product reports

## 📁 Complete File Structure

```
project_root/
├── app/
│   ├── __init__.py
│   ├── main.py                      # Main FastAPI application
│   ├── database.py                  # MySQL database configuration
│   ├── models.py                    # SQLAlchemy models (ALL TABLES)
│   ├── schemas.py                   # Pydantic schemas (USER + ADMIN)
│   ├── crud.py                      # CRUD operations (USER + ADMIN)
│   ├── auth.py                      # Authentication & authorization
│   └── routers/
│       ├── __init__.py
│       # User Routers
│       ├── users.py                 # User auth endpoints
│       ├── monitoring.py            # Product monitoring
│       ├── alerts.py                # Alert management
│       ├── dashboard.py             # User dashboard
│       # Admin Routers
│       ├── admin_dashboard.py       # Admin dashboard
│       ├── admin_ai_models.py       # AI model management
│       ├── admin_users.py           # User management
│       ├── admin_sensors.py         # IoT sensor management
│       ├── admin_system.py          # System configuration
│       └── admin_counterfeit.py     # Counterfeit reports
├── requirements.txt                 # Python dependencies
├── .env                            # Environment variables
├── create_tables.py                # Create database tables
├── create_admin_user.py            # Create admin user
├── seed_initial_data.py            # Seed test data
├── run_server.py                   # Run development server
├── database_setup.sql              # MySQL setup script
└── README_ADMIN.md                 # This file
```

## 🚀 Setup Instructions

### 1. Install MySQL

```bash
# Install MySQL (if not already installed)
# For Ubuntu/Debian:
sudo apt-get install mysql-server

# For MacOS:
brew install mysql

# For Windows: Download from mysql.com
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run the database setup script
source database_setup.sql

# Or copy-paste the SQL from database_setup.sql
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/medicine_monitoring
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medicine_monitoring

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis Configuration (optional, for Celery)
REDIS_URL=redis://localhost:6379

# Alert Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=alerts@yourdomain.com
```

### 5. Create Database Tables

```bash
python create_tables.py
```

### 6. Create Admin User

```bash
python create_admin_user.py
```

This creates:
- Username: `admin`
- Password: `Admin@123`
- Email: `admin@medicinesystem.com`

**⚠️ IMPORTANT: Change the password after first login!**

### 7. Seed Initial Data (Optional)

```bash
python seed_initial_data.py
```

This creates:
- Demo users
- Sample AI models
- System configurations
- IoT sensors
- Sample products
- Sensor readings

### 8. Run the Server

```bash
python run_server.py
```

The API will be available at:
- **API**: http://127.0.0.1:8000
- **Swagger Docs**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## 🔐 Admin Authentication

All admin endpoints require:
1. Valid JWT token
2. User account with `user_type = "admin"`

### Login Flow

```python
# 1. Login to get token
POST /users/login
{
    "username": "admin",
    "password": "Admin@123"
}

# Response:
{
    "access_token": "eyJ0eXAiOiJKV1...",
    "token_type": "bearer",
    "user": {...}
}

# 2. Use token in subsequent requests
# Add header: Authorization: Bearer eyJ0eXAiOiJKV1...
```

## 📊 Admin API Endpoints

### Admin Dashboard
```
GET  /admin/dashboard/           # Get dashboard overview
GET  /admin/dashboard/stats      # Get detailed statistics
```

### AI Model Management
```
POST /admin/ai-models/                    # Create new AI model
GET  /admin/ai-models/                    # Get all AI models
GET  /admin/ai-models/{id}                # Get specific model
PUT  /admin/ai-models/{id}/train          # Train AI model
PUT  /admin/ai-models/{id}/status         # Update model status
POST /admin/ai-models/{id}/training-data  # Add training data
GET  /admin/ai-models/{id}/training-data  # Get training data
PUT  /admin/ai-models/training-data/{id}/validate  # Validate data
```

### User Management
```
GET    /admin/users/                # Get all users
GET    /admin/users/{id}            # Get user details
PUT    /admin/users/{id}/status     # Activate/deactivate user
DELETE /admin/users/{id}            # Delete user
GET    /admin/users/{id}/products   # Get user's products
GET    /admin/users/{id}/alerts     # Get user's alerts
GET    /admin/users/{id}/audit-logs # Get user's activity logs
```

### IoT Sensor Management
```
POST   /admin/sensors/              # Create new sensor
GET    /admin/sensors/              # Get all sensors
GET    /admin/sensors/{id}          # Get sensor details
PUT    /admin/sensors/{id}/status   # Update sensor status
DELETE /admin/sensors/{id}          # Delete sensor
PUT    /admin/sensors/{id}/calibrate # Calibrate sensor
```

### System Configuration
```
POST /admin/system/config             # Create/update configuration
GET  /admin/system/config             # Get all configurations
GET  /admin/system/config/{key}       # Get specific config
POST /admin/system/metrics            # Create system metric
GET  /admin/system/metrics            # Get system metrics
GET  /admin/system/audit-logs         # Get all audit logs
GET  /admin/system/health             # System health check
POST /admin/system/backup             # Trigger system backup
```

### Counterfeit Management
```
POST /admin/counterfeit/reports            # Create report
GET  /admin/counterfeit/reports            # Get all reports
PUT  /admin/counterfeit/reports/{id}/verify # Verify report
GET  /admin/counterfeit/reports/statistics # Get statistics
```

## 🎯 Admin Workflow Examples

### 1. Managing AI Models

```python
# Create a new AI model
POST /admin/ai-models/
{
    "model_name": "Advanced CV Model",
    "model_type": "computer_vision",
    "version": "2.0.0"
}

# Add training data
POST /admin/ai-models/1/training-data
{
    "model_id": 1,
    "data_type": "image",
    "label": "counterfeit",
    "file_path": "/uploads/training/img001.jpg"
}

# Train the model
PUT /admin/ai-models/1/train
{
    "accuracy": 96.5
}

# Activate the model
PUT /admin/ai-models/1/status
{
    "status": "active"
}
```

### 2. Managing IoT Sensors

```python
# Add new sensor
POST /admin/sensors/
{
    "sensor_id": "TEMP_005",
    "sensor_type": "temperature",
    "location": "Warehouse C - Section 1"
}

# Calibrate sensor
PUT /admin/sensors/1/calibrate

# Update sensor status
PUT /admin/sensors/1/status
{
    "status": "maintenance"
}
```

### 3. Managing Users

```python
# View all users
GET /admin/users/

# Deactivate a user
PUT /admin/users/5/status
{
    "is_active": false
}

# View user's activity
GET /admin/users/5/audit-logs
```

### 4. System Configuration

```python
# Update temperature threshold
POST /admin/system/config
{
    "config_key": "temperature_threshold_max",
    "config_value": "10.0",
    "description": "Maximum safe temperature"
}

# View system health
GET /admin/system/health

# View audit logs
GET /admin/system/audit-logs?limit=100
```

## 🔍 Key Features for Admin

### 1. **Comprehensive Dashboard**
- Total users, products, alerts statistics
- AI model performance metrics
- System health indicators
- Recent activity logs

### 2. **AI Model Training & Management**
- Create and version AI models
- Add and validate training data
- Monitor model accuracy
- Deploy/deactivate models

### 3. **User Management**
- View all registered users
- Activate/deactivate accounts
- Monitor user activity
- View user's products and alerts

### 4. **IoT Sensor Network**
- Register new sensors
- Monitor sensor status
- Calibrate sensors
- Track sensor readings

### 5. **Security & Audit**
- Complete audit trail
- Track all system changes
- Monitor admin actions
- IP address logging

### 6. **System Configuration**
- Set temperature/humidity thresholds
- Configure alert settings
- System-wide parameters
- Feature toggles

### 7. **Counterfeit Detection**
- View detection reports
- Verify counterfeit claims
- Track false positives
- Monitor detection accuracy

## 📈 Admin Dashboard Data

The admin dashboard provides:

```json
{
    "total_users": 150,
    "total_products": 1250,
    "total_alerts": 45,
    "active_sensors": 28,
    "system_uptime": "99.9%",
    "ai_models_status": [...],
    "recent_audit_logs": [...],
    "system_metrics": {
        "avg_cpu_usage": 45.2,
        "avg_memory_usage": 62.5,
        "total_api_calls": 15000
    }
}
```

## 🛡️ Security Features

1. **Role-Based Access Control**: Only admin users can access admin endpoints
2. **JWT Authentication**: Secure token-based authentication
3. **Audit Logging**: All admin actions are logged
4. **Password Hashing**: Bcrypt password encryption
5. **Input Validation**: Pydantic schemas validate all inputs

## 📝 Database Tables

The system uses 13 main tables:

1. `users` - User accounts
2. `products` - Medicine products
3. `sensor_data` - IoT sensor readings
4. `alerts` - System alerts
5. `quality_predictions` - AI predictions
6. `ai_models` - AI model registry
7. `training_data` - Model training data
8. `system_config` - System configurations
9. `iot_sensors` - IoT sensor registry
10. `audit_logs` - Activity audit trail
11. `system_metrics` - Performance metrics
12. `counterfeit_reports` - Counterfeit detections

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo service mysql status

# Test connection
mysql -u root -p medicine_monitoring
```

### Permission Errors
```bash
# Grant privileges
GRANT ALL PRIVILEGES ON medicine_monitoring.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 📚 Next Steps

1. **Change default passwords**
2. **Configure email/SMS alerts**
3. **Set up Redis for Celery** (optional)
4. **Deploy to production** (use Docker)
5. **Set up monitoring** (Prometheus/Grafana)
6. **Configure backups**
7. **Enable HTTPS** (Let's Encrypt)

## 💡 Tips for Development

1. Use Swagger UI (`/docs`) for testing endpoints
2. Check audit logs to debug issues
3. Monitor system metrics regularly
4. Keep AI models updated with new data
5. Regular sensor calibration
6. Review counterfeit reports weekly

---