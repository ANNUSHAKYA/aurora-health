import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Animated, Alert, Keyboard
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Speech from 'expo-speech'
import { Audio } from 'expo-av'
import { useUserStore } from '../../store/userStore'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'
import VoiceOrb from '../../components/companion/VoiceOrb'
import ChatBubble from '../../components/companion/ChatBubble'

interface Message {
  id: string
  text: string
  isUser: boolean
  toolUsed?: string | null
}

const SUGGESTIONS = [
  "How am I doing today?",
  "I drank 500ml of water",
  "I slept 7 hours last night",
  "Create a meditation habit",
  "I just finished lunch",
  "Mark my reading habit done",
]

export default function Companion() {
  const { userId, profile } = useUserStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      isUser: false,
      text: `Hey ${profile?.name?.split(' ')[0] || 'there'}! 👋 I'm Aurora, your personal health companion. Talk to me or type — I can log your water, sleep, habits, and more. How are you feeling today?`,
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const scrollRef = useRef<ScrollView>(null)
  const headerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1, duration: 800, useNativeDriver: true,
    }).start()
  }, [headerAnim])

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])

  // ── Request mic permission ──────────────────────────────
  const requestMicPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Microphone needed',
          'Please allow microphone access in your settings to use voice.',
        )
        return false
      }
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  // ── Start voice recording ───────────────────────────────
  const startListening = async () => {
    const hasPermission = await requestMicPermission()
    if (!hasPermission) return

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(rec)
      setIsListening(true)
    } catch (err) {
      console.error('Start recording failed:', err)
      // Fall back to text mode
      setIsVoiceMode(false)
    }
  }

  // ── Stop recording + transcribe ─────────────────────────
  const stopListening = async () => {
    if (!recording) return
    setIsListening(false)
    setIsThinking(true)

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)

      if (!uri) {
        setIsThinking(false)
        return
      }

      // Since Whisper needs an API key, we use a simple
      // fallback: show text input pre-filled for the user
      // In production you'd send `uri` to your backend /transcribe
      setIsThinking(false)
      setIsVoiceMode(false)

      // ── Optional: send to your backend for transcription ──
      // const formData = new FormData()
      // formData.append('file', { uri, type: 'audio/m4a', name: 'audio.m4a' })
      // const res = await fetch(`${API_BASE}/companion/transcribe`, {
      //   method: 'POST', body: formData
      // })
      // const { text } = await res.json()
      // if (text) await sendMessage(text)

    } catch (err) {
      console.error('Stop recording failed:', err)
      setIsThinking(false)
    }
  }

  // ── Handle orb press ────────────────────────────────────
  const handleOrbPress = async () => {
    if (isSpeaking) {
      Speech.stop()
      setIsSpeaking(false)
      return
    }
    if (isListening) {
      await stopListening()
    } else {
      await startListening()
    }
  }

  // ── Speak Aurora's response ─────────────────────────────
  const speakResponse = (text: string) => {
    // Strip any emoji for cleaner TTS
    const clean = text.replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, ''
    ).trim()

    setIsSpeaking(true)
    Speech.speak(clean, {
      language: 'en-US',
      pitch: 1.05,
      rate: 0.92,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }

  // ── Send message to agent ───────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !userId) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    Keyboard.dismiss()
    setIsThinking(true)

    // Build conversation history for context
    const newHistory = [
      ...history,
      { role: 'user', content: text.trim() }
    ]

    try {
      const result = await api.chat(userId, text.trim(), history)

      const auroraMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: result.reply || "I'm here to help! Could you rephrase that?",
        isUser: false,
        toolUsed: result.tool_used || null,
      }

      setMessages((prev) => [...prev, auroraMsg])

      // Update history
      setHistory([
        ...newHistory,
        { role: 'assistant', content: result.reply }
      ])

      // Speak the response if in voice mode
      if (isVoiceMode) {
        speakResponse(result.reply)
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't connect right now. Please check your connection.",
        isUser: false,
      }])
    } finally {
      setIsThinking(false)
    }
  }, [userId, history, isVoiceMode])

  // ── Render ──────────────────────────────────────────────
  return (
    <LinearGradient
      colors={['#0A0A1A', '#0D0D2B', '#0A0A1A']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <Animated.View style={[
          styles.header,
          { opacity: headerAnim, transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1], outputRange: [-20, 0]
            })
          }]}
        ]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerDot} />
            <View>
              <Text style={styles.headerTitle}>Aurora</Text>
              <Text style={styles.headerSub}>
                {isListening ? '🎤 Listening...'
                  : isThinking ? '⚙️ Thinking...'
                  : isSpeaking ? '🔊 Speaking...'
                  : '✨ Your health companion'}
              </Text>
            </View>
          </View>

          {/* Voice / Text toggle */}
          <TouchableOpacity
            style={styles.modeToggle}
            onPress={() => setIsVoiceMode(!isVoiceMode)}
          >
            <Text style={styles.modeToggleText}>
              {isVoiceMode ? '⌨️ Text' : '🎤 Voice'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Voice Mode UI */}
        {isVoiceMode ? (
          <View style={styles.voiceContainer}>
            {/* Messages scroll */}
            <ScrollView
              ref={scrollRef}
              style={styles.voiceMessages}
              contentContainerStyle={styles.voiceMessagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.slice(-4).map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.text}
                  isUser={msg.isUser}
                  toolUsed={msg.toolUsed}
                />
              ))}

              {isThinking && (
                <View style={styles.thinkingRow}>
                  <View style={styles.thinkingBubble}>
                    <Text style={styles.thinkingDots}>• • •</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Voice Orb */}
            <View style={styles.orbSection}>
              <VoiceOrb
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                onPress={handleOrbPress}
              />
              <Text style={styles.orbHint}>
                {isListening
                  ? 'Tap to send'
                  : isSpeaking
                  ? 'Tap to stop'
                  : isThinking
                  ? 'Processing...'
                  : 'Tap to speak'}
              </Text>
            </View>

            {/* Quick type fallback */}
            <View style={styles.voiceInput}>
              <TextInput
                style={styles.voiceTextInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Or type here..."
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={() => sendMessage(inputText)}
                returnKeyType="send"
              />
              {inputText.length > 0 && (
                <TouchableOpacity
                  onPress={() => sendMessage(inputText)}
                  style={styles.sendBtn}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#8B85FF']}
                    style={styles.sendBtnGrad}
                  >
                    <Text style={styles.sendBtnText}>→</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          /* Text Mode UI */
          <View style={{ flex: 1 }}>
            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.text}
                  isUser={msg.isUser}
                  toolUsed={msg.toolUsed}
                />
              ))}

              {isThinking && (
                <View style={styles.thinkingRow}>
                  <View style={styles.thinkingBubble}>
                    <Text style={styles.thinkingDots}>• • •</Text>
                  </View>
                </View>
              )}

              {/* Suggestions */}
              {messages.length <= 2 && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsTitle}>Try saying...</Text>
                  <View style={styles.suggestionsWrap}>
                    {SUGGESTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.suggestionChip}
                        onPress={() => sendMessage(s)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.suggestionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Text Input Bar */}
            <View style={styles.inputBar}>
              <TouchableOpacity
                onPress={() => setIsVoiceMode(true)}
                style={styles.micBtn}
              >
                <Text style={styles.micBtnText}>🎤</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message Aurora..."
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage(inputText)}
              />
              <TouchableOpacity
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isThinking}
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isThinking) && styles.sendButtonDisabled
                ]}
              >
                <LinearGradient
                  colors={inputText.trim()
                    ? ['#6C63FF', '#8B85FF']
                    : ['#333', '#333']
                  }
                  style={styles.sendButtonGrad}
                >
                  <Text style={styles.sendButtonText}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 17, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary, marginTop: 1,
  },
  modeToggle: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  modeToggleText: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },

  // Voice Mode
  voiceContainer: { flex: 1, alignItems: 'center' },
  voiceMessages: { width: '100%', maxHeight: 280 },
  voiceMessagesContent: {
    paddingHorizontal: 16, paddingTop: 16, gap: 8,
  },
  orbSection: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', gap: 20,
  },
  orbHint: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  voiceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 12,
    gap: 10,
    width: '100%',
  },
  voiceTextInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 24, paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15, fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnGrad: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 18, color: '#fff', fontFamily: 'Inter_700Bold',
  },

  // Chat Mode
  chatScroll: { flex: 1 },
  chatContent: {
    paddingHorizontal: 16, paddingTop: 16,
    paddingBottom: 12, gap: 4,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, marginTop: 4,
  },
  thinkingBubble: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 12, borderWidth: 1,
    borderColor: Colors.border,
    marginLeft: 36,
  },
  thinkingDots: {
    fontSize: 16, color: Colors.textMuted,
    letterSpacing: 4,
  },
  suggestionsSection: { marginTop: 24, gap: 12 },
  suggestionsTitle: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    color: Colors.textMuted, paddingHorizontal: 4,
  },
  suggestionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  suggestionText: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },

  // Text input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
    gap: 10,
  },
  micBtn: {
    width: 44, height: 44,
    backgroundColor: Colors.bgCard,
    borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  micBtnText: { fontSize: 18 },
  textInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary, maxHeight: 100,
  },
  sendButton: { borderRadius: 22, overflow: 'hidden' },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonGrad: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 18, color: '#fff', fontFamily: 'Inter_700Bold',
  },
})
