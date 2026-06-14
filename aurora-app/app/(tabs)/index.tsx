import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Dimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useUserStore } from '../../store/userStore'
import { useHydrationStore } from '../../store/hydrationStore'
import { useSleepStore } from '../../store/sleepStore'
import { useHabitStore } from '../../store/habitStore'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'
import Card from '../../components/ui/Card'
import ProgressRing from '../../components/ui/ProgressRing'

const { width } = Dimensions.get('window')

export default function Dashboard() {
  const { userId, profile, setProfile } = useUserStore()
  const { totalMl, goalMl, setTotal, setGoal } = useHydrationStore()
  const { lastSleep, setLastSleep, setWeeklyAvg } = useSleepStore()
  const { habits, completedIds, setHabits } = useHabitStore()
  const [refreshing, setRefreshing] = useState(false)
  const [insight, setInsight] = useState('')

  const generateInsight = (water: number, sleep: number) => {
    const insights = []
    if (water < 1000) insights.push("You're behind on hydration — drink a glass now! 💧")
    else if (water >= 2000) insights.push("Great hydration today! Keep it going 🌊")
    if (sleep && sleep < 6) insights.push("You slept less than 6 hours. Prioritize rest tonight 😴")
    else if (sleep && sleep >= 7) insights.push("Solid sleep last night! Your body is recovering well ✨")
    if (!insights.length) insights.push("Welcome back! Let's make today a healthy one 🌟")
    setInsight(insights[0])
  }

  const loadData = useCallback(async () => {
    if (!userId) return
    try {
      // Profile
      const { profile: p } = await api.getProfile(userId)
      if (p) {
        setProfile(p)
        setGoal(p.daily_water_goal_ml || 2500)
      }

      // Hydration
      const { total_ml } = await api.getHydration(userId)
      setTotal(total_ml || 0)

      // Sleep
      const { logs } = await api.getSleep(userId)
      if (logs?.length) {
        setLastSleep(logs[0].duration_hours)
        const avg = logs.reduce((s: number, l: any) =>
          s + l.duration_hours, 0) / logs.length
        setWeeklyAvg(Math.round(avg * 10) / 10)
      }

      // Habits
      const { habits: h } = await api.getHabits(userId)
      setHabits(h || [])

      // Generate insight
      generateInsight(total_ml || 0, logs?.[0]?.duration_hours)
    } catch (e) {
      console.error(e)
    }
  }, [userId, setProfile, setGoal, setTotal, setLastSleep, setWeeklyAvg, setHabits])

  useEffect(() => { loadData() }, [loadData])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const waterProgress = goalMl > 0 ? totalMl / goalMl : 0
  const habitProgress = habits.length > 0
    ? completedIds.length / habits.length : 0
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B', '#0A0A1A']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>
              {profile?.name || 'Friend'} 👋
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(profile?.name || 'A')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Insight Card */}
        <LinearGradient
          colors={['#1A1040', '#1A2040']}
          style={styles.insightCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.insightRow}>
            <Text style={styles.insightIcon}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightLabel}>Daily Insight</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Water + Sleep Row */}
        <View style={styles.row}>
          {/* Water Card */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/hydration')}
            activeOpacity={0.85}
          >
            <Card style={styles.halfCard} glow="aqua">
              <Text style={styles.cardTitle}>💧 Water</Text>
              <View style={styles.ringCenter}>
                <ProgressRing
                  size={80} strokeWidth={7}
                  progress={waterProgress}
                  color={Colors.aqua}
                />
                <View style={styles.ringTextOverlay}>
                  <Text style={styles.ringValue}>
                    {Math.round(waterProgress * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSub}>
                {totalMl}ml / {goalMl}ml
              </Text>
            </Card>
          </TouchableOpacity>

          {/* Sleep Card */}
          <Card style={styles.halfCard} glow="purple">
            <Text style={styles.cardTitle}>😴 Sleep</Text>
            <Text style={styles.bigNumber}>
              {lastSleep ? `${lastSleep}h` : '--'}
            </Text>
            <Text style={styles.cardSub}>last night</Text>
          </Card>
        </View>

        {/* Habits Card */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/habits')}
          activeOpacity={0.85}
        >
          <Card style={styles.fullCard} glow="mint">
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>🔥 Habits</Text>
              <Text style={styles.cardLink}>View all →</Text>
            </View>
            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={['#00F5A0', '#00D4FF']}
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round(habitProgress * 100)}%` }
                ]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <View style={styles.habitStatsRow}>
              <Text style={styles.habitStat}>
                <Text style={styles.habitStatNum}>{completedIds.length}</Text>
                {' '}done
              </Text>
              <Text style={styles.habitStat}>
                <Text style={styles.habitStatNum}>
                  {habits.length - completedIds.length}
                </Text>
                {' '}remaining
              </Text>
              <Text style={styles.habitStat}>
                <Text style={{ color: Colors.mint }}>
                  {Math.round(habitProgress * 100)}%
                </Text>
              </Text>
            </View>

            {/* Show first 3 habits */}
            {habits.slice(0, 3).map((h: any) => (
              <View key={h.id} style={styles.habitRow}>
                <Text style={styles.habitIcon}>{h.icon || '⭐'}</Text>
                <Text style={styles.habitName}>{h.name}</Text>
                <View style={[
                  styles.habitDot,
                  completedIds.includes(h.id) && styles.habitDotDone
                ]} />
              </View>
            ))}
          </Card>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <View style={styles.quickRow}>
          {[
            { emoji: '💧', label: 'Water', onPress: () => router.push('/(tabs)/hydration') },
            { emoji: '😴', label: 'Sleep', onPress: () => router.push('/(tabs)/habits') },
            { emoji: '✨', label: 'Ask AI', onPress: () => router.push('/(tabs)/companion') },
            { emoji: '🥗', label: 'Meal', onPress: () => router.push('/(tabs)/habits') },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickBtn}
              onPress={q.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.quickEmoji}>{q.emoji}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Aurora CTA */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/companion')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1A0A40', '#0A1A40']}
            style={styles.auroraCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={styles.auroraEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.auroraTitle}>Talk to Aurora</Text>
              <Text style={styles.auroraSubtitle}>
                "How am I doing this week?"
              </Text>
            </View>
            <Text style={styles.auroraArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 15, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  name: {
    fontSize: 26, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18, fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  insightCard: {
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: 'rgba(108,99,255,0.2)',
  },
  insightRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  insightIcon: { fontSize: 24, marginTop: 2 },
  insightLabel: {
    fontSize: 11, fontFamily: 'Inter_600SemiBold',
    color: Colors.primary, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 4,
  },
  insightText: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary, lineHeight: 20,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfCard: { gap: 8 },
  fullCard: { gap: 12 },
  cardTitle: {
    fontSize: 13, fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLink: {
    fontSize: 12, fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  ringCenter: { alignItems: 'center', position: 'relative', marginVertical: 4 },
  ringTextOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  ringValue: {
    fontSize: 16, fontFamily: 'Inter_700Bold',
    color: Colors.aqua,
  },
  bigNumber: {
    fontSize: 36, fontFamily: 'Inter_700Bold',
    color: Colors.primary, marginVertical: 4,
  },
  cardSub: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  progressBarBg: {
    height: 8, borderRadius: 4,
    backgroundColor: Colors.border, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  habitStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitStat: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  habitStatNum: {
    fontFamily: 'Inter_700Bold', color: Colors.textPrimary,
  },
  habitRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 4,
  },
  habitIcon: { fontSize: 16 },
  habitName: {
    flex: 1, fontSize: 14,
    fontFamily: 'Inter_400Regular', color: Colors.textPrimary,
  },
  habitDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.border,
  },
  habitDotDone: { backgroundColor: Colors.mint },
  sectionTitle: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary, marginTop: 4,
  },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1, backgroundColor: Colors.bgCard,
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: {
    fontSize: 11, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  auroraCard: {
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    gap: 14, borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.25)',
  },
  auroraEmoji: { fontSize: 28 },
  auroraTitle: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  auroraSubtitle: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, marginTop: 2,
  },
  auroraArrow: {
    fontSize: 20, color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
})
