
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role for inspection

supabase = create_client(url, key)

def list_hospitals():
    try:
        resp = supabase.table('hospitals').select('license_number, profiles(full_name, email)').execute()
        if resp.data:
            print("Registered Hospitals in Supabase:")
            for h in resp.data:
                print(f"- {h['profiles']['full_name']} (ID: {h['license_number']}, Email: {h['profiles']['email']})")
        else:
            print("No hospitals found in Supabase.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_hospitals()
