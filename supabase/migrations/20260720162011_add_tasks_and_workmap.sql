CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  deadline TEXT NOT NULL,
  is_group BOOLEAN NOT NULL DEFAULT false,
  topic TEXT,
  learning_objectives JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workmap_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  subject_group TEXT NOT NULL,
  minutes NUMERIC NOT NULL,
  lu NUMERIC NOT NULL,
  step_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
