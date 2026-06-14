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

const GOALS = [
  { id: 'hydration', label: 'Improve Hydration', emoji: '💧' },
  { id: 'sleep', label: 'Sleep Better', emoji: '😴' },
  { id: 'habits', label: 'Build Better Habits', emoji: '🔥' },
  { id: 'nutrition', label: 'Eat Healthier', emoji: '🥗' },
  { id: 'energy', label: 'Improve Energy', emoji: '⚡' },
  { id: 'consistency', label: 'Stay Consistent', emoji: '📈' },
]

export default function GoalsOnboarding() {
  const { userId } = useUserStore()
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    if (userId) {
      await api.updateProfile(userId, {
        goals: selected,
        onboarding_complete: true,
      })
    }
    router.replace('/(tabs)')
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, styles.progressActive]}
            />
          ))}
        </View>

        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.heading}>What are your goals?</Text>
        <Text style={styles.sub}>
          Pick as many as you like — Aurora will focus on these
        </Text>

        <View style={styles.goalsGrid}>
          {GOALS.map((g) => {
            const isSelected = selected.includes(g.id)
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalCard, isSelected && styles.goalCardActive]}
                onPress={() => toggle(g.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <Text style={[
                  styles.goalLabel,
                  isSelected && styles.goalLabelActive
                ]}>
                  {g.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity
          onPress={handleFinish}
          activeOpacity={0.85}
          disabled={selected.length === 0}
        >
          <LinearGradient
            colors={selected.length > 0
              ? ['#6C63FF', '#8B85FF']
              : ['#333', '#444']
            }
            style={styles.btn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>
              {selected.length > 0
                ? `Start my journey 🌟`
                : 'Pick at least one goal'
              }
            </Text>
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
  goalsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  goalCard: {
    width: '47%', paddingVertical: 20,
    paddingHorizontal: 16, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', gap: 8, position: 'relative',
  },
  goalCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  goalEmoji: { fontSize: 32 },
  goalLabel: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary, textAlign: 'center',
  },
  goalLabelActive: { color: Colors.primary },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: {
    fontSize: 11, color: '#fff', fontFamily: 'Inter_700Bold',
  },
  btn: {
    paddingVertical: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnText: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff',
  },
})
