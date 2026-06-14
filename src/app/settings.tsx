import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Key, Heart, Brain, Trash2, Check, Sparkles, Database } from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';

export default function SettingsScreen() {
  const {
    profile,
    updateProfile,
    memories,
    deleteMemory,
    syncDevice,
    setSyncDevice,
    units,
    setUnits,
    geminiApiKey,
    setGeminiApiKey,
    resetAllData
  } = useHealthData();

  const [editName, setEditName] = useState(profile.name);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = () => {
    updateProfile({ name: editName.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleGoal = (goal: string) => {
    const goals = profile.goals.includes(goal)
      ? profile.goals.filter(g => g !== goal)
      : [...profile.goals, goal];
    updateProfile({ goals });
  };

  const availableGoals = [
    "Improve Hydration",
    "Sleep Better",
    "Build Better Habits",
    "Eat Healthier",
    "Improve Energy Levels",
    "Improve Consistency"
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1016', '#1A1B24']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings & Profile</Text>
            <Text style={styles.subtitle}>Configure your companion and sync integrations</Text>
          </View>

          {/* Profile Name Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={18} color="#6366F1" />
              <Text style={styles.cardTitle}>Personal Profile</Text>
            </View>
            <Text style={styles.fieldLabel}>Display Name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#7D808A"
              />
              <Pressable style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>

            <View style={styles.metricsSummary}>
              <View style={styles.metricItem}>
                <Text style={styles.mValue}>{profile.age} yrs</Text>
                <Text style={styles.mLabel}>Age</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.mValue}>{profile.height} cm</Text>
                <Text style={styles.mLabel}>Height</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.mValue}>{profile.weight} kg</Text>
                <Text style={styles.mLabel}>Weight</Text>
              </View>
            </View>
          </View>

          {/* Health Memory Layer */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Brain size={18} color="#A855F7" />
              <Text style={styles.cardTitle}>Aurora Health Memory</Text>
            </View>
            <Text style={styles.cardDesc}>
              Observations Aurora has recorded through conversation & tracking patterns.
            </Text>
            <View style={styles.memoriesContainer}>
              {memories.map((mem) => (
                <View key={mem.id} style={styles.memoryRow}>
                  <View style={styles.memoryLeft}>
                    <Sparkles size={12} color="#A855F7" style={{ marginTop: 3 }} />
                    <Text style={styles.memoryContent}>{mem.content}</Text>
                  </View>
                  <Pressable onPress={() => deleteMemory(mem.id)} style={styles.deleteMemoryBtn}>
                    <Trash2 size={14} color="#7D808A" />
                  </Pressable>
                </View>
              ))}
              {memories.length === 0 && (
                <Text style={styles.emptyText}>No observations recorded yet. Chat with Aurora to build memory!</Text>
              )}
            </View>
          </View>

          {/* Focus Goals Manager */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Heart size={18} color="#F43F5E" />
              <Text style={styles.cardTitle}>Health Goals</Text>
            </View>
            <View style={styles.goalsGrid}>
              {availableGoals.map((goal) => {
                const isSelected = profile.goals.includes(goal);
                return (
                  <Pressable
                    key={goal}
                    style={[styles.goalItem, isSelected && styles.goalItemSelected]}
                    onPress={() => toggleGoal(goal)}
                  >
                    <Text style={[styles.goalText, isSelected && styles.goalTextSelected]}>
                      {goal}
                    </Text>
                    {isSelected && <Check size={12} color="#fff" />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Gemini API Key */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Key size={18} color="#EAB308" />
              <Text style={styles.cardTitle}>Gemini API Brain Key</Text>
            </View>
            <Text style={styles.cardDesc}>
              Optionally enter a developer Gemini API key to activate the live LLM companion engine.
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="AIzaSy..."
                placeholderTextColor="#7D808A"
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
              />
              <Pressable style={[styles.saveBtn, { backgroundColor: '#EAB308' }]} onPress={handleSaveApiKey}>
                <Text style={styles.saveBtnText}>Apply</Text>
              </Pressable>
            </View>
          </View>

          {/* Device Sync & Unit System */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Database size={18} color="#0EA5E9" />
              <Text style={styles.cardTitle}>Integrations & Units</Text>
            </View>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Apple Health / Fitbit Sync</Text>
                <Text style={styles.settingSub}>Import water, sleep, and macro details automatically.</Text>
              </View>
              <Switch
                value={syncDevice}
                onValueChange={setSyncDevice}
                trackColor={{ false: '#2A2C35', true: '#0EA5E9' }}
              />
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Measurement System</Text>
                <Text style={styles.settingSub}>Select units for height and weight metrics.</Text>
              </View>
              <View style={styles.unitsToggle}>
                <Pressable
                  style={[styles.unitBtn, units === 'metric' && styles.unitBtnActive]}
                  onPress={() => setUnits('metric')}
                >
                  <Text style={[styles.unitBtnText, units === 'metric' && styles.unitBtnTextActive]}>Metric</Text>
                </Pressable>
                <Pressable
                  style={[styles.unitBtn, units === 'imperial' && styles.unitBtnActive]}
                  onPress={() => setUnits('imperial')}
                >
                  <Text style={[styles.unitBtnText, units === 'imperial' && styles.unitBtnTextActive]}>Imperial</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Danger zone / resets */}
          <View style={styles.dangerSection}>
            <Pressable style={styles.resetBtn} onPress={resetAllData}>
              <Trash2 size={16} color="#F43F5E" />
              <Text style={styles.resetBtnText}>Reset Prototype Data</Text>
            </Pressable>
            <Text style={styles.dangerLabel}>
              Clears all local storage, logs, profile details, and prompts onboarding again.
            </Text>
          </View>

          {isSaved && (
            <View style={styles.savedOverlay}>
              <Text style={styles.savedText}>Settings Updated Successfully</Text>
            </View>
          )}

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
    marginTop: 20,
    marginBottom: 24,
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
  card: {
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cardDesc: {
    fontSize: 12,
    color: '#7D808A',
    lineHeight: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#B0B4BA',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#fff',
  },
  saveBtn: {
    paddingHorizontal: 16,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  metricsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#232530',
    paddingTop: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  mValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  mLabel: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 4,
  },
  memoriesContainer: {
    backgroundColor: '#1E1F28',
    borderRadius: 16,
    padding: 12,
  },
  memoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2E3C',
  },
  memoryLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  memoryContent: {
    color: '#D8B4FE',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    flex: 1,
  },
  deleteMemoryBtn: {
    padding: 2,
    marginLeft: 10,
  },
  emptyText: {
    color: '#7D808A',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 14,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 16,
  },
  goalItemSelected: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  goalText: {
    color: '#B0B4BA',
    fontSize: 11,
    fontWeight: '600',
  },
  goalTextSelected: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#232530',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  settingSub: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 2,
    maxWidth: 240,
  },
  unitsToggle: {
    flexDirection: 'row',
    backgroundColor: '#1C1D24',
    borderRadius: 8,
    padding: 2,
  },
  unitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: '#0EA5E9',
  },
  unitBtnText: {
    color: '#7D808A',
    fontSize: 11,
    fontWeight: '600',
  },
  unitBtnTextActive: {
    color: '#fff',
  },
  dangerSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FF5A79',
    borderRadius: 24,
    marginBottom: 10,
  },
  resetBtnText: {
    color: '#F43F5E',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerLabel: {
    color: '#7D808A',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  savedOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  savedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
