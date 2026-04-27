-- SQL script to create the required table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  naam text NOT NULL,
  achternaam text,
  mobiel text,
  email text NOT NULL,
  bericht text NOT NULL
);

-- Enable Row Level Security (optional but recommended)
-- For this simple use case where an Edge Function with Service Role/Anon Key inserts,
-- you may want to allow the anon role to insert if using the anon key.
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON contact_submissions
FOR INSERT WITH CHECK (true);
