import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Clock, Sparkles, Plus, Star, Trash2 } from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';

export default function SleepScreen() {
  const { sleepLogs, addSleepLog, deleteSleepLog, getSleepStreak } = useHealthData();
  
  // Log sleep state
  const [duration, setDuration] = useState('8.0');
  const [quality, setQuality] = useState<'Restless' | 'Normal' | 'Deep'>('Normal');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleLogSleep = () => {
    const hours = parseFloat(duration);
    if (hours > 0 && hours <= 24) {
      addSleepLog({
        duration: hours,
        quality,
        bedtime,
        wakeupTime,
        date
      });
      // reset to default
      setDuration('8.0');
      setQuality('Normal');
    }
  };

  // Get last 7 days logs for bar chart
  const getLast7DaysLogs = () => {
    const logsMap: { [date: string]: number } = {};
    sleepLogs.slice(0, 7).forEach(log => {
      logsMap[log.date] = log.duration;
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
      result.push({
        dateStr: dStr,
        label: dayLabel,
        duration: logsMap[dStr] || 0
      });
    }
    return result;
  };

  const chartData = getLast7DaysLogs();
  const maxDurationInChart = Math.max(...chartData.map(d => d.duration), 10);
  
  const avgSleep = sleepLogs.length > 0
    ? Number((sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length).toFixed(1))
    : 0;

  // Calculate consistency score: standard bedtime consistency or sleep goal matching
  const getConsistencyScore = () => {
    if (sleepLogs.length < 2) return 80; // default baseline
    // Simple consistency metrics: how close are logs to the 8hr target
    const target = 8.0;
    const devSum = sleepLogs.reduce((sum, log) => sum + Math.abs(log.duration - target), 0);
    const score = Math.max(0, 100 - Math.round((devSum / sleepLogs.length) * 15));
    return score;
  };

  const consistency = getConsistencyScore();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1016', '#0F0E1E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Sleep Analyzer</Text>
            <Text style={styles.subtitle}>Unlock recovery, synchronize your cycles</Text>
          </View>

          {/* Stats dashboard */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Moon size={18} color="#8B5CF6" />
              <Text style={styles.statVal}>{avgSleep > 0 ? `${avgSleep} hrs` : 'No logs'}</Text>
              <Text style={styles.statLbl}>Average Duration</Text>
            </View>
            <View style={styles.statBox}>
              <Clock size={18} color="#8B5CF6" />
              <Text style={styles.statVal}>{consistency}%</Text>
              <Text style={styles.statLbl}>Sleep Consistency</Text>
            </View>
            <View style={styles.statBox}>
              <Star size={18} color="#8B5CF6" />
              <Text style={styles.statVal}>{getSleepStreak()} Days</Text>
              <Text style={styles.statLbl}>Sleep Streak</Text>
            </View>
          </View>

          {/* 7-Day Sleep Trend Custom Bar Chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>7-Day Sleep History</Text>
            
            <View style={styles.chartContainer}>
              {chartData.map((day, idx) => {
                // Height of bar relative to max log value (limit max height to 120px)
                const barHeight = day.duration > 0 ? (day.duration / maxDurationInChart) * 120 : 4;
                return (
                  <View key={idx} style={styles.chartBarCol}>
                    <View style={styles.barWrapper}>
                      {day.duration > 0 && (
                        <Text style={styles.chartBarValue}>{day.duration}h</Text>
                      )}
                      <LinearGradient 
                        colors={day.duration >= 7.5 ? ['#8B5CF6', '#C084FC'] : ['#4B3E72', '#635695']} 
                        style={[styles.chartBar, { height: barHeight }]} 
                      />
                    </View>
                    <Text style={styles.chartBarLabel}>{day.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Sleep Logging Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log Last Night's Sleep</Text>
            
            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7D808A"
                  onChangeText={setDate}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Duration (hours)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  keyboardType="numeric"
                  onChangeText={setDuration}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Bedtime</Text>
                <TextInput
                  style={styles.input}
                  value={bedtime}
                  placeholder="HH:MM (e.g. 23:00)"
                  placeholderTextColor="#7D808A"
                  onChangeText={setBedtime}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.fieldLabel}>Wake Time</Text>
                <TextInput
                  style={styles.input}
                  value={wakeupTime}
                  placeholder="HH:MM (e.g. 07:00)"
                  placeholderTextColor="#7D808A"
                  onChangeText={setWakeupTime}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Sleep Quality</Text>
            <View style={styles.qualityRow}>
              {(['Restless', 'Normal', 'Deep'] as const).map((q) => (
                <Pressable
                  key={q}
                  style={[
                    styles.qualityBtn,
                    quality === q && styles.qualityBtnSelected
                  ]}
                  onPress={() => setQuality(q)}
                >
                  <Text style={[styles.qualityBtnText, quality === q && styles.qualityBtnTextSelected]}>
                    {q}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.submitBtn} onPress={handleLogSleep}>
              <Plus size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Save Sleep Log</Text>
            </Pressable>
          </View>

          {/* Sleep Insights */}
          <View style={styles.insightBox}>
            <Sparkles size={18} color="#8B5CF6" />
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Sleep Science</Text>
              <Text style={styles.insightText}>
                {avgSleep >= 7.5 
                  ? "Your sleep duration is healthy. Going to bed before 11:00 PM stabilizes circadian rhythms."
                  : "Try going to bed 30 minutes earlier. Consistently sleeping below 7 hours impairs focus and energy."}
              </Text>
            </View>
          </View>

          {/* Sleep History Logs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleep History Logs</Text>
            <View style={styles.historyContainer}>
              {sleepLogs.map((log) => (
                <View key={log.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={styles.moonCircle}>
                      <Moon size={14} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text style={styles.historyDuration}>{log.duration} hours</Text>
                      <Text style={styles.historyMeta}>{log.date} ({log.bedtime} - {log.wakeupTime})</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <View style={[
                      styles.qualityBadge,
                      log.quality === 'Deep' && styles.qualityDeep,
                      log.quality === 'Restless' && styles.qualityRestless,
                    ]}>
                      <Text style={[
                        styles.qualityBadgeText,
                        log.quality === 'Deep' && styles.qualityDeepText,
                        log.quality === 'Restless' && styles.qualityRestlessText,
                      ]}>{log.quality}</Text>
                    </View>
                    <Pressable style={styles.deleteBtn} onPress={() => deleteSleepLog(log.id)}>
                      <Trash2 size={16} color="#7D808A" />
                    </Pressable>
                  </View>
                </View>
              ))}
              {sleepLogs.length === 0 && (
                <Text style={styles.emptyText}>No sleep logs recorded yet. Fill out the form above to add a log.</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  statLbl: {
    fontSize: 10,
    color: '#7D808A',
    textAlign: 'center',
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
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  chartBarValue: {
    fontSize: 10,
    color: '#B0B4BA',
    fontWeight: '600',
    marginBottom: 4,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#B0B4BA',
    fontWeight: '600',
    marginBottom: 8,
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
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  qualityBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1C1D24',
    borderWidth: 1,
    borderColor: '#2D3039',
    borderRadius: 12,
    alignItems: 'center',
  },
  qualityBtnSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  qualityBtnText: {
    color: '#B0B4BA',
    fontSize: 14,
    fontWeight: '600',
  },
  qualityBtnTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    height: 52,
    backgroundColor: '#8B5CF6',
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
  insightBox: {
    flexDirection: 'row',
    backgroundColor: '#18122B',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2D2050',
  },
  insightTitle: {
    color: '#C084FC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightText: {
    color: '#D8B4FE',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
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
  historyContainer: {
    backgroundColor: '#161720',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22232B',
    padding: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#232530',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moonCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#201630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  historyMeta: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qualityBadge: {
    backgroundColor: '#2E2F38',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  qualityBadgeText: {
    color: '#B0B4BA',
    fontSize: 10,
    fontWeight: '700',
  },
  qualityDeep: {
    backgroundColor: '#202E1B',
  },
  qualityDeepText: {
    color: '#10B981',
  },
  qualityRestless: {
    backgroundColor: '#2F1A21',
  },
  qualityRestlessText: {
    color: '#F43F5E',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyText: {
    color: '#7D808A',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
