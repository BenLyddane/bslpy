import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://criyybydbrosilzidjdo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaXl5YnlkYnJvc2lsemlkamRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMDIzMTIsImV4cCI6MjA0ODY3ODMxMn0.FTQAWcAQHHLljIox4NYTBzi8o3bHJh6UuWkv2OqRZBE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})