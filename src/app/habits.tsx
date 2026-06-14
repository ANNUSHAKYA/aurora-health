import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Plus, Trash2, Pause, Play, Flame, Calendar, Sparkles } from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';

export default function HabitsScreen() {
  const { 
    habits, 
    createHabit, 
    toggleHabitCompletion, 
    deleteHabit, 
    pauseHabit,
    getHabitsStreak
  } = useHealthData();

  const [modalVisible, setModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateHabit = () => {
    if (habitName.trim()) {
      createHabit({
        name: habitName.trim(),
        frequency,
        timeOfDay,
        isPaused: false
      });
      setHabitName('');
      setTimeOfDay('morning');
      setFrequency('daily');
      setModalVisible(false);
    }
  };

  // Pre-configured suggestions
  const suggestions = [
    { name: "Morning Meditation", time: 'morning' },
    { name: "Drink 500ml Water", time: 'morning' },
    { name: "15m Muscle Stretching", time: 'afternoon' },
    { name: "Daily Journaling", time: 'evening' },
    { name: "Bedtime Reading", time: 'evening' },
    { name: "Limit Screen Time", time: 'anytime' }
  ] as const;

  const handleApplySuggestion = (name: string, time: 'morning' | 'afternoon' | 'evening' | 'anytime') => {
    createHabit({
      name,
      frequency: 'daily',
      timeOfDay: time,
      isPaused: false
    });
  };

  // Group habits
  const activeHabits = habits.filter(h => !h.isPaused);
  const pausedHabits = habits.filter(h => h.isPaused);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1016', '#091B15']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Habit Loops</Text>
              <Text style={styles.subtitle}>Rewire your routines through consistency</Text>
            </View>
            <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Plus size={20} color="#fff" />
              <Text style={styles.addBtnText}>New Habit</Text>
            </Pressable>
          </View>

          {/* Quick HUD */}
          <View style={styles.hudContainer}>
            <View style={styles.hudBox}>
              <Flame size={24} color="#10B981" />
              <Text style={styles.hudValue}>{getHabitsStreak()} Days</Text>
              <Text style={styles.hudLabel}>Active Streak</Text>
            </View>
            <View style={styles.hudBox}>
              <Calendar size={24} color="#10B981" />
              <Text style={styles.hudValue}>
                {activeHabits.filter(h => h.completedDates.includes(todayStr)).length}/{activeHabits.length}
              </Text>
              <Text style={styles.hudLabel}>Done Today</Text>
            </View>
          </View>

          {/* Active Habits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            {activeHabits.map((habit) => {
              const isCompleted = habit.completedDates.includes(todayStr);
              return (
                <View key={habit.id} style={[styles.habitCard, isCompleted && styles.habitCardCompleted]}>
                  <Pressable 
                    style={styles.habitCheckArea}
                    onPress={() => toggleHabitCompletion(habit.id)}
                  >
                    <View style={[styles.checkbox, isCompleted && styles.checkboxSelected]}>
                      {isCompleted && <Check size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
                        {habit.name}
                      </Text>
                      <View style={styles.habitMetaRow}>
                        <Text style={styles.habitMetaTag}>{habit.timeOfDay}</Text>
                        {habit.streak > 0 && (
                          <View style={styles.habitStreakBadge}>
                            <Flame size={10} color="#10B981" fill="#10B981" />
                            <Text style={styles.habitStreakText}>{habit.streak}d streak</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                  
                  <View style={styles.habitActions}>
                    <Pressable style={styles.actionBtn} onPress={() => pauseHabit(habit.id)}>
                      <Pause size={16} color="#7D808A" />
                    </Pressable>
                    <Pressable style={styles.actionBtn} onPress={() => deleteHabit(habit.id)}>
                      <Trash2 size={16} color="#F43F5E" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
            {activeHabits.length === 0 && (
              <Text style={styles.emptyText}>No active habits today. Create one or try suggestions below!</Text>
            )}
          </View>

          {/* Sugggestions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aurora Recommended Habits</Text>
            <View style={styles.suggestionGrid}>
              {suggestions.map((sug, idx) => (
                <Pressable 
                  key={idx} 
                  style={styles.sugCard}
                  onPress={() => handleApplySuggestion(sug.name, sug.time)}
                >
                  <View style={styles.sugHeader}>
                    <Sparkles size={14} color="#10B981" />
                    <Text style={styles.sugTime}>{sug.time}</Text>
                  </View>
                  <Text style={styles.sugName}>{sug.name}</Text>
                  <Text style={styles.sugAddText}>+ Add Habit</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Paused Habits Section */}
          {pausedHabits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Paused Habits</Text>
              {pausedHabits.map((habit) => (
                <View key={habit.id} style={[styles.habitCard, styles.habitCardPaused]}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.pausedIndicator} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.habitName, styles.habitNamePaused]}>{habit.name}</Text>
                      <Text style={styles.habitMetaTag}>{habit.timeOfDay}</Text>
                    </View>
                  </View>
                  <View style={styles.habitActions}>
                    <Pressable style={styles.actionBtn} onPress={() => pauseHabit(habit.id)}>
                      <Play size={16} color="#10B981" />
                    </Pressable>
                    <Pressable style={styles.actionBtn} onPress={() => deleteHabit(habit.id)}>
                      <Trash2 size={16} color="#F43F5E" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Create Habit Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalCenteredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Create New Habit</Text>
                
                <Text style={styles.fieldLabel}>Habit Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 10m Stretching"
                  placeholderTextColor="#7D808A"
                  value={habitName}
                  onChangeText={setHabitName}
                />

                <Text style={styles.fieldLabel}>Time of Day</Text>
                <View style={styles.selectorRow}>
                  {(['morning', 'afternoon', 'evening', 'anytime'] as const).map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.selectorItem, timeOfDay === t && styles.selectorItemSelected]}
                      onPress={() => setTimeOfDay(t)}
                    >
                      <Text style={[styles.selectorText, timeOfDay === t && styles.selectorTextSelected]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Frequency</Text>
                <View style={styles.selectorRow}>
                  {(['daily', 'weekly'] as const).map((f) => (
                    <Pressable
                      key={f}
                      style={[styles.selectorItem, frequency === f && styles.selectorItemSelected]}
                      onPress={() => setFrequency(f)}
                    >
                      <Text style={[styles.selectorText, frequency === f && styles.selectorTextSelected]}>
                        {f}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.modalSubmit} onPress={handleCreateHabit}>
                    <Text style={styles.modalSubmitText}>Create Habit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1016',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 100 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B4BA',
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  hudContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  hudBox: {
    flex: 1,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  hudValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  hudLabel: {
    fontSize: 11,
    color: '#7D808A',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  habitCard: {
    flexDirection: 'row',
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  habitCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#13211D',
  },
  habitCardPaused: {
    opacity: 0.5,
  },
  habitCheckArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4E5260',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#7D808A',
  },
  habitNamePaused: {
    textDecorationLine: 'line-through',
    color: '#7D808A',
  },
  habitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  habitMetaTag: {
    fontSize: 10,
    color: '#7D808A',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  habitStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2C24',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
  },
  habitStreakText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  pausedIndicator: {
    width: 6,
    height: 36,
    backgroundColor: '#FFB800',
    borderRadius: 3,
  },
  emptyText: {
    color: '#7D808A',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sugCard: {
    width: '47%',
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
  },
  sugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sugTime: {
    fontSize: 9,
    color: '#7D808A',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  sugName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  sugAddText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#161720',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D3039',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#B0B4BA',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    height: 48,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 16,
  },
  selectorItemSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectorText: {
    color: '#B0B4BA',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D3039',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#B0B4BA',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmit: {
    flex: 1,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
