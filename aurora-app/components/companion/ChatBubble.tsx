import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

interface Props {
  message: string
  isUser: boolean
  toolUsed?: string | null
}

export default function ChatBubble({ message, isUser, toolUsed }: Props) {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.auroraContainer
    ]}>
      {!isUser && (
        <View style={styles.avatarDot}>
          <Text style={styles.avatarEmoji}>✨</Text>
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.auroraBubble
      ]}>
        {toolUsed && (
          <View style={styles.toolBadge}>
            <Text style={styles.toolBadgeText}>
              {getToolLabel(toolUsed)}
            </Text>
          </View>
        )}
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.auroraText
        ]}>
          {message}
        </Text>
      </View>
    </View>
  )
}

function getToolLabel(tool: string) {
  const labels: Record<string, string> = {
    log_water: '💧 Logged water',
    log_sleep: '😴 Logged sleep',
    create_habit: '🔥 Created habit',
    complete_habit: '✅ Completed habit',
    get_health_summary: '📊 Checked stats',
    log_nutrition: '🥗 Logged meal',
  }
  return labels[tool] || '🤖 Action taken'
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  userContainer: { justifyContent: 'flex-end' },
  auroraContainer: { justifyContent: 'flex-start', gap: 8 },
  avatarDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary,
  },
  avatarEmoji: { fontSize: 12 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  auroraBubble: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  toolBadge: {
    backgroundColor: Colors.mintGlow,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  toolBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.mint,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    fontFamily: 'Inter_400Regular',
    color: '#fff',
  },
  auroraText: {
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
})
