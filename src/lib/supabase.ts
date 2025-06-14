import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  created_at: string
}

export interface ResumeData {
  id: string
  user_id: string
  filename: string
  content: string
  parsed_data: any
  created_at: string
}

export interface Assessment {
  id: string
  user_id: string
  assessment_type: string
  responses: any
  results: any
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  resume_id: string
  assessment_id?: string
  report_data: any
  created_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  provider: string
  api_key: string
  is_active: boolean
  usage_settings: {
    resume_parsing: boolean
    job_matching: boolean
    course_recommendations: boolean
    personality_analysis: boolean
    skill_gap_analysis: boolean
    report_generation: boolean
  }
  created_at: string
  updated_at: string
}