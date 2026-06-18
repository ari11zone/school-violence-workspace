import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://chqknjgcazxfnglbdtsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocWtuamdjYXp4Zm5nbGJkdHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDQ1MjUsImV4cCI6MjA4NjAyMDUyNX0.nJINLat4ggqU5VVYWHA1mPltX_Oo0iOYWQcFBhXJ9F4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
