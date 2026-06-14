import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trash2, Heart, Sparkles } from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';

export default function NutritionScreen() {
  const { mealLogs, addMealLog, deleteMealLog } = useHealthData();
  
  // Custom meal log state
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [calories, setCalories] = useState('300');
  const [protein, setProtein] = useState('20');
  const [carbs, setCarbs] = useState('30');
  const [fat, setFat] = useState('10');

  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const todayMeals = mealLogs.filter(log => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    return logDate === todayDateStr;
  });

  const handleAddMeal = () => {
    if (mealName.trim()) {
      addMealLog({
        type: mealType,
        name: mealName.trim(),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      });
      setMealName('');
      setCalories('300');
      setProtein('20');
      setCarbs('30');
      setFat('10');
    }
  };

  // Preset meals
  const presets = [
    { type: 'Breakfast' as const, name: 'Oatmeal & Protein Powder', calories: 380, protein: 30, carbs: 50, fat: 6 },
    { type: 'Lunch' as const, name: 'Grilled Chicken & Rice Bowl', calories: 550, protein: 45, carbs: 65, fat: 12 },
    { type: 'Dinner' as const, name: 'Baked Salmon & Vegetables', calories: 480, protein: 38, carbs: 20, fat: 26 },
    { type: 'Snack' as const, name: 'Whey Protein Shake & Banana', calories: 280, protein: 26, carbs: 35, fat: 3 },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    addMealLog(preset);
  };

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + m.fat, 0);

  // Targets
  const calorieGoal = 2200;
  const proteinGoal = 140;
  const carbsGoal = 250;
  const fatGoal = 75;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1016', '#1E1215']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nutrition Hub</Text>
            <Text style={styles.subtitle}>Conscious fuel, clean combustion</Text>
          </View>

          {/* Calorie & Macro Target Progress */}
          <View style={styles.card}>
            <View style={styles.calorieOverview}>
              <View>
                <Text style={styles.cTitle}>Calories Logged</Text>
                <Text style={styles.cValue}>{totalCalories} <Text style={styles.cLabel}>/ {calorieGoal} kcal</Text></Text>
              </View>
              <View style={styles.cPercentCircle}>
                <Text style={styles.cPercentText}>{Math.min(100, Math.round((totalCalories/calorieGoal)*100))}%</Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalCalories/calorieGoal)*100)}%`, backgroundColor: '#F43F5E' }]} />
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroCol}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>Protein</Text>
                  <Text style={styles.macroValues}>{totalProtein}/{proteinGoal}g</Text>
                </View>
                <View style={styles.mBarBg}><View style={[styles.mBarFill, { width: `${Math.min(100, (totalProtein/proteinGoal)*100)}%`, backgroundColor: '#F43F5E' }]} /></View>
              </View>

              <View style={styles.macroCol}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>Carbs</Text>
                  <Text style={styles.macroValues}>{totalCarbs}/{carbsGoal}g</Text>
                </View>
                <View style={styles.mBarBg}><View style={[styles.mBarFill, { width: `${Math.min(100, (totalCarbs/carbsGoal)*100)}%`, backgroundColor: '#EAB308' }]} /></View>
              </View>

              <View style={styles.macroCol}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>Fats</Text>
                  <Text style={styles.macroValues}>{totalFat}/{fatGoal}g</Text>
                </View>
                <View style={styles.mBarBg}><View style={[styles.mBarFill, { width: `${Math.min(100, (totalFat/fatGoal)*100)}%`, backgroundColor: '#0EA5E9' }]} /></View>
              </View>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aurora Quick Preset Meals</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
              {presets.map((preset, idx) => (
                <Pressable key={idx} style={styles.presetCard} onPress={() => handleApplyPreset(preset)}>
                  <View style={styles.presetHeader}>
                    <Text style={styles.presetTag}>{preset.type}</Text>
                    <Text style={styles.presetCal}>{preset.calories} cal</Text>
                  </View>
                  <Text style={styles.presetName} numberOfLines={1}>{preset.name}</Text>
                  <Text style={styles.presetMacros}>P: {preset.protein}g | C: {preset.carbs}g | F: {preset.fat}g</Text>
                  <Text style={styles.presetAddText}>+ Log Meal</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Log Custom Meal Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log Custom Meal</Text>
            
            <Text style={styles.fieldLabel}>Meal Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Scrambled Eggs on Toast"
              placeholderTextColor="#7D808A"
              value={mealName}
              onChangeText={setMealName}
            />

            <Text style={styles.fieldLabel}>Meal Type</Text>
            <View style={styles.typeRow}>
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeBtn, mealType === t && styles.typeBtnSelected]}
                  onPress={() => setMealType(t)}
                >
                  <Text style={[styles.typeBtnText, mealType === t && styles.typeBtnTextSelected]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Calories (kcal)</Text>
                <TextInput
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={carbs}
                  onChangeText={setCarbs}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Fats (g)</Text>
                <TextInput
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={fat}
                  onChangeText={setFat}
                />
              </View>
            </View>

            <Pressable style={styles.submitBtn} onPress={handleAddMeal}>
              <Plus size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Log Custom Meal</Text>
            </Pressable>
          </View>

          {/* Daily Food Log list */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logged Food Today</Text>
            <View style={styles.logContainer}>
              {todayMeals.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.logItemHeader}>
                      <Text style={styles.logItemType}>{log.type}</Text>
                      <Text style={styles.logItemName}>{log.name}</Text>
                    </View>
                    <Text style={styles.logItemMacros}>
                      {log.calories} kcal | P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                    </Text>
                  </View>
                  <Pressable style={styles.deleteBtn} onPress={() => deleteMealLog(log.id)}>
                    <Trash2 size={16} color="#7D808A" />
                  </Pressable>
                </View>
              ))}
              {todayMeals.length === 0 && (
                <Text style={styles.emptyText}>No food items logged yet today.</Text>
              )}
            </View>
          </View>

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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  calorieOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cTitle: {
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: '600',
  },
  cValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  cLabel: {
    fontSize: 14,
    color: '#7D808A',
    fontWeight: '600',
  },
  cPercentCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A1C20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F43F5E',
  },
  cPercentText: {
    color: '#F43F5E',
    fontWeight: '700',
    fontSize: 15,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#232530',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  macrosContainer: {
    gap: 12,
  },
  macroCol: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroTitle: {
    fontSize: 13,
    color: '#B0B4BA',
    fontWeight: '600',
  },
  macroValues: {
    fontSize: 12,
    color: '#E0E1E6',
    fontWeight: '600',
  },
  mBarBg: {
    height: 6,
    backgroundColor: '#232530',
    borderRadius: 3,
    overflow: 'hidden',
  },
  mBarFill: {
    height: '100%',
    borderRadius: 3,
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
  presetsScroll: {
    gap: 12,
    paddingRight: 12,
  },
  presetCard: {
    width: 200,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetTag: {
    fontSize: 9,
    color: '#F43F5E',
    backgroundColor: '#2F1E21',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    fontWeight: '700',
    overflow: 'hidden',
  },
  presetCal: {
    fontSize: 11,
    color: '#7D808A',
    fontWeight: '600',
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  presetMacros: {
    fontSize: 10,
    color: '#7D808A',
  },
  presetAddText: {
    fontSize: 12,
    color: '#F43F5E',
    fontWeight: '700',
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#B0B4BA',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnSelected: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  typeBtnText: {
    color: '#B0B4BA',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBtnTextSelected: {
    color: '#fff',
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  formCol: {
    flex: 1,
  },
  smallInput: {
    height: 44,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  submitBtn: {
    height: 52,
    backgroundColor: '#F43F5E',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  logContainer: {
    backgroundColor: '#161720',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22232B',
    padding: 8,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#232530',
  },
  logItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logItemType: {
    fontSize: 10,
    color: '#F43F5E',
    backgroundColor: '#2F1E21',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    fontWeight: '700',
    overflow: 'hidden',
  },
  logItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  logItemMacros: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  emptyText: {
    color: '#7D808A',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
