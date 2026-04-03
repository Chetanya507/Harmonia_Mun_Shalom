import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://hcyqprhupzxotxpkaymx.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeXFwcmh1cHp4b3R4cGtheW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzI2NzIsImV4cCI6MjA5MDgwODY3Mn0.MPB3yepy__xa5JAl6wJAnzM41A4F2L_cBCA-3lBMUhU';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || NEW_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || NEW_SUPABASE_ANON_KEY;

// Force override if the old URL is detected
if (supabaseUrl.includes('qkjwwyduzxewydvvmrbv')) {
  console.warn('Old Supabase URL detected in environment. Overriding with new URL.');
  supabaseUrl = NEW_SUPABASE_URL;
  supabaseAnonKey = NEW_SUPABASE_ANON_KEY;
}

// Log the URL being used to help debug (will show in browser console)
console.log('Supabase URL:', supabaseUrl);

// Only initialize if we have the required credentials
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }) 
  : null;

if (!supabase) {
  console.warn('Supabase credentials missing.');
}
