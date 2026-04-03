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

/* 
  SUPABASE STORAGE POLICIES (Run this in Supabase SQL Editor):

  -- Create the bucket if it doesn't exist
  insert into storage.buckets (id, name, public)
  values ('ucsf-media', 'ucsf-media', true)
  on conflict (id) do nothing;

  -- Allow public read access
  create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'ucsf-media' );

  -- Allow authenticated uploads
  create policy "Authenticated Uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'ucsf-media' 
    and auth.role() = 'authenticated'
  );

  -- Allow authenticated updates/deletes
  create policy "Authenticated Updates"
  on storage.objects for update
  using ( bucket_id = 'ucsf-media' and auth.role() = 'authenticated' );

  create policy "Authenticated Deletes"
  on storage.objects for delete
  using ( bucket_id = 'ucsf-media' and auth.role() = 'authenticated' );

  -- TABLE POLICIES (Run this in Supabase SQL Editor):

  -- Enable RLS on all tables
  alter table public.houses enable row level security;
  alter table public.matches enable row level security;
  alter table public.schedule enable row level security;
  alter table public.settings enable row level security;
  alter table public.categories enable row level security;
  alter table public.gallery enable row level security;

  -- Allow public read access to all tables
  create policy "Public Read Houses" on public.houses for select using (true);
  create policy "Public Read Matches" on public.matches for select using (true);
  create policy "Public Read Schedule" on public.schedule for select using (true);
  create policy "Public Read Settings" on public.settings for select using (true);
  create policy "Public Read Categories" on public.categories for select using (true);
  create policy "Public Read Gallery" on public.gallery for select using (true);

  -- Allow authenticated users to perform all actions (INSERT, UPDATE, DELETE)
  create policy "Auth All Houses" on public.houses for all to authenticated using (true) with check (true);
  create policy "Auth All Matches" on public.matches for all to authenticated using (true) with check (true);
  create policy "Auth All Schedule" on public.schedule for all to authenticated using (true) with check (true);
  create policy "Auth All Settings" on public.settings for all to authenticated using (true) with check (true);
  create policy "Auth All Categories" on public.categories for all to authenticated using (true) with check (true);
  create policy "Auth All Gallery" on public.gallery for all to authenticated using (true) with check (true);
*/

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
