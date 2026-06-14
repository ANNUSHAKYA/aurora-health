import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'
import { Platform } from 'react-native'


const SUPABASE_URL = 'https://jozbpofewlkhmrbjjokw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemJwb2Zld2xraG1yYmpqb2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTUxOTMsImV4cCI6MjA5NjczMTE5M30.uuuavG1IN_RsagCovYzxFeAnmmMRA5KHfETb3WDPceY'

// Use window.localStorage directly on web to prevent AsyncStorage library errors
const isWeb = Platform.OS === 'web'
const webStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  }
}

const customStorage = isWeb ? webStorage : AsyncStorage

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
})

