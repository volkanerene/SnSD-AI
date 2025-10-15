-- Fix the current user's profile (İlker Yörü)
-- Set role_id to 0 (SNSD Admin) and assign to a tenant

UPDATE profiles
SET
  role_id = 0,  -- SNSD Admin (full access)
  tenant_id = '550e8400-e29b-41d4-a716-446655440001',  -- Assign to first tenant
  department = 'Platform Management',
  job_title = 'System Administrator'
WHERE id = '2131c030-1455-4675-a556-6ea81d93fbc7';

-- Also fix the other test users if needed
UPDATE profiles
SET
  role_id = 0,
  tenant_id = '550e8400-e29b-41d4-a716-446655440001',
  department = 'Test Department',
  job_title = 'Test User'
WHERE id IN (
  'f25f3105-a062-41ce-8c9f-55b95c6c27f2',  -- deneme
  '3248e833-6d50-453c-8bc7-42e964f65a66'   -- test
);

-- Verify the update
SELECT
  id,
  full_name,
  username,
  role_id,
  tenant_id,
  department,
  job_title
FROM profiles
WHERE id IN (
  '2131c030-1455-4675-a556-6ea81d93fbc7',
  'f25f3105-a062-41ce-8c9f-55b95c6c27f2',
  '3248e833-6d50-453c-8bc7-42e964f65a66'
);
