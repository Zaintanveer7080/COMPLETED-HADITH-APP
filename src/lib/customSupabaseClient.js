import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjxfcpewllwtraqmdrxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqeGZjcGV3bGx3dHJhcW1kcnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjA5OTUsImV4cCI6MjA3Mzc5Njk5NX0.em33xD-SwudPMwKFwr0rSI1K8oEUAHpKEO4e3mLvC40';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);