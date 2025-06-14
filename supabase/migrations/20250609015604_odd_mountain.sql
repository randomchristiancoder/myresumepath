/*
  # Initial Database Schema for My Resume Path

  1. New Tables
    - `resumes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `filename` (text)
      - `content` (text)
      - `parsed_data` (jsonb)
      - `created_at` (timestamp)
    
    - `assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `assessment_type` (text)
      - `responses` (jsonb)
      - `results` (jsonb)
      - `created_at` (timestamp)
    
    - `reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `resume_id` (uuid, foreign key to resumes)
      - `assessment_id` (uuid, foreign key to assessments, nullable)
      - `report_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  content text NOT NULL,
  parsed_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type text NOT NULL,
  responses jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  report_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can read own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for assessments
CREATE POLICY "Users can read own assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for reports
CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_resume_id ON reports(resume_id);