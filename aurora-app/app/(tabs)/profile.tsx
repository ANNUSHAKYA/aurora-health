import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useUserStore } from '../../store/userStore'
import { Colors } from '../../constants/colors'
import Card from '../../components/ui/Card'

export default function Profile() {
  const { profile, logout } = useUserStore()

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut()
            logout()
            router.replace('/(auth)/welcome')
          } catch (e) {
            console.error(e)
          }
        }
      }
    ])
  }

  const stats = [
    { label: 'Water Goal', value: `${profile?.daily_water_goal_ml || 2500}ml`, emoji: '💧' },
    { label: 'Activity', value: profile?.activity_level || '--', emoji: '🏃' },
    { label: 'Wake Time', value: profile?.wake_time || '--', emoji: '⏰' },
    { label: 'Bedtime', value: profile?.bed_time || '--', emoji: '🌙' },
  ]

  const hasGoals = Array.isArray(profile?.goals) && profile.goals.length > 0

  return (
    <LinearGradient colors={['#0A0A1A', '#0D0D2B']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#6C63FF', '#00D4FF']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {(profile?.name || 'A')[0].toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.name}>{profile?.name || 'Aurora User'}</Text>
          <Text style={styles.meta}>
            {profile?.age ? `${profile.age} years` : ''}
            {profile?.gender ? `  •  ${profile.gender}` : ''}
          </Text>
        </View>

        {/* Body Stats */}
        <Card>
          <Text style={styles.sectionTitle}>Body</Text>
          <View style={styles.bodyRow}>
            <View style={styles.bodyItem}>
              <Text style={styles.bodyValue}>
                {profile?.height_cm ? `${profile.height_cm}cm` : '--'}
              </Text>
              <Text style={styles.bodyLabel}>Height</Text>
            </View>
            <View style={styles.bodyDivider} />
            <View style={styles.bodyItem}>
              <Text style={styles.bodyValue}>
                {profile?.weight_kg ? `${profile.weight_kg}kg` : '--'}
              </Text>
              <Text style={styles.bodyLabel}>Weight</Text>
            </View>
          </View>
        </Card>

        {/* Settings Grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Goals */}
        {hasGoals && (
          <Card>
            <Text style={styles.sectionTitle}>My Goals</Text>
            <View style={styles.goalsWrap}>
              {profile.goals.map((g: string) => (
                <View key={g} style={styles.goalChip}>
                  <Text style={styles.goalChipText}>{g}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.signOutBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, gap: 16 },
  avatarSection: { alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36, fontFamily: 'Inter_700Bold', color: '#fff',
  },
  name: {
    fontSize: 24, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 13, fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12,
  },
  bodyRow: { flexDirection: 'row', justifyContent: 'space-around' },
  bodyItem: { alignItems: 'center', gap: 4 },
  bodyValue: {
    fontSize: 24, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  bodyLabel: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  bodyDivider: {
    width: 1, backgroundColor: Colors.border, height: '100%',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', alignItems: 'center', gap: 6, padding: 16 },
  statEmoji: { fontSize: 24 },
  statValue: {
    fontSize: 15, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary, textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 11, fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  goalsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 50, backgroundColor: Colors.primaryGlow,
    borderWidth: 1, borderColor: Colors.primary,
  },
  goalChipText: {
    fontSize: 12, fontFamily: 'Inter_500Medium',
    color: Colors.primary, textTransform: 'capitalize',
  },
  signOutBtn: {
    backgroundColor: 'rgba(255,80,80,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,80,80,0.3)',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  signOutText: {
    fontSize: 15, fontFamily: 'Inter_600SemiBold',
    color: '#FF5050',
  },
})
