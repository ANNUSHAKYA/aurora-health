import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, Droplet, Moon, CheckSquare, Sparkles, 
  Flame, Award, ArrowRight, User, Settings, Check, Clock, ChevronRight 
} from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';

export default function HomeScreen() {
  const { 
    profile, 
    updateProfile, 
    setOnboardingCompleted, 
    waterLogs, 
    waterGoal, 
    addWaterLog,
    sleepLogs, 
    habits, 
    toggleHabitCompletion, 
    mealLogs,
    getWaterStreak,
    getSleepStreak,
    getHabitsStreak,
    memories
  } = useHealthData();

  // Onboarding local state
  const [onboardingStep, setOnboardingStep] = useState(0); // 0 to 4: Slides, 5 to 9: Questionnaire
  const [tempProfile, setTempProfile] = useState({
    name: '',
    age: '25',
    gender: 'Other',
    height: '170',
    weight: '65',
    wakeUpTime: '07:00',
    bedtime: '22:30',
    activityLevel: 'Moderate',
    goals: [] as string[],
    preferences: {
      hydration: true,
      sleep: true,
      habits: true,
      insights: true,
    }
  });

  const onboardingSlides = [
    {
      title: "Understand yourself better every day.",
      subtitle: "Meet your personal health companion.",
      color: ['#1A1B2F', '#16192B'],
      accent: '#6366F1'
    },
    {
      title: "Holistic Health Tracking",
      subtitle: "Track hydration, sleep, habits, and nutrition effortlessly.",
      color: ['#121829', '#14213d'],
      accent: '#0EA5E9'
    },
    {
      title: "Personalized Daily Insights",
      subtitle: "Receive guidance that adapts to your daily routine.",
      color: ['#18122B', '#2A2050'],
      accent: '#A855F7'
    },
    {
      title: "Habit Formation & Routine",
      subtitle: "Build healthier habits through consistent daily actions.",
      color: ['#0A251C', '#0E3A2F'],
      accent: '#10B981'
    },
    {
      title: "A Companion Who Learns",
      subtitle: "Aurora understands your preferences and patterns over time.",
      color: ['#1A1B2F', '#2A2050'],
      accent: '#F43F5E'
    }
  ];

  const toggleGoal = (goal: string) => {
    setTempProfile(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const handleNextOnboarding = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(onboardingStep + 1);
    } else if (onboardingStep === 4) {
      setOnboardingStep(5); // Enter questionnaire
    } else if (onboardingStep === 5) {
      if (!tempProfile.name.trim()) return; // Require name
      setOnboardingStep(6);
    } else if (onboardingStep < 9) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Save setup and complete onboarding
      updateProfile({
        name: tempProfile.name,
        age: parseInt(tempProfile.age) || 25,
        gender: tempProfile.gender,
        height: parseInt(tempProfile.height) || 170,
        weight: parseInt(tempProfile.weight) || 65,
        wakeUpTime: tempProfile.wakeUpTime,
        bedtime: tempProfile.bedtime,
        activityLevel: tempProfile.activityLevel,
        goals: tempProfile.goals,
        preferences: tempProfile.preferences,
      });
      setOnboardingCompleted(true);
    }
  };

  // Render Onboarding Slides
  if (!profile.hasCompletedOnboarding) {
    if (onboardingStep <= 4) {
      const slide = onboardingSlides[onboardingStep];
      return (
        <LinearGradient colors={slide.color as any} style={styles.onboardingContainer}>
          <SafeAreaView style={styles.onboardingInner}>
            <View style={styles.progressDots}>
              {onboardingSlides.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: i === onboardingStep ? slide.accent : 'rgba(255,255,255,0.2)' }
                  ]} 
                />
              ))}
            </View>

            <View style={styles.slideHero}>
              <View style={[styles.glowCircle, { backgroundColor: slide.accent, opacity: 0.15 }]} />
              <Heart size={80} color={slide.accent} style={styles.onboardingIcon} />
            </View>

            <View style={styles.slideTextContainer}>
              <Text style={styles.onboardingTitle}>{slide.title}</Text>
              <Text style={styles.onboardingSubtitle}>{slide.subtitle}</Text>
            </View>

            <Pressable 
              style={[styles.primaryButton, { backgroundColor: slide.accent }]} 
              onPress={handleNextOnboarding}
            >
              <Text style={styles.buttonText}>
                {onboardingStep === 4 ? "Let's Get Started" : "Continue"}
              </Text>
              <ArrowRight size={20} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </LinearGradient>
      );
    }

    // Render Questionnaire Steps
    return (
      <View style={styles.setupContainer}>
        <LinearGradient colors={['#0F1016', '#1A1B2F']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.setupInner}>
          {/* Header */}
          <View style={styles.setupHeader}>
            <Text style={styles.setupStepIndicator}>Step {onboardingStep - 4} of 5</Text>
            <Text style={styles.setupTitle}>
              {onboardingStep === 5 && "Tell us about yourself"}
              {onboardingStep === 6 && "Your current metrics"}
              {onboardingStep === 7 && "Daily sleep schedule"}
              {onboardingStep === 8 && "Select your goals"}
              {onboardingStep === 9 && "Notification reminders"}
            </Text>
          </View>

          {/* Form Content */}
          <ScrollView contentContainerStyle={styles.setupForm}>
            {onboardingStep === 5 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>What should we call you?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#7D808A"
                  value={tempProfile.name}
                  onChangeText={(name) => setTempProfile(prev => ({ ...prev, name }))}
                />
                
                <Text style={styles.label}>Gender Identity</Text>
                <View style={styles.selectRow}>
                  {['Female', 'Male', 'Non-binary', 'Other'].map((g) => (
                    <Pressable
                      key={g}
                      style={[
                        styles.selectItem,
                        tempProfile.gender === g && styles.selectItemSelected
                      ]}
                      onPress={() => setTempProfile(prev => ({ ...prev, gender: g }))}
                    >
                      <Text style={[styles.selectText, tempProfile.gender === g && styles.selectTextSelected]}>
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {onboardingStep === 6 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Age (years)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempProfile.age}
                  onChangeText={(age) => setTempProfile(prev => ({ ...prev, age }))}
                />

                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempProfile.height}
                  onChangeText={(height) => setTempProfile(prev => ({ ...prev, height }))}
                />

                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempProfile.weight}
                  onChangeText={(weight) => setTempProfile(prev => ({ ...prev, weight }))}
                />
              </View>
            )}

            {onboardingStep === 7 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ideal Wake-up Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM (e.g. 07:00)"
                  placeholderTextColor="#7D808A"
                  value={tempProfile.wakeUpTime}
                  onChangeText={(time) => setTempProfile(prev => ({ ...prev, wakeUpTime: time }))}
                />

                <Text style={styles.label}>Ideal Bedtime</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM (e.g. 22:30)"
                  placeholderTextColor="#7D808A"
                  value={tempProfile.bedtime}
                  onChangeText={(time) => setTempProfile(prev => ({ ...prev, bedtime: time }))}
                />

                <Text style={styles.label}>Physical Activity Level</Text>
                <View style={styles.selectRow}>
                  {['Sedentary', 'Moderate', 'Active'].map((act) => (
                    <Pressable
                      key={act}
                      style={[
                        styles.selectItem,
                        tempProfile.activityLevel === act && styles.selectItemSelected
                      ]}
                      onPress={() => setTempProfile(prev => ({ ...prev, activityLevel: act }))}
                    >
                      <Text style={[styles.selectText, tempProfile.activityLevel === act && styles.selectTextSelected]}>
                        {act}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {onboardingStep === 8 && (
              <View style={styles.formGroup}>
                <Text style={styles.subtitleLabel}>Choose one or more areas to focus on:</Text>
                {[
                  "Improve Hydration",
                  "Sleep Better",
                  "Build Better Habits",
                  "Eat Healthier",
                  "Improve Energy Levels",
                  "Improve Consistency"
                ].map((g) => {
                  const isSelected = tempProfile.goals.includes(g);
                  return (
                    <Pressable
                      key={g}
                      style={[styles.goalCheckItem, isSelected && styles.goalCheckItemSelected]}
                      onPress={() => toggleGoal(g)}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Check size={14} color="#fff" />}
                      </View>
                      <Text style={styles.goalCheckText}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {onboardingStep === 9 && (
              <View style={styles.formGroup}>
                <Text style={styles.subtitleLabel}>Enable personalized daily push reminders:</Text>
                <View style={styles.settingToggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Hydration Reminders</Text>
                    <Text style={styles.toggleDesc}>Friendly prompts to hit your water target.</Text>
                  </View>
                  <Switch
                    value={tempProfile.preferences.hydration}
                    onValueChange={(val) => setTempProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, hydration: val }
                    }))}
                    trackColor={{ false: '#2A2C35', true: '#6366F1' }}
                  />
                </View>

                <View style={styles.settingToggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Sleep Sleep Schedule Reminders</Text>
                    <Text style={styles.toggleDesc}>Prep notifications for wind-down bedtime.</Text>
                  </View>
                  <Switch
                    value={tempProfile.preferences.sleep}
                    onValueChange={(val) => setTempProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, sleep: val }
                    }))}
                    trackColor={{ false: '#2A2C35', true: '#6366F1' }}
                  />
                </View>

                <View style={styles.settingToggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Habit Completion Alerts</Text>
                    <Text style={styles.toggleDesc}>Keep your streaks alive!</Text>
                  </View>
                  <Switch
                    value={tempProfile.preferences.habits}
                    onValueChange={(val) => setTempProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, habits: val }
                    }))}
                    trackColor={{ false: '#2A2C35', true: '#6366F1' }}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View style={styles.setupNav}>
            {onboardingStep > 5 && (
              <Pressable style={styles.secondaryButton} onPress={() => setOnboardingStep(onboardingStep - 1)}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            )}
            <Pressable 
              style={[
                styles.primaryButton, 
                onboardingStep === 5 && !tempProfile.name.trim() && { opacity: 0.5 }
              ]} 
              onPress={handleNextOnboarding}
            >
              <Text style={styles.buttonText}>
                {onboardingStep === 9 ? "Finish Setup" : "Next"}
              </Text>
              <ArrowRight size={20} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ----------------------------------------------------
  // HOME DASHBOARD RENDER (Once Onboarding is Completed)
  // ----------------------------------------------------

  // Calculate dynamic stats
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  // Hydration summary
  const todayWaterLogged = waterLogs.reduce((sum, log) => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    return logDate === todayDateStr ? sum + log.amount : sum;
  }, 0);
  const waterRemaining = Math.max(0, waterGoal - todayWaterLogged);
  const hydrationPct = Math.min(100, Math.round((todayWaterLogged / waterGoal) * 100));

  // Sleep summary
  const lastSleepLog = sleepLogs[0];
  const avgSleep = sleepLogs.length > 0 
    ? Number((sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length).toFixed(1))
    : 8.0;

  // Habits summary
  const activeHabits = habits.filter(h => !h.isPaused);
  const habitsCompletedToday = activeHabits.filter(h => h.completedDates.includes(todayDateStr)).length;
  const habitsDueCount = activeHabits.length;
  const habitsPct = habitsDueCount > 0 ? Math.min(100, Math.round((habitsCompletedToday / habitsDueCount) * 100)) : 0;

  // Nutrition summary
  const mealsLoggedToday = mealLogs.filter(log => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    return logDate === todayDateStr;
  });
  const todayCalories = mealsLoggedToday.reduce((sum, log) => sum + log.calories, 0);
  const todayProtein = mealsLoggedToday.reduce((sum, log) => sum + log.protein, 0);
  const todayCarbs = mealsLoggedToday.reduce((sum, log) => sum + log.carbs, 0);
  const todayFat = mealsLoggedToday.reduce((sum, log) => sum + log.fat, 0);

  // Generate Personalized AI Daily Insight Card text
  const generateInsightText = () => {
    if (hydrationPct < 30) {
      return `Prioritize hydration today, ${profile.name || 'User'}. You are at ${hydrationPct}% of your water goal.`;
    }
    if (lastSleepLog && lastSleepLog.duration < 6.5) {
      return `You slept ${lastSleepLog.duration}h last night, which is below your average of ${avgSleep}h. Try keeping activity moderate and take water frequently.`;
    }
    if (habitsCompletedToday === 0 && habitsDueCount > 0) {
      return `Let's focus on consistency. Check off your first habit to keep the momentum going!`;
    }
    if (memories.length > 0) {
      // Use stored memories
      return `Aurora Insight: ${memories[0].content}`;
    }
    return `Morning, ${profile.name}! You are in a stable routine. Log your progress as you go throughout the day.`;
  };

  return (
    <View style={styles.dashboardContainer}>
      <LinearGradient colors={['#0F1016', '#13141F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Dashboard Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Welcome Back</Text>
            <Text style={styles.headerTitle}>{profile.name || 'User'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.badge}>
              <Flame size={16} color="#FF5A79" />
              <Text style={styles.badgeText}>{getHabitsStreak()} Days</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.dashboardScroll}>
          
          {/* Dynamic AI Insight Card */}
          <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Sparkles size={18} color="#A78BFA" />
              <Text style={styles.insightTitle}>PERSONALIZED INSIGHT</Text>
            </View>
            <Text style={styles.insightContent}>{generateInsightText()}</Text>
          </LinearGradient>

          {/* Hydration Widget */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Droplet size={20} color="#0EA5E9" />
                <Text style={styles.cardTitle}>Hydration</Text>
              </View>
              <Text style={styles.cardProgressText}>{todayWaterLogged}/{waterGoal} ml</Text>
            </View>
            
            {/* Visual Bar Indicator */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${hydrationPct}%`, backgroundColor: '#0EA5E9' }]} />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>{waterRemaining > 0 ? `${waterRemaining} ml remaining` : "Goal met today!"}</Text>
              <Pressable style={styles.cardActionButton} onPress={() => addWaterLog(250)}>
                <Text style={styles.cardActionButtonText}>+250ml</Text>
              </Pressable>
            </View>
          </View>

          {/* Sleep Widget */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Moon size={20} color="#8B5CF6" />
                <Text style={styles.cardTitle}>Sleep</Text>
              </View>
              <Text style={styles.cardProgressText}>Avg: {avgSleep} hrs</Text>
            </View>
            <Text style={styles.largeSleepText}>
              {lastSleepLog ? `${lastSleepLog.duration} hrs` : "No sleep log"}
            </Text>
            <Text style={styles.cardFooterText}>
              {lastSleepLog ? `Logged for ${lastSleepLog.date} (${lastSleepLog.quality} Quality)` : "Tap Sleep in tabs to log sleep metrics"}
            </Text>
          </View>

          {/* Habit Widget */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <CheckSquare size={20} color="#10B981" />
                <Text style={styles.cardTitle}>Habits Today</Text>
              </View>
              <Text style={styles.cardProgressText}>{habitsCompletedToday}/{habitsDueCount} Completed</Text>
            </View>
            
            {/* Habits Circular / Row display */}
            <View style={styles.habitChecklist}>
              {activeHabits.slice(0, 3).map((habit) => {
                const isCompleted = habit.completedDates.includes(todayDateStr);
                return (
                  <Pressable 
                    key={habit.id} 
                    style={styles.habitCheckRow} 
                    onPress={() => toggleHabitCompletion(habit.id)}
                  >
                    <View style={[styles.checkbox, isCompleted && styles.checkboxSelected]}>
                      {isCompleted && <Check size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.habitText, isCompleted && styles.habitTextDone]}>
                      {habit.name}
                    </Text>
                    <Text style={styles.habitMeta}>{habit.timeOfDay}</Text>
                  </Pressable>
                );
              })}
              {activeHabits.length > 3 && (
                <Text style={styles.moreHabitsText}>+{activeHabits.length - 3} more habits pending</Text>
              )}
              {activeHabits.length === 0 && (
                <Text style={styles.emptyCardText}>No active habits today. Create one in the Habits tab!</Text>
              )}
            </View>
          </View>

          {/* Nutrition Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Heart size={20} color="#F43F5E" />
                <Text style={styles.cardTitle}>Nutrition Awareness</Text>
              </View>
              <Text style={styles.cardProgressText}>{todayCalories} kcal</Text>
            </View>
            
            {/* Macros row */}
            <View style={styles.macrosRow}>
              <View style={styles.macroCol}>
                <Text style={styles.macroValue}>{todayProtein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
                <View style={styles.macroProgressBg}><View style={[styles.macroProgressFill, { width: `${Math.min(100, (todayProtein/120)*100)}%`, backgroundColor: '#F43F5E' }]} /></View>
              </View>
              <View style={styles.macroCol}>
                <Text style={styles.macroValue}>{todayCarbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View style={styles.macroProgressBg}><View style={[styles.macroProgressFill, { width: `${Math.min(100, (todayCarbs/250)*100)}%`, backgroundColor: '#EAB308' }]} /></View>
              </View>
              <View style={styles.macroCol}>
                <Text style={styles.macroValue}>{todayFat}g</Text>
                <Text style={styles.macroLabel}>Fats</Text>
                <View style={styles.macroProgressBg}><View style={[styles.macroProgressFill, { width: `${Math.min(100, (todayFat/80)*100)}%`, backgroundColor: '#0EA5E9' }]} /></View>
              </View>
            </View>
          </View>

          {/* Streak details */}
          <View style={styles.streakCardSection}>
            <View style={styles.streakDetailBox}>
              <Flame size={24} color="#0EA5E9" />
              <Text style={styles.streakCount}>{getWaterStreak()} Days</Text>
              <Text style={styles.streakLabel}>Water Streak</Text>
            </View>
            <View style={styles.streakDetailBox}>
              <Moon size={24} color="#8B5CF6" />
              <Text style={styles.streakCount}>{getSleepStreak()} Days</Text>
              <Text style={styles.streakLabel}>Sleep Streak</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Onboarding Slides Styles
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  onboardingInner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  slideHero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  onboardingIcon: {
    zIndex: 2,
  },
  slideTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 40,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: '#B0B4BA',
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Questionnaire / Setup Styles
  setupContainer: {
    flex: 1,
    backgroundColor: '#0F1016',
  },
  setupInner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  setupHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  setupStepIndicator: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  setupForm: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  formGroup: {
    gap: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E1E6',
    marginBottom: -10,
  },
  subtitleLabel: {
    fontSize: 14,
    color: '#B0B4BA',
    marginBottom: 5,
  },
  input: {
    height: 52,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 24,
  },
  selectItemSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  selectText: {
    color: '#B0B4BA',
    fontWeight: '600',
  },
  selectTextSelected: {
    color: '#fff',
  },
  goalCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1D24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3039',
    gap: 12,
  },
  goalCheckItemSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#202130',
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
  goalCheckText: {
    color: '#E0E1E6',
    fontSize: 15,
    fontWeight: '600',
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1C1D24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3039',
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDesc: {
    color: '#B0B4BA',
    fontSize: 12,
    maxWidth: 200,
  },
  setupNav: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2D3039',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#B0B4BA',
    fontSize: 16,
    fontWeight: '600',
  },

  // -------------------------
  // Dashboard Styles
  // -------------------------
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#0F1016',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#B0B4BA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#271F32',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    color: '#FF5A79',
    fontSize: 12,
    fontWeight: '700',
  },
  dashboardScroll: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 100 : 40,
    gap: 16,
  },
  insightCard: {
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    color: '#D8B4FE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  insightContent: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#161720',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#22232B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cardProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0B4BA',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#232530',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#7D808A',
  },
  cardActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#212B3B',
    borderRadius: 12,
  },
  cardActionButtonText: {
    color: '#0EA5E9',
    fontSize: 11,
    fontWeight: '700',
  },
  largeSleepText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  habitChecklist: {
    gap: 10,
  },
  habitCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#232530',
  },
  habitText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  habitTextDone: {
    textDecorationLine: 'line-through',
    color: '#7D808A',
  },
  habitMeta: {
    fontSize: 11,
    color: '#7D808A',
    backgroundColor: '#202128',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  moreHabitsText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyCardText: {
    color: '#7D808A',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroCol: {
    flex: 1,
    backgroundColor: '#1E1F28',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  macroLabel: {
    fontSize: 11,
    color: '#B0B4BA',
    marginTop: 2,
    marginBottom: 6,
  },
  macroProgressBg: {
    height: 4,
    width: '100%',
    backgroundColor: '#2D2E3B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  streakCardSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  streakDetailBox: {
    flex: 1,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 2,
  },
});
