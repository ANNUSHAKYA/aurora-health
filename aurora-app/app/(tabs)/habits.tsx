import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useUserStore } from '../../store/userStore'
import { useHabitStore } from '../../store/habitStore'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'
import Card from '../../components/ui/Card'

const ICONS = ['⭐', '📚', '🧘', '🏃', '🥗', '💊', '🌅', '✍️', '🎯', '🚶']
const TIMES = ['morning', 'afternoon', 'evening', 'anytime']

export default function Habits() {
  const { userId } = useUserStore()
  const { habits, completedIds, setHabits, markComplete } = useHabitStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('⭐')
  const [newTime, setNewTime] = useState('anytime')

  const loadHabits = async () => {
    if (!userId) return
    try {
      const { habits: h } = await api.getHabits(userId)
      setHabits(h || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { loadHabits() }, [])

  const handleComplete = async (habit: any) => {
    if (completedIds.includes(habit.id)) return
    try {
      await api.completeHabit(userId!, habit.id)
      markComplete(habit.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a habit name')
      return
    }
    try {
      await api.createHabit(userId!, newName, newIcon, newTime)
      setNewName('')
      setNewIcon('⭐')
      setNewTime('anytime')
      setModalVisible(false)
      await loadHabits()
    } catch (e) {
      console.error(e)
    }
  }

  const progress = habits.length > 0
    ? completedIds.length / habits.length : 0

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>🔥 Habits</Text>
            <Text style={styles.sub}>Build your daily routine</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <LinearGradient
              colors={['#6C63FF', '#8B85FF']}
              style={styles.addBtnGrad}
            >
              <Text style={styles.addBtnText}>+ New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <Card glow="mint">
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressPct}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={['#00F5A0', '#00D4FF']}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressSub}>
            {completedIds.length} of {habits.length} habits completed
          </Text>
        </Card>

        {/* Habits List */}
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>
              Create your first habit to start building your routine
            </Text>
          </View>
        ) : (
          habits.map((habit: any) => {
            const done = completedIds.includes(habit.id)
            return (
              <TouchableOpacity
                key={habit.id}
                onPress={() => handleComplete(habit)}
                activeOpacity={0.8}
                disabled={done}
              >
                <Card style={[styles.habitCard, done && styles.habitCardDone]}>
                  <View style={styles.habitRow}>
                    <View style={[
                      styles.habitIconCircle,
                      done && styles.habitIconCircleDone
                    ]}>
                      <Text style={styles.habitIconText}>
                        {habit.icon || '⭐'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.habitName,
                        done && styles.habitNameDone
                      ]}>
                        {habit.name}
                      </Text>
                      <Text style={styles.habitTime}>
                        {habit.time_of_day}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkCircle,
                      done && styles.checkCircleDone
                    ]}>
                      {done && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Create Habit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New Habit</Text>

            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Morning meditation"
              placeholderTextColor={Colors.textMuted}
            />

            {/* Icon picker */}
            <Text style={styles.modalLabel}>Choose icon</Text>
            <View style={styles.iconRow}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconBtn,
                    newIcon === ic && styles.iconBtnActive
                  ]}
                  onPress={() => setNewIcon(ic)}
                >
                  <Text style={styles.iconBtnText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time picker */}
            <Text style={styles.modalLabel}>Best time</Text>
            <View style={styles.timeRow}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timeBtn,
                    newTime === t && styles.timeBtnActive
                  ]}
                  onPress={() => setNewTime(t)}
                >
                  <Text style={[
                    styles.timeBtnText,
                    newTime === t && styles.timeBtnTextActive
                  ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleCreate} activeOpacity={0.85}>
              <LinearGradient
                colors={['#6C63FF', '#8B85FF']}
                style={styles.createBtn}
              >
                <Text style={styles.createBtnText}>Create Habit</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heading: {
    fontSize: 28, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, marginTop: 2,
  },
  addBtn: { borderRadius: 12, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: {
    fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15, fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  progressPct: {
    fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.mint,
  },
  progressBg: {
    height: 8, borderRadius: 4,
    backgroundColor: Colors.border, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressSub: {
    fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: 18, fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, textAlign: 'center',
  },
  habitCard: { gap: 0 },
  habitCardDone: { opacity: 0.7 },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  habitIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  habitIconCircleDone: { backgroundColor: Colors.mintGlow },
  habitIconText: { fontSize: 22 },
  habitName: {
    fontSize: 15, fontFamily: 'Inter_500Medium',
    color: Colors.textPrimary,
  },
  habitNameDone: {
    textDecorationLine: 'line-through', color: Colors.textMuted,
  },
  habitTime: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize',
  },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: Colors.mint, borderColor: Colors.mint,
  },
  checkMark: {
    fontSize: 14, color: '#000', fontFamily: 'Inter_700Bold',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#12122A',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, gap: 16,
  },
  modalTitle: {
    fontSize: 22, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary, marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15,
    fontFamily: 'Inter_400Regular', color: Colors.textPrimary,
  },
  modalLabel: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.bgElevated, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  iconBtnText: { fontSize: 20 },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgElevated, alignItems: 'center',
  },
  timeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  timeBtnText: {
    fontSize: 11, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, textTransform: 'capitalize',
  },
  timeBtnTextActive: { color: Colors.primary, fontFamily: 'Inter_500Medium' },
  createBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  createBtnText: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff',
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: {
    fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textMuted,
  },
})
