import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ojkqgvkzumbnmasmajkw.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qa3Fndmt6dW1ibm1hc21hamt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM2MDUsImV4cCI6MjA3NDg5OTYwNX0.nRWXZjkJjZgfDi87uksrElnDZmLK6Diueh7u3jPfAXA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use createBrowserClient from @supabase/ssr for cookie-based auth
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
