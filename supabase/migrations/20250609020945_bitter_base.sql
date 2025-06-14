/*
  # Add Perplexity API and Usage Settings

  1. Updates
    - Add 'perplexity' to the provider check constraint
    - Add usage_settings column to api_keys table for selective feature control
  
  2. New Features
    - Perplexity API support for real-time web search and analysis
    - Granular control over which features use which APIs
    - User preferences for API usage optimization
*/

-- Add perplexity to the provider constraint
ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_provider_check;
ALTER TABLE api_keys ADD CONSTRAINT api_keys_provider_check 
CHECK (provider = ANY (ARRAY['openai'::text, 'openrouter'::text, 'anthropic'::text, 'google'::text, 'cohere'::text, 'huggingface'::text, 'replicate'::text, 'perplexity'::text]));

-- Add usage_settings column to control which features use this API key
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS usage_settings jsonb DEFAULT '{
  "resume_parsing": true,
  "job_matching": true,
  "course_recommendations": true,
  "personality_analysis": true,
  "skill_gap_analysis": true,
  "report_generation": true
}'::jsonb;

-- Update existing records to have default usage settings
UPDATE api_keys 
SET usage_settings = '{
  "resume_parsing": true,
  "job_matching": true,
  "course_recommendations": true,
  "personality_analysis": true,
  "skill_gap_analysis": true,
  "report_generation": true
}'::jsonb
WHERE usage_settings IS NULL;