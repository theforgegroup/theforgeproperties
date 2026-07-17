-- SQL Migration: Add User Performance and Financial Metrics Columns
-- Target Table: public.users

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS total_sales INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_commission NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_balance NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_clicks INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_leads INT DEFAULT 0;
