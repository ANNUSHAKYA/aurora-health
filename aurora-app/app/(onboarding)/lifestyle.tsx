import { useState } from 'react'
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useUserStore } from '../../store/userStore'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'

const WAKE_TIMES = ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM']
const BED_TIMES = ['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '1:00 AM']
const ACTIVITY = [
  { label: 'Sedentary', emoji: '🪑' },
  { label: 'Light', emoji: '🚶' },
  { label: 'Moderate', emoji: '🏃' },
  { label: 'Active', emoji: '💪' },
]

export default function LifestyleOnboarding() {
  const { userId } = useUserStore()
  const [wakeTime, setWakeTime] = useState('')
  const [bedTime, setBedTime] = useState('')
  const [activity, setActivity] = useState('')

  const handleNext = async () => {
    if (userId) {
      await api.updateProfile(userId, {
        wake_time: wakeTime,
        bed_time: bedTime,
        activity_level: activity,
      })
    }
    router.push('/(onboarding)/goals')
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= 2 && styles.progressActive
              ]}
            />
          ))}
        </View>

        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.heading}>Your lifestyle</Text>
        <Text style={styles.sub}>
          Aurora uses this to build your daily rhythm
        </Text>

        {/* Wake time */}
        <View style={styles.section}>
          <Text style={styles.label}>⏰  Wake-up Time</Text>
          <View style={styles.chipRow}>
            {WAKE_TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, wakeTime === t && styles.chipActive]}
                onPress={() => setWakeTime(t)}
              >
                <Text style={[
                  styles.chipText,
                  wakeTime === t && styles.chipTextActive
                ]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bed time */}
        <View style={styles.section}>
          <Text style={styles.label}>🌙  Bedtime</Text>
          <View style={styles.chipRow}>
            {BED_TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, bedTime === t && styles.chipActive]}
                onPress={() => setBedTime(t)}
              >
                <Text style={[
                  styles.chipText,
                  bedTime === t && styles.chipTextActive
                ]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.section}>
          <Text style={styles.label}>🏋️  Activity Level</Text>
          <View style={styles.activityRow}>
            {ACTIVITY.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={[
                  styles.activityCard,
                  activity === a.label && styles.activityCardActive
                ]}
                onPress={() => setActivity(a.label)}
              >
                <Text style={styles.activityEmoji}>{a.emoji}</Text>
                <Text style={[
                  styles.activityLabel,
                  activity === a.label && styles.activityLabelActive
                ]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  inner: { paddingHorizontal: 28, paddingTop: 70, paddingBottom: 40, gap: 20 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  progressDot: {
    height: 4, flex: 1, borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressActive: { backgroundColor: Colors.primary },
  step: {
    fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.primary,
  },
  heading: {
    fontSize: 28, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary, marginBottom: 4,
  },
  sub: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  section: { gap: 12 },
  label: {
    fontSize: 14, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 50, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  chipActive: {
    backgroundColor: Colors.primaryGlow, borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.primary, fontFamily: 'Inter_500Medium' },
  activityRow: { flexDirection: 'row', gap: 10 },
  activityCard: {
    flex: 1, paddingVertical: 16,
    borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgCard,
    alignItems: 'center', gap: 6,
  },
  activityCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  activityEmoji: { fontSize: 24 },
  activityLabel: {
    fontSize: 11, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  activityLabelActive: { color: Colors.primary },
  btn: {
    paddingVertical: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnText: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff',
  },
})
