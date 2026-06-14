import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

function TabIcon({ emoji, label, focused }: {
  emoji: string, label: string, focused: boolean
}) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
        {emoji}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="hydration"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💧" label="Water" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.companionTab}>
              <Text style={styles.companionEmoji}>✨</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔥" label="Habits" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#12122A',
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: { alignItems: 'center', gap: 4 },
  tabEmoji: { fontSize: 22, opacity: 0.45 },
  tabEmojiFocused: { opacity: 1 },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  companionTab: {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  companionEmoji: { fontSize: 22 },
})
