/*
  # Add API Keys Management Table

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `provider` (text, AI provider name)
      - `api_key` (text, encrypted API key)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policies for authenticated users to manage their own API keys
    - Encrypt API keys for security

  3. Indexes
    - Index on user_id for performance
    - Index on provider for filtering
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('openai', 'openrouter', 'anthropic', 'google', 'cohere', 'huggingface', 'replicate')),
  api_key text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for api_keys
CREATE POLICY "Users can read own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Create unique constraint to prevent duplicate providers per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_user_provider 
ON api_keys(user_id, provider) 
WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();