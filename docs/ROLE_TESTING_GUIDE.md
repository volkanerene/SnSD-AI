# Role Testing Guide - SnSD AI Platform

This guide explains how to test different user tiers/roles in the SnSD AI platform.

## Available User Roles

The platform has **6 different role tiers**:

| Role ID | Role Name | Description | Access Level |
|---------|-----------|-------------|--------------|
| 1 | SNSD Admin | Platform yöneticisi | Full platform access - can manage all tenants, users, and system settings |
| 2 | Company Admin | Müşteri yöneticisi | Company-level admin - can manage their tenant's users and contractors |
| 3 | HSE Specialist | İSG uzmanı | Safety specialist - can manage evaluations and contractor assessments |
| 4 | Contractor Admin | Yüklenici yöneticisi | Contractor company admin - limited to their own company data |
| 5 | Supervisor | Saha sorumlusu | Site supervisor - can view and update site-specific data |
| 6 | Worker | Saha çalışanı | Field worker - read-only access to relevant documents |

## Test Accounts

### Current Test Account
You're currently logged in as:
- **Email**: ilker.07yoru@gmail.com
- **Role**: SNSD Admin (Role ID: 1)
- **Access**: Full platform access including admin panel

### Creating Test Users for Other Roles

To test different role tiers, you can:

#### Option 1: Use the Admin Panel (Recommended)
1. Go to [http://localhost:3000/dashboard/admin/users](http://localhost:3000/dashboard/admin/users)
2. Find existing users (like "Deniz Çelik" - Company Admin)
3. Click on the user's actions menu (three dots)
4. Click "Edit user"
5. You'll need to create auth accounts for them first

#### Option 2: Create New Test Users via Backend
I can help you create test accounts for each role. Here's what we'll need:

```bash
# Create test users for each role
# Company Admin
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company-admin@test.snsd.com",
    "password": "Test123456!",
    "full_name": "Test Company Admin",
    "tenant_id": "your-tenant-id",
    "role_id": 2
  }'

# HSE Specialist
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hse-specialist@test.snsd.com",
    "password": "Test123456!",
    "full_name": "Test HSE Specialist",
    "tenant_id": "your-tenant-id",
    "role_id": 3
  }'

# Contractor Admin
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor@test.snsd.com",
    "password": "Test123456!",
    "full_name": "Test Contractor Admin",
    "tenant_id": "your-tenant-id",
    "role_id": 4
  }'

# Supervisor
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supervisor@test.snsd.com",
    "password": "Test123456!",
    "full_name": "Test Supervisor",
    "tenant_id": "your-tenant-id",
    "role_id": 5
  }'

# Worker
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@test.snsd.com",
    "password": "Test123456!",
    "full_name": "Test Worker",
    "tenant_id": "your-tenant-id",
    "role_id": 6
  }'
```

## What Each Role Should See

### 1. SNSD Admin (Role ID: 1)
**What you see**: Everything you currently see!
- Admin Panel at [/dashboard/admin/users](http://localhost:3000/dashboard/admin/users)
- Admin Panel at [/dashboard/admin/tenants](http://localhost:3000/dashboard/admin/tenants)
- All dashboard features
- Can manage all tenants and users
- Full CRUD operations

**Navigation Menu**:
- Dashboard
- Admin → Users
- Admin → Tenants
- Contractors
- Evaluations
- Payments
- Settings

---

### 2. Company Admin (Role ID: 2)
**What they should see**:
- Admin Panel (limited to their tenant only)
- Can manage users within their company
- Can view and manage contractors
- Can initiate and view evaluations
- Cannot access cross-tenant data
- Cannot access system-wide settings

**Expected Navigation Menu**:
- Dashboard (company-specific metrics)
- Users (their tenant only)
- Contractors
- Evaluations
- Payments
- Settings

**Test this by**:
1. Creating a Company Admin user
2. Logging in with their credentials
3. Verifying they can't see other tenants' data
4. Checking admin panel shows only their tenant's users

---

### 3. HSE Specialist (Role ID: 3)
**What they should see**:
- Dashboard with safety metrics
- Contractors list (read-only or limited edit)
- Full access to Evaluations (FRM-32)
- Can create and manage contractor assessments
- Limited user management (view only)
- Cannot manage payments

**Expected Navigation Menu**:
- Dashboard
- Contractors (view/assess)
- Evaluations (full access)
- Settings

**Test this by**:
1. Creating an HSE Specialist user
2. Verifying they can't access admin panel
3. Checking they have full evaluation management
4. Confirming they can't delete users or manage tenants

---

### 4. Contractor Admin (Role ID: 4)
**What they should see**:
- Dashboard (their contractor company only)
- Their own company profile
- Evaluations assigned to their company (read-only)
- Documents and certifications for their company
- Cannot see other contractors
- Cannot create evaluations

**Expected Navigation Menu**:
- Dashboard (contractor-specific)
- My Company
- My Evaluations (view only)
- Documents
- Settings

**Test this by**:
1. Creating a Contractor Admin user with a contractor_id
2. Verifying they only see their company data
3. Checking they can't create evaluations
4. Confirming they can view evaluations about their company

---

### 5. Supervisor (Role ID: 5)
**What they should see**:
- Dashboard (site-specific data)
- Contractors on their site
- Active evaluations for their site
- Can update evaluation progress
- Limited contractor information
- Cannot manage users or payments

**Expected Navigation Menu**:
- Dashboard
- Site Contractors
- Evaluations (update only)
- Reports
- Settings

**Test this by**:
1. Creating a Supervisor user
2. Verifying they see limited dashboard
3. Checking they can update but not create evaluations
4. Confirming they can't access admin features

---

### 6. Worker (Role ID: 6)
**What they should see**:
- Minimal dashboard
- Read-only access to relevant documents
- Their own evaluation results
- Safety guidelines and procedures
- Cannot edit anything
- Very limited navigation

**Expected Navigation Menu**:
- Dashboard
- My Documents
- Safety Guidelines
- Settings (profile only)

**Test this by**:
1. Creating a Worker user
2. Verifying they have mostly read-only access
3. Checking they can't see other workers' data
4. Confirming they can only edit their own profile

---

## Quick Test Plan

### Step 1: Test SNSD Admin (Current)
- ✅ You're already logged in as SNSD Admin
- ✅ Verify you can access [/dashboard/admin/users](http://localhost:3000/dashboard/admin/users)
- ✅ Verify you can access [/dashboard/admin/tenants](http://localhost:3000/dashboard/admin/tenants)
- ✅ Verify you can edit/delete any user
- ✅ Verify you can manage tenants

### Step 2: Create and Test Company Admin
```bash
# I'll create this user for you with a script
```

1. Log out from current session
2. Log in as Company Admin
3. Check you can't access /dashboard/admin/tenants
4. Check you can only see your tenant's users
5. Check you can manage contractors

### Step 3: Create and Test HSE Specialist
1. Log out
2. Log in as HSE Specialist
3. Check you can access evaluations
4. Check you can't access admin panel
5. Check you can view contractors

### Step 4: Create and Test Contractor Admin
1. Log out
2. Log in as Contractor
3. Check you only see your company data
4. Check you can't create evaluations
5. Check you have read-only access to evaluations

### Step 5: Test Supervisor and Worker
Follow similar pattern for remaining roles

---

## Testing Checklist

For each role, verify:

- [ ] **Navigation Menu**: Shows correct menu items for role
- [ ] **Dashboard**: Shows role-appropriate data and metrics
- [ ] **Access Control**: Cannot access restricted pages (should redirect)
- [ ] **Data Filtering**: Only sees data they're authorized to view
- [ ] **CRUD Operations**: Correct permissions for create/edit/delete
- [ ] **Admin Panel**: Only admins can access
- [ ] **Cross-Tenant Data**: Cannot view other tenants' data (except SNSD Admin)

---

## Middleware Protection

The platform uses middleware at [src/middleware.ts](src/middleware.ts) to protect routes:

```typescript
// Admin routes (role_id <= 1)
if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
  if (!profile || profile.role_id > 1) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

**Current Protection**:
- `/dashboard/admin/*` - Only SNSD Admin (role_id = 1) and Company Admin (role_id = 2) should access
- Other routes should be protected based on role

**TODO**: Add more middleware rules for other role-specific routes

---

## Creating Test Users Script

Would you like me to create a script that automatically creates test users for all roles? This would make testing much easier.

The script would:
1. Create test users for roles 2-6
2. Assign them to your tenant
3. Set secure passwords
4. Output login credentials
5. Create a handy test account reference table

Just let me know and I'll create it!

---

## Current Status

**Working**:
- ✅ SNSD Admin role (fully tested - you're using it)
- ✅ Admin panel for users management
- ✅ Admin panel for tenants management
- ✅ Role-based access control for admin routes

**Needs Implementation**:
- ⏳ Role-specific dashboards (currently all see same dashboard)
- ⏳ Role-based navigation menus
- ⏳ Data filtering based on contractor_id for Contractor Admin
- ⏳ Site-specific filtering for Supervisor
- ⏳ Read-only enforcement for Worker role
- ⏳ Company Admin restricted to their tenant only

---

## Next Steps

To fully test all roles:

1. **Create test users** - I can create them for you
2. **Implement role-based dashboards** - Different views per role
3. **Update navigation** - Show/hide menu items based on role
4. **Add data filtering** - Ensure users only see authorized data
5. **Test each role** - Go through the checklist above

Would you like me to:
- A) Create test users for all roles right now?
- B) Implement role-based dashboard variants?
- C) Add role-based navigation menu filtering?
- D) All of the above?
