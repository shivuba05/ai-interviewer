-- ============================================================
-- AI Interviewer – Smart Interview Preparation System
-- PostgreSQL Schema for Supabase
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  target_role TEXT DEFAULT 'Software Developer',
  experience_level TEXT DEFAULT 'Fresher' CHECK (experience_level IN ('Fresher', 'Intermediate', 'Experienced')),
  preferred_language TEXT DEFAULT 'English' CHECK (preferred_language IN ('English', 'Kannada', 'Hindi')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  parsed_text TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_summary TEXT,
  projects JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('Technical', 'HR', 'Coding', 'Aptitude')),
  job_role TEXT NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('Fresher', 'Intermediate', 'Experienced')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  language TEXT NOT NULL DEFAULT 'English' CHECK (language IN ('English', 'Kannada', 'Hindi')),
  question_count INT NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'paused', 'completed', 'abandoned')),
  overall_score NUMERIC(5, 2),
  duration_seconds INT DEFAULT 0,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- 4. Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  question_text TEXT NOT NULL,
  expected_points TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  is_follow_up BOOLEAN NOT NULL DEFAULT FALSE,
  parent_question_id UUID REFERENCES interview_questions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Interview Answers Table
CREATE TABLE IF NOT EXISTS interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  audio_url TEXT,
  score NUMERIC(4, 1) CHECK (score >= 0 AND score <= 10),
  relevance_score NUMERIC(4, 1),
  technical_score NUMERIC(4, 1),
  communication_score NUMERIC(4, 1),
  clarity_score NUMERIC(4, 1),
  completeness_score NUMERIC(4, 1),
  problem_solving_score NUMERIC(4, 1),
  positive_feedback TEXT,
  areas_for_improvement TEXT,
  suggested_better_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Interview Reports Table
CREATE TABLE IF NOT EXISTS interview_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_score NUMERIC(5, 2) NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  technical_knowledge_assessment TEXT,
  communication_feedback TEXT,
  improvement_suggestions TEXT[] DEFAULT '{}',
  recommended_topics TEXT[] DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id ON interview_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_reports_interview_id ON interview_reports(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_reports_user_id ON interview_reports(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile or admins view all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Resumes Policies
CREATE POLICY "Users can view own resumes or admins view all"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Interviews Policies
CREATE POLICY "Users can view own interviews or admins view all"
  ON interviews FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own interviews"
  ON interviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
  ON interviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews"
  ON interviews FOR DELETE
  USING (auth.uid() = user_id);

-- Interview Questions Policies
CREATE POLICY "Users can view questions for own interviews"
  ON interview_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_questions.interview_id
      AND (interviews.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert questions for own interviews"
  ON interview_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

-- Interview Answers Policies
CREATE POLICY "Users can view answers for own interviews"
  ON interview_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_answers.interview_id
      AND (interviews.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert answers for own interviews"
  ON interview_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_answers.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

-- Interview Reports Policies
CREATE POLICY "Users can view own reports or admins view all"
  ON interview_reports FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own reports"
  ON interview_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile when auth.users signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

