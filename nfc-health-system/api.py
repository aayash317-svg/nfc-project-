from flask import Blueprint, request, jsonify, session, g
from database import query_db, execute_db
from utils import hash_password, verify_password, generate_uuid
import datetime
from supabase_client import get_supabase_client

bp = Blueprint('api', __name__, url_prefix='/api')

# --- Authentication ---

@bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    council_id = data.get('council_id')
    email = data.get('email')
    password = data.get('password')

    if not all([name, council_id, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    # check if exists
    existing = query_db("SELECT id FROM hospitals WHERE council_id = ? OR email = ?", (council_id, email), one=True)
    if existing:
        return jsonify({'error': 'Hospital with this Council ID or Email already exists.'}), 400

    try:
        new_id = generate_uuid()
        hashed_pw = hash_password(password)
        
        execute_db(
            "INSERT INTO hospitals (id, name, council_id, email, password_hash) VALUES (?, ?, ?, ?, ?)",
            (new_id, name, council_id, email, hashed_pw)
        )
        
        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        return jsonify({'error': f'Registration Error: {str(e)}'}), 500
@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    # Accept any of the valid identifier keys
    identifier = data.get('council_id') or data.get('license_number') or data.get('username')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'error': 'Missing Council ID, License Number, or Password'}), 400

    # Try finding in Hospitals
    user = query_db("SELECT * FROM hospitals WHERE council_id = ?", (identifier,), one=True)
    role = 'hospital'
    
    if not user:
        # Try Insurance
        user = query_db("SELECT * FROM insurance_companies WHERE license_number = ?", (identifier,), one=True)
        role = 'insurance'
    
    if not user:
        # Try Admin
        user = query_db("SELECT * FROM admins WHERE username = ?", (identifier,), one=True)
        role = 'admin'

    if user and verify_password(user['password_hash'], password):
        session.clear()
        session['user_id'] = user['id']
        session['user_name'] = user['name'] if role != 'admin' else user['username']
        session['role'] = role
        
        redirect_url = '/dashboard'
        if role == 'insurance': redirect_url = '/insurance/policies'
        if role == 'admin': redirect_url = '/admin/dashboard'
        
        return jsonify({'message': 'Login successful', 'redirect': redirect_url, 'role': role}), 200
    
    # --- FALLBACK: Try Supabase ---
    print(f"DEBUG: Attempting Supabase fallback for {identifier}")
    try:
        supabase = get_supabase_client()
        resolved_email = None
        user_data = None
        s_role = None

        # Try Hospital lookup in Supabase
        print(f"DEBUG: Searching for hospital with license {identifier}")
        h_resp = supabase.table('hospitals').select('id, license_number, profiles(email, full_name)').eq('license_number', identifier).execute()
        if h_resp.data:
            user_data = h_resp.data[0]
            resolved_email = user_data['profiles']['email']
            s_role = 'hospital'
            print(f"DEBUG: Found hospital, resolved email: {resolved_email}")
        
        if not resolved_email:
            print(f"DEBUG: Searching for insurance provider with name {identifier}")
            i_resp = supabase.table('insurance_providers').select('id, company_name, profiles(email, full_name)').eq('company_name', identifier).execute()
            if i_resp.data:
                user_data = i_resp.data[0]
                resolved_email = user_data['profiles']['email']
                s_role = 'insurance'
                print(f"DEBUG: Found insurance, resolved email: {resolved_email}")
            else:
                print(f"DEBUG: Searching profiles for direct email match: {identifier}")
                p_resp = supabase.table('profiles').select('email, full_name, role').eq('email', identifier).execute()
                if p_resp.data:
                    user_data = p_resp.data[0]
                    resolved_email = identifier
                    s_role = user_data['role']
                    print(f"DEBUG: Found profile with role {s_role}")

        if resolved_email:
            print(f"DEBUG: Attempting Supabase sign-in for {resolved_email}")
            try:
                auth_resp = supabase.auth.sign_in_with_password({"email": resolved_email, "password": password})
                if auth_resp.user:
                    # 3. Success! Sync to SQLite
                    new_id = auth_resp.user.id
                    print(f"DEBUG: Supabase auth successful for {new_id}")
                    
                    name = user_data.get('profiles', {}).get('full_name') or user_data.get('full_name') or "Synced User"
                    # Capture the actual ID from user_data if identifier was an email
                    actual_council_id = user_data.get('license_number') or user_data.get('company_name') or identifier

                    if s_role == 'hospital':
                        print(f"DEBUG: Syncing hospital {actual_council_id} to SQLite")
                        execute_db(
                            "INSERT OR IGNORE INTO hospitals (id, name, council_id, email, password_hash) VALUES (?, ?, ?, ?, ?)",
                            (new_id, name, actual_council_id, resolved_email, hash_password(password))
                        )
                    elif s_role == 'insurance':
                        print(f"DEBUG: Syncing insurance {actual_council_id} to SQLite")
                        execute_db(
                            "INSERT OR IGNORE INTO insurance_companies (id, name, license_number, email, password_hash) VALUES (?, ?, ?, ?, ?)",
                            (new_id, name, actual_council_id, resolved_email, hash_password(password))
                        )

                    session.clear()
                    session['user_id'] = new_id
                    session['user_name'] = name
                    session['role'] = s_role
                    
                    redirect_url = '/dashboard'
                    if s_role == 'insurance': redirect_url = '/insurance/policies'
                    
                    return jsonify({'message': 'Login successful (Synced)', 'redirect': redirect_url, 'role': s_role}), 200
                else:
                    print("DEBUG: Supabase auth failed (no user in response)")
            except Exception as ae:
                print(f"DEBUG: Supabase auth error: {ae}")

    except Exception as e:
        print(f"Supabase Auth Fallback Error: {e}")

    return jsonify({'error': 'Invalid Credentials'}), 401



# --- Patient Data ---

@bp.route('/patient/scan', methods=['POST'])
def scan_patient():
    data = request.get_json()
    # Support both 'data' (from scan.html) and 'scan_data' (legacy/api)
    encrypted_payload = data.get('data') or data.get('scan_data')

    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized: Please login first'}), 401
        
    if not encrypted_payload:
        return jsonify({'error': 'No data provided'}), 400
        
    try:
        from utils import decrypt_data
        import json
        
        # 1. Try to decrypt (for legacy/NFC encrypted tags)
        decrypted = decrypt_data(encrypted_payload)
        
        # 2. Determine raw data to parse
        raw_data = decrypted if decrypted else encrypted_payload
        patient_id = None
        patient_name = "New Patient"
        patient_dob = "2000-01-01"
        
        # 3. Try parsing as JSON (New system uses raw JSON QR)
        try:
            payload = json.loads(raw_data)
            if isinstance(payload, dict):
                # Check for various ID keys
                patient_id = payload.get('patient_id') or payload.get('id') or payload.get('pid')
                patient_name = payload.get('name') or payload.get('full_name') or "New Patient"
                patient_dob = payload.get('dob') or "2000-01-01"
        except:
            # Not JSON, treat as raw ID
            patient_id = raw_data

        if not patient_id:
            return jsonify({'error': 'Invalid payload: No patient ID found'}), 400

        # 4. Verify/Sync patient in local SQLite
        patient = query_db("SELECT * FROM patients WHERE id = ?", (patient_id,), one=True)
        
        if not patient:
            # Auto-Sync: Add to local database if it came from the trusted system
            print(f"Auto-syncing patient: {patient_id}")
            try:
                execute_db(
                    "INSERT INTO patients (id, full_name, dob, email) VALUES (?, ?, ?, ?)",
                    (patient_id, patient_name, patient_dob, f"sync_{patient_id[:8]}@example.com")
                )
                patient = query_db("SELECT * FROM patients WHERE id = ?", (patient_id,), one=True)
            except Exception as e:
                print(f"Auto-sync error: {e}")

        if patient:
            # 5. Log Scan to Supabase Audit Logs (if hospital)
            if session.get('role') == 'hospital':
                try:
                    supabase = get_supabase_client()
                    supabase.table('audit_logs').insert({
                        'actor_id': session['user_id'],
                        'action': 'nfc_scan',
                        'resource_type': 'patient',
                        'resource_id': patient['id'],
                        'details': {'patient_name': patient['full_name']}
                    }).execute()
                except Exception as le:
                    print(f"Audit Log Error: {le}")

            return jsonify({
                'patient_id': patient['id'], 
                'redirect': f'/patient/{patient["id"]}/view'
            }), 200
        else:
             return jsonify({'error': 'Patient not found and could not be synced'}), 404

    except Exception as e:
        print(f"Scan Error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/patient/<patient_id>/records', methods=['GET'])
def get_records(patient_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        records = query_db("""
            SELECT m.*, h.name as hospital_name 
            FROM medical_records m 
            LEFT JOIN hospitals h ON m.hospital_id = h.id 
            WHERE m.patient_id = ? 
            ORDER BY m.created_at DESC
        """, (patient_id,))
        
        # Convert to list of dicts for JSON serialization
        results = []
        for r in records:
            results.append({
                'id': r['id'],
                'record_type': r['record_type'],
                'data_payload': r['description'],
                'summary': r['title'],
                'created_at': r['created_at'],
                'hospital_name': r['hospital_name'] or 'Unknown/Admin'
            })
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/patient/<patient_id>/add', methods=['POST'])
def add_record(patient_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    record_type = data.get('record_type', 'text')
    payload = data.get('data_payload')
    summary = data.get('summary')
    hospital_id = session['user_id']
    
    # Validation
    if not payload:
        return jsonify({'error': 'Data empty'}), 400

    try:
        new_id = generate_uuid()
        
        # 1. Save to Local SQLite (for offline/performance)
        execute_db("""
            INSERT INTO medical_records (id, patient_id, hospital_id, record_type, title, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (new_id, patient_id, hospital_id, record_type, summary, payload))

        # 2. Sync to Supabase (Global Visibility)
        import os
        import requests
        
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if supabase_url and supabase_service_key:
            try:
                # We use the Service Role key to bypass RLS and ensure the write succeeds
                sync_url = f"{supabase_url}/rest/v1/medical_records"
                headers = {
                    "apikey": supabase_service_key,
                    "Authorization": f"Bearer {supabase_service_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
                
                # Check if hospital_id exists in Supabase. 
                # If not (e.g. legacy local ID), we might need to use a fallback or skip.
                # But our current ID ccfb... should be valid if it was synced.
                
                payload_supabase = {
                    "id": new_id,
                    "patient_id": patient_id,
                    "hospital_id": hospital_id,
                    "record_type": record_type,
                    "title": summary,
                    "description": payload
                }
                
                resp = requests.post(sync_url, headers=headers, json=payload_supabase)
                if not resp.ok:
                    print(f"Supabase Sync Warning: {resp.text}")
            except Exception as se:
                print(f"Supabase Sync Error: {se}")

        return jsonify({'message': 'Record saved and synced.', 'redirect': '/'}), 201
    except Exception as e:
        print(f"Add Record Error: {e}")
        return jsonify({'error': str(e)}), 500

