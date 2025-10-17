-- Migration: Create impersonation_sessions table
-- Description: Stores temporary sessions for admin user impersonation
-- Created: 2025-10-17

CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_token ON public.impersonation_sessions(token);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_admin_user ON public.impersonation_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_target_user ON public.impersonation_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_expires_at ON public.impersonation_sessions(expires_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_impersonation_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_impersonation_sessions_updated_at
  BEFORE UPDATE ON public.impersonation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_impersonation_sessions_updated_at();

-- Enable Row Level Security
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins (role_id <= 1) can view and manage impersonation sessions
CREATE POLICY "Admins can manage impersonation sessions"
  ON public.impersonation_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id <= 1
    )
  );

-- Add comment to table
COMMENT ON TABLE public.impersonation_sessions IS 'Stores temporary sessions for admin user impersonation feature';
COMMENT ON COLUMN public.impersonation_sessions.token IS 'Unique token used for impersonation activation';
COMMENT ON COLUMN public.impersonation_sessions.admin_user_id IS 'Admin user performing the impersonation';
COMMENT ON COLUMN public.impersonation_sessions.target_user_id IS 'Target user being impersonated';
COMMENT ON COLUMN public.impersonation_sessions.expires_at IS 'Expiration timestamp (30 minutes from creation)';
COMMENT ON COLUMN public.impersonation_sessions.used IS 'Whether the token has been used';
COMMENT ON COLUMN public.impersonation_sessions.used_at IS 'Timestamp when token was used';
