import { useEffect, useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useUserStore } from '../../store/userStore'
import { useHydrationStore } from '../../store/hydrationStore'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'
import Card from '../../components/ui/Card'

const QUICK_AMOUNTS = [
  { label: 'Sip', ml: 100, emoji: '🥛' },
  { label: 'Glass', ml: 250, emoji: '🥤' },
  { label: 'Bottle', ml: 500, emoji: '🍶' },
  { label: 'Large', ml: 750, emoji: '🫙' },
]

export default function Hydration() {
  const { userId } = useUserStore()
  const { totalMl, goalMl, logs, setTotal, setLogs } = useHydrationStore()
  const [adding, setAdding] = useState(false)
  const fillAnim = useRef(new Animated.Value(0)).current

  const progress = goalMl > 0 ? Math.min(totalMl / goalMl, 1) : 0

  const loadHydration = async () => {
    if (!userId) return
    try {
      const { total_ml, logs: l } = await api.getHydration(userId)
      setTotal(total_ml || 0)
      setLogs(l || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadHydration()
  }, [])

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start()
  }, [progress, fillAnim])

  const addWater = async (ml: number) => {
    if (!userId || adding) return
    setAdding(true)
    try {
      await api.logWater(userId, ml)
      await loadHydration()
    } catch (e) {
      console.error(e)
    } finally {
      setAdding(false)
    }
  }

  const bottleHeight = 200
  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bottleHeight],
  })

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>💧 Hydration</Text>
        <Text style={styles.sub}>Stay hydrated, stay sharp</Text>

        {/* Water Bottle Visual */}
        <View style={styles.bottleContainer}>
          <View style={styles.bottle}>
            {/* Water fill animation */}
            <Animated.View style={[styles.waterFill, { height: fillHeight }]}>
              <LinearGradient
                colors={['#00D4FF', '#0088CC']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            {/* Bottle label */}
            <View style={styles.bottleLabel}>
              <Text style={styles.bottlePercent}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.bottleMl}>{totalMl}ml</Text>
            </View>
          </View>
          <Text style={styles.goalText}>Goal: {goalMl}ml</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalMl}ml</Text>
            <Text style={styles.statLabel}>Today</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.aqua }]}>
              {Math.max(0, goalMl - totalMl)}ml
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.mint }]}>
              {logs.length}
            </Text>
            <Text style={styles.statLabel}>Logs</Text>
          </Card>
        </View>

        {/* Quick Add */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickGrid}>
          {QUICK_AMOUNTS.map((q) => (
            <TouchableOpacity
              key={q.ml}
              style={styles.quickCard}
              onPress={() => addWater(q.ml)}
              activeOpacity={0.75}
              disabled={adding}
            >
              <Text style={styles.quickEmoji}>{q.emoji}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
              <Text style={styles.quickMl}>+{q.ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Log */}
        {logs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            <Card>
              {logs.slice(0, 8).map((log: any, i: number) => {
                const slicedLogs = logs.slice(0, 8)
                return (
                  <View key={log.id} style={[
                    styles.logRow,
                    i < slicedLogs.length - 1 && styles.logRowBorder
                  ]}>
                    <Text style={styles.logEmoji}>💧</Text>
                    <Text style={styles.logAmount}>{log.amount_ml}ml</Text>
                    <Text style={styles.logTime}>
                      {new Date(log.logged_at).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </Text>
                  </View>
                )
              })}
            </Card>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, gap: 16 },
  heading: {
    fontSize: 28, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, marginTop: -8,
  },
  bottleContainer: { alignItems: 'center', marginVertical: 8 },
  bottle: {
    width: 100, height: 200,
    borderRadius: 50,
    borderWidth: 2, borderColor: Colors.aqua,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,212,255,0.05)',
    justifyContent: 'flex-end',
  },
  waterFill: { width: '100%', position: 'absolute', bottom: 0 },
  bottleLabel: {
    position: 'absolute', top: 0, left: 0,
    right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  bottlePercent: {
    fontSize: 22, fontFamily: 'Inter_700Bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottleMl: {
    fontSize: 12, fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  goalText: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: Colors.textMuted, marginTop: 10,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: 14 },
  statValue: {
    fontSize: 18, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11, fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  quickCard: {
    width: '47%', backgroundColor: Colors.bgCard,
    borderRadius: 16, paddingVertical: 20,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  quickMl: {
    fontSize: 15, fontFamily: 'Inter_700Bold',
    color: Colors.aqua,
  },
  logRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  logRowBorder: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logEmoji: { fontSize: 16 },
  logAmount: {
    flex: 1, fontSize: 15,
    fontFamily: 'Inter_500Medium', color: Colors.textPrimary,
  },
  logTime: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
})
