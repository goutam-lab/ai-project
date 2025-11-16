import requests
import json

# Base URL
BASE_URL = "http://127.0.0.1:8000"

# Test 1: Login
print("Test 1: Login...")
login_response = requests.post(
    f"{BASE_URL}/users/login",
    json={"username": "admin", "password": "Admin@123"}
)

if login_response.status_code == 200:
    print("✅ Login successful!")
    token = login_response.json()["access_token"]
else:
    print(f"❌ Login failed: {login_response.status_code}")
    exit()

# Headers with authentication
headers = {"Authorization": f"Bearer {token}"}

# Test 2: Get Statistics
print("\nTest 2: Get Statistics...")
stats_response = requests.get(
    f"{BASE_URL}/kaggle-data/statistics",
    headers=headers
)

if stats_response.status_code == 200:
    print("✅ Statistics retrieved!")
    stats = stats_response.json()
    print(f"   Total Records: {stats['total_records']}")
    print(f"   Manufacturers: {stats['manufacturers_count']}")
else:
    print(f"❌ Failed: {stats_response.status_code}")

# Test 3: Search
print("\nTest 3: Search for Aspirin...")
search_response = requests.get(
    f"{BASE_URL}/kaggle-data/search?medicine_name=Aspirin",
    headers=headers
)

if search_response.status_code == 200:
    results = search_response.json()
    print(f"✅ Found {len(results)} results!")
else:
    print(f"❌ Search failed: {search_response.status_code}")

# Test 4: Dashboard
print("\nTest 4: Get Dashboard...")
dashboard_response = requests.get(
    f"{BASE_URL}/dashboard/",
    headers=headers
)

if dashboard_response.status_code == 200:
    print("✅ Dashboard loaded!")
    dash = dashboard_response.json()
    print(f"   Total Products: {dash['total_products']}")
    print(f"   Unread Alerts: {dash['unread_alerts']}")
else:
    print(f"❌ Dashboard failed: {dashboard_response.status_code}")

print("\n" + "="*50)
print("TESTING COMPLETE!")
print("="*50)