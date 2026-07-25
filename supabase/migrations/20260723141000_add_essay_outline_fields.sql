-- Migration to add essay outline, process steps, and approval status to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS outline JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS essay_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_outline_approved BOOLEAN DEFAULT false;
