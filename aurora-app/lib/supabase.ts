import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'

const SUPABASE_URL = 'https://jozbpofewlkhmrbjjokw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemJwb2Zld2xraG1yYmpqb2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTUxOTMsImV4cCI6MjA5NjczMTE5M30.uuuavG1IN_RsagCovYzxFeAnmmMRA5KHfETb3WDPceY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
