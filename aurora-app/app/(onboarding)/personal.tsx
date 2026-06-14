import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Dimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useUserStore } from '../../store/userStore'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

export default function PersonalOnboarding() {
  const { userId } = useUserStore()
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const handleNext = async () => {
    if (userId) {
      await api.updateProfile(userId, {
        age: parseInt(age) || null,
        gender,
        height_cm: parseFloat(height) || null,
        weight_kg: parseFloat(weight) || null,
      })
    }
    router.push('/(onboarding)/lifestyle')
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, i === 1 && styles.progressActive]}
            />
          ))}
        </View>

        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.heading}>Tell us about yourself</Text>
        <Text style={styles.sub}>
          This helps Aurora personalize your experience
        </Text>

        {/* Age */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 25"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, gender === g && styles.chipActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[
                  styles.chipText,
                  gender === g && styles.chipTextActive
                ]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Height */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 170"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        {/* Weight */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 65"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={['#6C63FF', '#8B85FF']}
            style={styles.btn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 28, paddingTop: 70, paddingBottom: 40, gap: 16 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  progressDot: {
    height: 4, flex: 1, borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressActive: { backgroundColor: Colors.primary },
  step: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.primary, marginBottom: 4,
  },
  heading: {
    fontSize: 28, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary, marginBottom: 6,
  },
  sub: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, marginBottom: 8,
  },
  inputGroup: { gap: 8 },
  label: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 16, fontSize: 15,
    fontFamily: 'Inter_400Regular', color: Colors.textPrimary,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 50, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  chipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.primary, fontFamily: 'Inter_500Medium' },
  btn: {
    paddingVertical: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 16,
  },
  btnText: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff',
  },
})
