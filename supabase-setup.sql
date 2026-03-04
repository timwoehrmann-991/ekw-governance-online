-- =================================================================
-- EKW Governance Tool – Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- NOTE: This assumes the app_store, profiles tables and upsert_store
-- function already exist from the JIRA/Tableau projects.
-- Only the store key seed is needed.
-- =================================================================

-- Seed the EKW governance store key
insert into public.app_store (store_key, data) values
  ('ekw_governance', '{}'::jsonb)
on conflict (store_key) do nothing;

-- Done! The app uses 'ekw_governance' key in the shared app_store table.
