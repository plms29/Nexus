-- ExamLoad Radar Supabase Schema

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  class_id TEXT,
  school TEXT DEFAULT 'THPT Chuyên Lê Quý Đôn',
  province TEXT DEFAULT 'Đà Nẵng',
  avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes Table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  orientation TEXT NOT NULL CHECK (orientation IN ('natural', 'social')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign Key from Users to Classes
ALTER TABLE users ADD CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('natural', 'social')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments Table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'essay', 'chart', 'mindmap', 'group_presentation')),
  raw_lu NUMERIC NOT NULL,
  final_lu NUMERIC NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Assignments (Optional: to track individual completion, though workload is usually per class)
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load standard classes
INSERT INTO classes (name, orientation) VALUES ('10A1', 'natural'), ('10D1', 'social');

-- Load standard subjects
INSERT INTO subjects (name, type) VALUES
('Toán', 'natural'), ('Vật lý', 'natural'), ('Hóa học', 'natural'), ('Sinh học', 'natural'),
('Ngữ văn', 'social'), ('Lịch sử', 'social'), ('Địa lý', 'social'), ('Tiếng Anh', 'social');
