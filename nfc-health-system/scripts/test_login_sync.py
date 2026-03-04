
import requests
import json

def test_login_sync():
    url = "http://127.0.0.1:5000/api/auth/login"
    payload = {
        "council_id": "HOSP1353",
        "password": "password123" # Assuming this is the test password
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Attempting login for {payload['council_id']}...")
        response = requests.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_sync()
