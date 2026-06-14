import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Mask, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Droplet, Plus, Trash2, ArrowLeft, Award, Sparkles } from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';

export default function HydrationScreen() {
  const { 
    waterLogs, 
    waterGoal, 
    addWaterLog, 
    clearWaterLogs, 
    getWaterStreak 
  } = useHealthData();
  const [customAmount, setCustomAmount] = useState('');

  // Calculate today's total
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLogs = waterLogs.filter(log => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    return logDate === todayDateStr;
  });
  
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const remaining = Math.max(0, waterGoal - todayTotal);
  const progressPct = Math.min(100, Math.round((todayTotal / waterGoal) * 100));

  const handleQuickAdd = (amount: number) => {
    addWaterLog(amount);
  };

  const handleCustomAdd = () => {
    const amt = parseInt(customAmount);
    if (amt > 0) {
      addWaterLog(amt);
      setCustomAmount('');
    }
  };

  // SVG dimensions for virtual bottle
  const bottleWidth = 140;
  const bottleHeight = 240;
  // Fill height mapping: bottle has neck which occupies some space. Let's map fill height up to 180px inside the mask.
  const fillHeight = (progressPct / 100) * 190; // max fillable height is ~190px

  // Generate hydration feedback
  const getFeedbackMessage = () => {
    if (progressPct >= 100) return "Superb! You've crushed today's hydration target.";
    if (progressPct >= 75) return "Almost there! One more glass to complete your goal.";
    if (progressPct >= 50) return "Halfway through! Keep sipping consistently.";
    if (progressPct > 0) return "Off to a good start. Log water regularly.";
    return "Drink some water to start filling your bottle!";
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1016', '#0B1528']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Hydration Tracker</Text>
            <Text style={styles.subtitle}>Fuel your mind, cell by cell</Text>
          </View>

          {/* Core Interactive Section */}
          <View style={styles.visualSection}>
            {/* Virtual Water Bottle SVG */}
            <View style={styles.bottleWrapper}>
              <Svg width={bottleWidth} height={bottleHeight} viewBox="0 0 140 240">
                <Defs>
                  {/* Fill Gradient */}
                  <SvgGradient id="waterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.9} />
                    <Stop offset="100%" stopColor="#38BDF8" stopOpacity={0.9} />
                  </SvgGradient>
                  
                  {/* Bottle Shape Mask */}
                  <Mask id="bottleMask">
                    {/* The solid white color will preserve drawing, transparent will clip */}
                    {/* Bottle body */}
                    <Rect x="20" y="50" width="100" height="170" rx="20" fill="white" />
                    {/* Neck */}
                    <Rect x="45" y="15" width="50" height="40" rx="10" fill="white" />
                  </Mask>
                </Defs>

                {/* Background water layer inside bottle mask */}
                <Rect x="0" y="0" width="140" height="240" fill="#1A283B" mask="url(#bottleMask)" />

                {/* Active Water Level Layer (clipped inside mask) */}
                <Rect 
                  x="20" 
                  y={220 - fillHeight} 
                  width="100" 
                  height={fillHeight} 
                  fill="url(#waterGrad)" 
                  mask="url(#bottleMask)"
                />
                
                {/* Wave visual overlay at boundary (optional animated wave look) */}
                {progressPct > 0 && progressPct < 100 && (
                  <Path 
                    d={`M 20 ${220 - fillHeight} Q 45 ${220 - fillHeight - 6}, 70 ${220 - fillHeight} T 120 ${220 - fillHeight} L 120 ${220 - fillHeight + 10} L 20 ${220 - fillHeight + 10} Z`}
                    fill="#38BDF8"
                    mask="url(#bottleMask)"
                  />
                )}

                {/* Glass Bottle Glass Border Highlight */}
                {/* Outer path of the bottle */}
                <Rect 
                  x="20" 
                  y="50" 
                  width="100" 
                  height="170" 
                  rx="20" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="4" 
                />
                <Rect 
                  x="45" 
                  y="15" 
                  width="50" 
                  height="40" 
                  rx="10" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="4" 
                />
                {/* Bottle Cap */}
                <Rect x="40" y="8" width="60" height="12" rx="3" fill="#38BDF8" />
              </Svg>

              {/* Progress HUD overlay inside bottle */}
              <View style={styles.progressHUD}>
                <Text style={styles.hudPercent}>{progressPct}%</Text>
                <Text style={styles.hudAmount}>{todayTotal} ml</Text>
              </View>
            </View>

            {/* Metrics Info Board */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{remaining} ml</Text>
                <Text style={styles.statLbl}>Remaining</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{waterGoal} ml</Text>
                <Text style={styles.statLbl}>Goal Target</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{getWaterStreak()} Days</Text>
                <Text style={styles.statLbl}>Streak</Text>
              </View>
            </View>
          </View>

          {/* Quick Log Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Logging</Text>
            <View style={styles.quickAddRow}>
              <Pressable style={styles.quickBtn} onPress={() => handleQuickAdd(250)}>
                <Droplet size={20} color="#0EA5E9" />
                <Text style={styles.quickBtnText}>+250 ml</Text>
                <Text style={styles.quickBtnSub}>Glass</Text>
              </Pressable>
              
              <Pressable style={styles.quickBtn} onPress={() => handleQuickAdd(500)}>
                <Droplet size={20} color="#0EA5E9" style={{ transform: [{ scale: 1.2 }] }} />
                <Text style={styles.quickBtnText}>+500 ml</Text>
                <Text style={styles.quickBtnSub}>Bottle</Text>
              </Pressable>

              <Pressable style={styles.quickBtn} onPress={() => handleQuickAdd(750)}>
                <Droplet size={20} color="#0EA5E9" style={{ transform: [{ scale: 1.4 }] }} />
                <Text style={styles.quickBtnText}>+750 ml</Text>
                <Text style={styles.quickBtnSub}>Large Bottle</Text>
              </Pressable>
            </View>
          </View>

          {/* Custom Logger */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Intake</Text>
            <View style={styles.customAddContainer}>
              <TextInput
                style={styles.customInput}
                placeholder="Amount in ml (e.g. 350)"
                placeholderTextColor="#7D808A"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
              />
              <Pressable style={styles.customBtn} onPress={handleCustomAdd}>
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Dynamic Insight Box */}
          <View style={styles.insightBox}>
            <Sparkles size={18} color="#0EA5E9" />
            <Text style={styles.insightText}>{getFeedbackMessage()}</Text>
          </View>

          {/* History Section */}
          <View style={styles.section}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Today's Intake History</Text>
              {todayLogs.length > 0 && (
                <Pressable onPress={clearWaterLogs}>
                  <Text style={styles.clearLogsText}>Clear Logs</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.logsContainer}>
              {todayLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logLeft}>
                      <View style={styles.dropCircle}>
                        <Droplet size={14} color="#0EA5E9" fill="#0EA5E9" />
                      </View>
                      <View>
                        <Text style={styles.logAmount}>{log.amount} ml</Text>
                        <Text style={styles.logTime}>{timeStr}</Text>
                      </View>
                    </View>
                    <View style={styles.successTag}>
                      <Text style={styles.successTagText}>Logged</Text>
                    </View>
                  </View>
                );
              })}
              {todayLogs.length === 0 && (
                <Text style={styles.emptyText}>No water logged yet today.</Text>
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
  visualSection: {
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  bottleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressHUD: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 110,
  },
  hudPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hudAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1F0FF',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#232530',
    paddingTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statLbl: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 4,
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
  quickAddRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  quickBtnSub: {
    color: '#7D808A',
    fontSize: 10,
  },
  customAddContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  customInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
  },
  customBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12202F',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#18334E',
  },
  insightText: {
    color: '#85D2F2',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearLogsText: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#161720',
    borderRadius: 16,
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
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E2B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  logTime: {
    fontSize: 11,
    color: '#7D808A',
    marginTop: 2,
  },
  successTag: {
    backgroundColor: '#152E27',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  successTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    color: '#7D808A',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
