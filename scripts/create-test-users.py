#!/usr/bin/env python3
"""
Create test users for all role tiers in SnSD AI Platform
Run this script to quickly create test accounts for testing different user roles
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment from backend directory
backend_env = os.path.join(os.path.dirname(__file__), '../../snsd-backend/.env')
load_dotenv(backend_env)

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Get a tenant ID to use for test users
print("📋 Getting tenant information...")
tenants_res = supabase.table('tenants').select('id, name').limit(1).execute()
if not tenants_res.data:
    print("❌ No tenants found. Please create a tenant first.")
    sys.exit(1)

tenant_id = tenants_res.data[0]['id']
tenant_name = tenants_res.data[0]['name']
print(f"✅ Using tenant: {tenant_name} ({tenant_id[:8]}...)")

# Test users to create
TEST_USERS = [
    {
        'email': 'company-admin@test.snsd.com',
        'password': 'CompanyAdmin123!',
        'full_name': 'Test Company Admin',
        'role_id': 2,
        'role_name': 'Company Admin'
    },
    {
        'email': 'hse-specialist@test.snsd.com',
        'password': 'HSESpecialist123!',
        'full_name': 'Test HSE Specialist',
        'role_id': 3,
        'role_name': 'HSE Specialist'
    },
    {
        'email': 'contractor-admin@test.snsd.com',
        'password': 'Contractor123!',
        'full_name': 'Test Contractor Admin',
        'role_id': 4,
        'role_name': 'Contractor Admin'
    },
    {
        'email': 'supervisor@test.snsd.com',
        'password': 'Supervisor123!',
        'full_name': 'Test Supervisor',
        'role_id': 5,
        'role_name': 'Supervisor'
    },
    {
        'email': 'worker@test.snsd.com',
        'password': 'Worker123!',
        'full_name': 'Test Worker',
        'role_id': 6,
        'role_name': 'Worker'
    }
]

print("\n" + "="*80)
print("Creating Test Users for All Role Tiers")
print("="*80 + "\n")

created_users = []

for user_data in TEST_USERS:
    try:
        print(f"Creating {user_data['role_name']} ({user_data['email']})...", end=' ')

        # Create auth user
        auth_response = supabase.auth.admin.create_user({
            'email': user_data['email'],
            'password': user_data['password'],
            'email_confirm': True,
            'user_metadata': {
                'full_name': user_data['full_name']
            }
        })

        user_id = auth_response.user.id

        # Create profile
        profile_data = {
            'id': user_id,
            'tenant_id': tenant_id,
            'full_name': user_data['full_name'],
            'role_id': user_data['role_id'],
            'is_active': True,
            'locale': 'tr',
            'timezone': 'Asia/Dubai'
        }

        supabase.table('profiles').insert(profile_data).execute()

        created_users.append(user_data)
        print("✅ Success")

    except Exception as e:
        error_msg = str(e)
        if 'already registered' in error_msg.lower() or 'duplicate' in error_msg.lower():
            print("⚠️  Already exists")
        else:
            print(f"❌ Failed: {error_msg}")

print("\n" + "="*80)
print("Test Users Created Successfully!")
print("="*80 + "\n")

if created_users:
    print("📋 Test Account Credentials:\n")
    print("┌─────────────────────────────────────────────────────────────────────────────┐")
    print("│ Role                    │ Email                              │ Password      │")
    print("├─────────────────────────────────────────────────────────────────────────────┤")

    for user in TEST_USERS:
        role = user['role_name'].ljust(23)
        email = user['email'].ljust(34)
        password = user['password'].ljust(13)
        print(f"│ {role} │ {email} │ {password} │")

    print("└─────────────────────────────────────────────────────────────────────────────┘")

    print("\n📝 Testing Instructions:")
    print("1. Log out from your current session")
    print("2. Log in with one of the test accounts above")
    print("3. Navigate to http://localhost:3000/dashboard")
    print("4. Verify role-specific access and features")
    print("\n💡 Tip: Keep this terminal output for quick reference to test credentials")

else:
    print("ℹ️  All test users already exist. You can use the credentials from previous runs.")

print("\n📖 For detailed testing guide, see: ROLE_TESTING_GUIDE.md")
print("="*80 + "\n")
