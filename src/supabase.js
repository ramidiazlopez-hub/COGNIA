import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ivmhnutmzcperjxlvfat.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bWhudXRtemNwZXJqeGx2ZmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNDM4MjQsImV4cCI6MjA5MjgxOTgyNH0.3EvkUW-ZPWLjqKCPuYUUTEH95wV47bqU6pIUeHznmc0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
