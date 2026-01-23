-- Migration to support Google OAuth users
-- This allows users to have NULL passwords when they sign in with Google

-- Make password column nullable
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Update the password column to allow NULL for Google users
-- Existing users with passwords will remain unchanged
