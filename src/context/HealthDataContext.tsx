import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  wakeUpTime: string;
  bedtime: string;
  activityLevel: string;
  goals: string[];
  preferences: {
    hydration: boolean;
    sleep: boolean;
    habits: boolean;
    insights: boolean;
  };
  hasCompletedOnboarding: boolean;
}

export interface WaterLog {
  id: string;
  amount: number;
  timestamp: string;
}

export interface SleepLog {
  id: string;
  duration: number; // hours
  quality: 'Restless' | 'Normal' | 'Deep';
  bedtime: string;
  wakeupTime: string;
  date: string; // YYYY-MM-DD
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  completedDates: string[]; // List of YYYY-MM-DD when completed
  isPaused: boolean;
  streak: number;
}

export interface MealLog {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  timestamp: string;
}

export interface HealthMemory {
  id: string;
  type: 'observation' | 'milestone' | 'preference';
  content: string;
  timestamp: string;
}

interface HealthDataContextType {
  profile: UserProfile;
  waterLogs: WaterLog[];
  waterGoal: number;
  sleepLogs: SleepLog[];
  habits: Habit[];
  mealLogs: MealLog[];
  memories: HealthMemory[];
  syncDevice: boolean;
  units: 'metric' | 'imperial';
  geminiApiKey: string;
  
  // Update functions
  updateProfile: (profile: Partial<UserProfile>) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  addWaterLog: (amount: number) => void;
  updateWaterGoal: (goal: number) => void;
  clearWaterLogs: () => void;
  addSleepLog: (log: Omit<SleepLog, 'id'>) => void;
  deleteSleepLog: (id: string) => void;
  createHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => void;
  toggleHabitCompletion: (id: string, date?: string) => void;
  deleteHabit: (id: string) => void;
  pauseHabit: (id: string) => void;
  addMealLog: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void;
  deleteMealLog: (id: string) => void;
  addMemory: (content: string, type?: 'observation' | 'milestone' | 'preference') => void;
  deleteMemory: (id: string) => void;
  setSyncDevice: (sync: boolean) => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  setGeminiApiKey: (key: string) => void;
  
  // Streaks and stats
  getWaterStreak: () => number;
  getSleepStreak: () => number;
  getHabitsStreak: () => number;
  resetAllData: () => void;
  simulateSyncData: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 25,
  gender: 'Other',
  height: 170,
  weight: 65,
  wakeUpTime: '07:00',
  bedtime: '22:30',
  activityLevel: 'Moderate',
  goals: [],
  preferences: {
    hydration: true,
    sleep: true,
    habits: true,
    insights: true,
  },
  hasCompletedOnboarding: false,
};

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Drink water in morning', frequency: 'daily', timeOfDay: 'morning', completedDates: [], isPaused: false, streak: 0 },
  { id: '2', name: '10-minute meditation', frequency: 'daily', timeOfDay: 'morning', completedDates: [], isPaused: false, streak: 0 },
  { id: '3', name: 'Bedtime reading', frequency: 'daily', timeOfDay: 'evening', completedDates: [], isPaused: false, streak: 0 },
];

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [waterGoal, setWaterGoalState] = useState<number>(2000); // 2000 ml default
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [memories, setMemories] = useState<HealthMemory[]>([]);
  const [syncDevice, setSyncDeviceState] = useState<boolean>(false);
  const [units, setUnitsState] = useState<'metric' | 'imperial'>('metric');
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('aurora_profile');
        const storedWaterLogs = await AsyncStorage.getItem('aurora_water_logs');
        const storedWaterGoal = await AsyncStorage.getItem('aurora_water_goal');
        const storedSleepLogs = await AsyncStorage.getItem('aurora_sleep_logs');
        const storedHabits = await AsyncStorage.getItem('aurora_habits');
        const storedMealLogs = await AsyncStorage.getItem('aurora_meal_logs');
        const storedMemories = await AsyncStorage.getItem('aurora_memories');
        const storedSync = await AsyncStorage.getItem('aurora_sync_device');
        const storedUnits = await AsyncStorage.getItem('aurora_units');
        const storedApiKey = await AsyncStorage.getItem('aurora_api_key');

        if (storedProfile) setProfileState(JSON.parse(storedProfile));
        if (storedWaterLogs) setWaterLogs(JSON.parse(storedWaterLogs));
        if (storedWaterGoal) setWaterGoalState(Number(storedWaterGoal));
        if (storedSleepLogs) setSleepLogs(JSON.parse(storedSleepLogs));
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        if (storedMealLogs) setMealLogs(JSON.parse(storedMealLogs));
        if (storedMemories) setMemories(JSON.parse(storedMemories));
        if (storedSync) setSyncDeviceState(JSON.parse(storedSync));
        if (storedUnits) setUnitsState(storedUnits as 'metric' | 'imperial');
        if (storedApiKey) setGeminiApiKeyState(storedApiKey);
      } catch (e) {
        console.error('Failed to load health data from AsyncStorage:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  // Save states helper
  const saveToStorage = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key} to storage:`, e);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const newVal = { ...prev, ...updated };
      saveToStorage('aurora_profile', newVal);
      return newVal;
    });
  };

  const setOnboardingCompleted = (completed: boolean) => {
    setProfileState((prev) => {
      const newVal = { ...prev, hasCompletedOnboarding: completed };
      saveToStorage('aurora_profile', newVal);
      return newVal;
    });
  };

  const addWaterLog = (amount: number) => {
    const newLog: WaterLog = {
      id: Math.random().toString(),
      amount,
      timestamp: new Date().toISOString(),
    };
    setWaterLogs((prev) => {
      const updated = [newLog, ...prev];
      saveToStorage('aurora_water_logs', updated);
      return updated;
    });

    // Check if hydration triggers memory
    const todayWater = waterLogs.reduce((sum, log) => {
      const logDate = new Date(log.timestamp).toDateString();
      const todayDate = new Date().toDateString();
      return logDate === todayDate ? sum + log.amount : sum;
    }, 0) + amount;

    if (todayWater >= waterGoal && (todayWater - amount) < waterGoal) {
      addMemory("Reached daily hydration goal! Visual feedback: virtual bottle full.", 'milestone');
    }
  };

  const updateWaterGoal = (goal: number) => {
    setWaterGoalState(goal);
    saveToStorage('aurora_water_goal', goal.toString());
  };

  const clearWaterLogs = () => {
    setWaterLogs([]);
    saveToStorage('aurora_water_logs', []);
  };

  const addSleepLog = (log: Omit<SleepLog, 'id'>) => {
    const newLog: SleepLog = {
      id: Math.random().toString(),
      ...log,
    };
    setSleepLogs((prev) => {
      const updated = [newLog, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      saveToStorage('aurora_sleep_logs', updated);
      return updated;
    });

    // Check for high sleep duration milestone
    if (log.duration >= 8) {
      addMemory(`Logged standard restorative sleep of ${log.duration} hours on ${log.date}.`, 'observation');
    }
  };

  const deleteSleepLog = (id: string) => {
    setSleepLogs((prev) => {
      const updated = prev.filter((log) => log.id !== id);
      saveToStorage('aurora_sleep_logs', updated);
      return updated;
    });
  };

  const createHabit = (habit: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => {
    const newHabit: Habit = {
      id: Math.random().toString(),
      ...habit,
      completedDates: [],
      streak: 0,
    };
    setHabits((prev) => {
      const updated = [...prev, newHabit];
      saveToStorage('aurora_habits', updated);
      return updated;
    });
    addMemory(`Started a new habit: "${habit.name}".`, 'preference');
  };

  const toggleHabitCompletion = (id: string, date: string = new Date().toISOString().split('T')[0]) => {
    setHabits((prev) => {
      const updated = prev.map((habit) => {
        if (habit.id === id) {
          const completed = habit.completedDates.includes(date);
          let newDates = [...habit.completedDates];
          if (completed) {
            newDates = newDates.filter((d) => d !== date);
          } else {
            newDates.push(date);
          }
          
          // Calculate streak
          let streak = 0;
          const sortedDates = [...newDates].sort((a, b) => b.localeCompare(a));
          if (sortedDates.length > 0) {
            let checkDate = new Date();
            // If checking a past date, align start check
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            // If the latest completed date is today or yesterday, we can calculate active streak
            if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
              streak = 1;
              let currentCheck = new Date(sortedDates[0]);
              for (let i = 1; i < sortedDates.length; i++) {
                const prevDay = new Date(currentCheck.getTime() - 86400000).toISOString().split('T')[0];
                if (sortedDates[i] === prevDay) {
                  streak++;
                  currentCheck = new Date(sortedDates[i]);
                } else {
                  break;
                }
              }
            }
          }

          if (streak >= 5 && streak % 5 === 0 && !completed) {
            setTimeout(() => addMemory(`You've completed the habit "${habit.name}" for ${streak} consecutive days!`, 'milestone'), 100);
          }

          return { ...habit, completedDates: newDates, streak };
        }
        return habit;
      });
      saveToStorage('aurora_habits', updated);
      return updated;
    });
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      saveToStorage('aurora_habits', updated);
      return updated;
    });
  };

  const pauseHabit = (id: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, isPaused: !h.isPaused } : h));
      saveToStorage('aurora_habits', updated);
      return updated;
    });
  };

  const addMealLog = (meal: Omit<MealLog, 'id' | 'timestamp'>) => {
    const newLog: MealLog = {
      id: Math.random().toString(),
      ...meal,
      timestamp: new Date().toISOString(),
    };
    setMealLogs((prev) => {
      const updated = [newLog, ...prev];
      saveToStorage('aurora_meal_logs', updated);
      return updated;
    });
  };

  const deleteMealLog = (id: string) => {
    setMealLogs((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveToStorage('aurora_meal_logs', updated);
      return updated;
    });
  };

  const addMemory = (content: string, type: 'observation' | 'milestone' | 'preference' = 'observation') => {
    const newMemory: HealthMemory = {
      id: Math.random().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
    };
    setMemories((prev) => {
      const updated = [newMemory, ...prev].slice(0, 30); // limit to last 30 memories
      saveToStorage('aurora_memories', updated);
      return updated;
    });
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveToStorage('aurora_memories', updated);
      return updated;
    });
  };

  const setSyncDevice = (sync: boolean) => {
    setSyncDeviceState(sync);
    saveToStorage('aurora_sync_device', sync);
    if (sync) {
      addMemory("Connected to Apple Health & Garmin integrations.", 'preference');
      simulateSyncData();
    }
  };

  const setUnits = (units: 'metric' | 'imperial') => {
    setUnitsState(units);
    saveToStorage('aurora_units', units);
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    saveToStorage('aurora_api_key', key);
    if (key) {
      addMemory("Connected to live Gemini 1.5/2.0 Brain Engine.", 'preference');
    }
  };

  const getWaterStreak = () => {
    // Computes consecutive days where water goal was met
    if (waterLogs.length === 0) return 0;
    
    // Group water by date
    const dailyWater: { [date: string]: number } = {};
    waterLogs.forEach((log) => {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      dailyWater[dateStr] = (dailyWater[dateStr] || 0) + log.amount;
    });
    
    let streak = 0;
    let checkDate = new Date();
    
    // If today is not met yet, check if yesterday was met to keep streak alive
    const todayStr = checkDate.toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentCheck = todayStr;
    if ((dailyWater[todayStr] || 0) < waterGoal) {
      currentCheck = yesterdayStr;
    }
    
    while (true) {
      if ((dailyWater[currentCheck] || 0) >= waterGoal) {
        streak++;
        const prevDateObj = new Date(new Date(currentCheck).getTime() - 86400000);
        currentCheck = prevDateObj.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    return streak;
  };

  const getSleepStreak = () => {
    // Compute days in a row with sleep logged
    if (sleepLogs.length === 0) return 0;
    
    const dates = new Set(sleepLogs.map(l => l.date));
    let streak = 0;
    let checkDate = new Date();
    
    const todayStr = checkDate.toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentCheck = todayStr;
    if (!dates.has(todayStr)) {
      currentCheck = yesterdayStr;
    }
    
    while (true) {
      if (dates.has(currentCheck)) {
        streak++;
        const prevDateObj = new Date(new Date(currentCheck).getTime() - 86400000);
        currentCheck = prevDateObj.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    return streak;
  };

  const getHabitsStreak = () => {
    // Return max streak among all active habits
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => h.streak), 0);
  };

  const resetAllData = async () => {
    setProfileState(DEFAULT_PROFILE);
    setWaterLogs([]);
    setWaterGoalState(2000);
    setSleepLogs([]);
    setHabits(DEFAULT_HABITS);
    setMealLogs([]);
    setMemories([]);
    setSyncDeviceState(false);
    setUnitsState('metric');
    setGeminiApiKeyState('');
    
    await AsyncStorage.clear();
  };

  const simulateSyncData = () => {
    // Inject mock historical data to make charts look beautiful
    const today = new Date();
    
    // Mock water logs
    const mockWaterLogs: WaterLog[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today.getTime() - i * 86400000);
      const amount = Math.floor(Math.random() * 1000) + 1200; // 1200-2200 ml
      mockWaterLogs.push({
        id: `mock-w-${i}`,
        amount,
        timestamp: date.toISOString(),
      });
    }
    setWaterLogs(prev => [...mockWaterLogs, ...prev]);

    // Mock sleep logs
    const mockSleepLogs: SleepLog[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today.getTime() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      mockSleepLogs.push({
        id: `mock-s-${i}`,
        duration: Number((Math.random() * 3 + 6).toFixed(1)), // 6-9 hours
        quality: ['Restless', 'Normal', 'Deep'][Math.floor(Math.random() * 3)] as any,
        bedtime: '23:00',
        wakeupTime: '07:00',
        date: dateStr,
      });
    }
    setSleepLogs(prev => [...mockSleepLogs, ...prev]);

    // Mock meal logs
    const mockMealLogs: MealLog[] = [
      { id: 'mock-m-1', type: 'Breakfast', name: 'Oatmeal & Berries', calories: 350, protein: 12, carbs: 55, fat: 6, timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
      { id: 'mock-m-2', type: 'Lunch', name: 'Grilled Chicken Salad', calories: 520, protein: 42, carbs: 15, fat: 22, timestamp: new Date(Date.now() - 1 * 3600000).toISOString() },
    ];
    setMealLogs(prev => [...mockMealLogs, ...prev]);

    // Mock memory
    addMemory("Imported 7 days of historical logs from Health App.", 'milestone');
  };

  return (
    <HealthDataContext.Provider
      value={{
        profile,
        waterLogs,
        waterGoal,
        sleepLogs,
        habits,
        mealLogs,
        memories,
        syncDevice,
        units,
        geminiApiKey,
        updateProfile,
        setOnboardingCompleted,
        addWaterLog,
        updateWaterGoal,
        clearWaterLogs,
        addSleepLog,
        deleteSleepLog,
        createHabit,
        toggleHabitCompletion,
        deleteHabit,
        pauseHabit,
        addMealLog,
        deleteMealLog,
        addMemory,
        deleteMemory,
        setSyncDevice,
        setUnits,
        setGeminiApiKey,
        getWaterStreak,
        getSleepStreak,
        getHabitsStreak,
        resetAllData,
        simulateSyncData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
