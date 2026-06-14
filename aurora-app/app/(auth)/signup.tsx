import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Colors } from '../../constants/colors'
import { useUserStore } from '../../store/userStore'

export default function Signup() {
  const { setUserId, setAuthenticated } = useUserStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)


  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setLoading(false)
        Alert.alert('Signup Failed', error.message)
        return
      }

      // Save name to profile
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ name })
          .eq('id', data.user.id)
      }

      setLoading(false)
      router.replace('/(onboarding)/personal')
    } catch (err: any) {
      setLoading(false)
      Alert.alert('Signup Error', err.message || 'An unexpected error occurred')
    }
  }


  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.back}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>
            Start your Aurora journey today
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={['#6C63FF', '#8B85FF']}
                style={styles.btn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Bypass Auth */}
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: '#6C63FF', borderStyle: 'dashed', marginTop: 12 }]}
              activeOpacity={0.8}
              onPress={() => {
                setUserId('mock-user-123')
                setAuthenticated(true)
                router.replace('/(onboarding)/personal')
              }}
            >
              <Text style={[styles.socialBtnText, { color: '#8B85FF' }]}>⚡  Bypass Auth (Demo Mode)</Text>
            </TouchableOpacity>
          </View>


          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 40,
  },
  back: { marginBottom: 32 },
  backText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  heading: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginBottom: 36,
  },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  socialBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
  },
  socialBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textPrimary,
  },
})
