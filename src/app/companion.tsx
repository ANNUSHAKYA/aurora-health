import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, Pressable, 
  TextInput, Animated, Easing, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX, ListRestart, HelpCircle } from 'lucide-react-native';
import { useHealthData } from '@/context/HealthDataContext';
import { parseLocalInput, parseGeminiInput, AgentResponse } from '@/services/aiAgent';

export default function CompanionScreen() {
  const { 
    profile, 
    waterGoal, 
    waterLogs, 
    sleepLogs, 
    habits, 
    addWaterLog, 
    addSleepLog, 
    createHabit, 
    toggleHabitCompletion, 
    addMealLog,
    addMemory,
    geminiApiKey
  } = useHealthData();

  // Companion UI states
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [actionsTriggered, setActionsTriggered] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'aurora', text: string }>>([
    { sender: 'aurora', text: `Hi ${profile.name || 'there'}! I'm Aurora, your AI health companion. You can speak or type to me to log your health metrics, create habits, or ask for insights.` }
  ]);

  // Speech Recognition ref for Web
  const recognitionRef = useRef<any>(null);

  // Animated values for Orb
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Initialize animations
  useEffect(() => {
    startOrbAnimation();
    return () => {
      if (pulseAnim.current) pulseAnim.current.stop();
      if (Platform.OS === 'web' && recognitionRef.current) {
        recognitionRef.current.abort();
      }
      Speech.stop();
    };
  }, []);

  // Control pulsing animations based on state
  useEffect(() => {
    if (pulseAnim.current) pulseAnim.current.stop();
    
    let duration = 2000;
    let maxScale = 1.15;
    let minOpacity = 0.5;

    if (isListening) {
      duration = 800; // fast pulsing when listening
      maxScale = 1.35;
      minOpacity = 0.3;
    } else if (isThinking) {
      duration = 1200; // breathing pulse when thinking
      maxScale = 1.1;
      minOpacity = 0.4;
    } else if (isSpeaking) {
      duration = 1000; // speech rhythm pulse
      maxScale = 1.25;
      minOpacity = 0.4;
    }

    pulseAnim.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: maxScale,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(orbOpacity, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: minOpacity,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ])
    );
    pulseAnim.current.start();
  }, [isListening, isThinking, isSpeaking]);

  const startOrbAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(orbScale, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(orbOpacity, { toValue: 0.8, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  };

  // TTS Output
  const speakResponse = (text: string) => {
    if (!speechEnabled) return;
    
    setIsSpeaking(true);
    if (Platform.OS === 'web') {
      Speech.stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      Speech.speak(text, {
        onDone: () => setIsSpeaking(false),
        onError: (e) => {
          console.error(e);
          setIsSpeaking(false);
        }
      });
    }
  };

  // Process User Input through Agent
  const processInput = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to log
    setChatHistory(prev => [...prev, { sender: 'user', text }]);
    setIsThinking(true);
    Speech.stop();

    // Context summary for Gemini
    const todayDateStr = new Date().toISOString().split('T')[0];
    const currentWater = waterLogs.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      return logDate === todayDateStr;
    }).reduce((sum, log) => sum + log.amount, 0);

    const activeHabitsList = habits.filter(h => !h.isPaused).map(h => ({
      id: h.id,
      name: h.name,
      isCompleted: h.completedDates.includes(todayDateStr)
    }));

    const sleepAverage = sleepLogs.length > 0
      ? sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length
      : 8.0;

    let response: AgentResponse;

    if (geminiApiKey) {
      response = await parseGeminiInput(text, geminiApiKey, {
        userName: profile.name,
        waterGoal,
        currentWater,
        habits: activeHabitsList,
        sleepAverage
      });
    } else {
      // Local fallback parsing
      response = parseLocalInput(text, habits.filter(h => !h.isPaused));
    }

    setIsThinking(false);

    // 1. Render speech response
    setChatHistory(prev => [...prev, { sender: 'aurora', text: response.speechResponse }]);
    speakResponse(response.speechResponse);

    // 2. Perform Agent Actions
    if (response.action && response.action.type !== 'NONE') {
      executeAction(response.action);
    }

    // 3. Save memory observation if any
    if (response.observation) {
      addMemory(response.observation, 'observation');
    }
  };

  const executeAction = (action: { type: string, payload?: any }) => {
    let actionLog = "";
    
    switch (action.type) {
      case 'ADD_WATER':
        addWaterLog(action.payload.amount);
        actionLog = `Logged ${action.payload.amount}ml of Water`;
        break;
      case 'ADD_SLEEP':
        addSleepLog(action.payload);
        actionLog = `Updated Sleep Log to ${action.payload.duration}h`;
        break;
      case 'CREATE_HABIT':
        createHabit(action.payload);
        actionLog = `Created Habit: "${action.payload.name}"`;
        break;
      case 'COMPLETE_HABIT':
        toggleHabitCompletion(action.payload.id);
        const completedHabitName = habits.find(h => h.id === action.payload.id)?.name || "Habit";
        actionLog = `Marked "${completedHabitName}" as Completed`;
        break;
      case 'LOG_MEAL':
        addMealLog(action.payload);
        actionLog = `Logged meal: ${action.payload.name} (${action.payload.calories} kcal)`;
        break;
    }

    if (actionLog) {
      setActionsTriggered(prev => [actionLog, ...prev]);
    }
  };

  // STT Handlers
  const startListening = () => {
    if (Platform.OS === 'web') {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert("Speech recognition not supported in this browser.");
          return;
        }

        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setIsListening(true);
          Speech.stop();
        };

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          processInput(text);
        };

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    } else {
      // Native Speech recognition fallback
      setIsListening(true);
      // Simulate audio capture after 3 seconds for Expo Go demo purposes if native hooks are absent
      setTimeout(() => {
        setIsListening(false);
        // Prompt common voice options
        const demoCommands = [
          "I drank 500ml water",
          "I slept 8 hours last night",
          "Create a habit to meditate every morning",
          "completed morning meditation",
          "I ate chicken salad for lunch"
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        processInput(randomCommand);
      }, 3000);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (Platform.OS === 'web' && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      processInput(inputText.trim());
      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1016', '#120F1C']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.mainWrapper}>
          
          {/* Header Controls */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Health Companion</Text>
              <Text style={styles.subtitle}>
                {geminiApiKey ? "Live Gemini Brain connected" : "Local AI Parser Mode"}
              </Text>
            </View>
            
            <Pressable 
              style={styles.toggleAudioBtn} 
              onPress={() => setSpeechEnabled(!speechEnabled)}
            >
              {speechEnabled ? <Volume2 size={20} color="#8B5CF6" /> : <VolumeX size={20} color="#7D808A" />}
            </Pressable>
          </View>

          {/* Glowing Animated AI Orb */}
          <View style={styles.orbContainer}>
            <Animated.View 
              style={[
                styles.orbPulseCircle, 
                {
                  transform: [{ scale: orbScale }],
                  opacity: orbOpacity
                }
              ]} 
            />
            <Pressable 
              style={[
                styles.orbCore,
                isListening && styles.orbCoreListening,
                isThinking && styles.orbCoreThinking,
                isSpeaking && styles.orbCoreSpeaking
              ]}
              onPress={isListening ? stopListening : startListening}
            >
              {isThinking ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Mic size={32} color="#fff" />
              )}
            </Pressable>
            <Text style={styles.orbStateText}>
              {isListening && "Listening closely..."}
              {isThinking && "Aurora is thinking..."}
              {isSpeaking && "Aurora speaking..."}
              {!isListening && !isThinking && !isSpeaking && "Tap Orb to Speak"}
            </Text>
          </View>

          {/* Mid section: Chat transcript & Action log splits */}
          <View style={styles.consoleContainer}>
            
            {/* Scrollable Conversation History */}
            <ScrollView 
              style={styles.chatScroll}
              contentContainerStyle={{ paddingBottom: 16 }}
              ref={(ref) => ref?.scrollToEnd({ animated: true })}
            >
              {chatHistory.map((chat, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.msgBubble, 
                    chat.sender === 'user' ? styles.userBubble : styles.auroraBubble
                  ]}
                >
                  {chat.sender === 'aurora' && (
                    <Sparkles size={12} color="#A78BFA" style={{ marginRight: 6, marginTop: 4 }} />
                  )}
                  <Text style={[
                    styles.msgText,
                    chat.sender === 'user' ? styles.userText : styles.auroraText
                  ]}>
                    {chat.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Live Executed Action Log overlay */}
            {actionsTriggered.length > 0 && (
              <View style={styles.actionsPanel}>
                <View style={styles.actionsHeader}>
                  <Sparkles size={14} color="#8B5CF6" />
                  <Text style={styles.actionsTitle}>EXECUTED AGENT ACTIONS</Text>
                </View>
                <ScrollView contentContainerStyle={styles.actionsList}>
                  {actionsTriggered.map((act, idx) => (
                    <View key={idx} style={styles.actionRow}>
                      <View style={styles.actionCheckDot} />
                      <Text style={styles.actionRowText}>{act}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Typing Bar (Alternate manual input fallback) */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Aurora or log something manually..."
              placeholderTextColor="#7D808A"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendText}
            />
            <Pressable style={styles.sendBtn} onPress={handleSendText}>
              <Send size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Helpful Prompts hints */}
          <View style={styles.hintsRow}>
            <HelpCircle size={12} color="#7D808A" />
            <Text style={styles.hintsText}>Try saying: "I drank 500ml water" or "How can I sleep better?"</Text>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1016',
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'web' ? 100 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#A855F7',
    fontWeight: '600',
    marginTop: 2,
  },
  toggleAudioBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#1E1B29',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // AI Orb styles
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  orbPulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#8B5CF6',
    zIndex: 1,
  },
  orbCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6D28D9',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  orbCoreListening: {
    backgroundColor: '#EC4899',
    shadowColor: '#EC4899',
  },
  orbCoreThinking: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
  },
  orbCoreSpeaking: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  orbStateText: {
    marginTop: 16,
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: '600',
  },

  // Transcript + Actions layout
  consoleContainer: {
    flex: 1,
    marginVertical: 16,
    gap: 12,
  },
  chatScroll: {
    flex: 2,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 20,
    padding: 16,
  },
  msgBubble: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B2A63',
  },
  auroraBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#202128',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
    fontWeight: '500',
  },
  auroraText: {
    color: '#E0E1E6',
    fontWeight: '500',
  },
  
  // Actions Panel
  actionsPanel: {
    flex: 0.8,
    backgroundColor: '#1B172E',
    borderWidth: 1,
    borderColor: '#362A5A',
    borderRadius: 16,
    padding: 12,
  },
  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2F274E',
    paddingBottom: 6,
    marginBottom: 8,
  },
  actionsTitle: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionsList: {
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCheckDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  actionRowText: {
    color: '#E0E1E6',
    fontSize: 12,
    fontWeight: '600',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#161720',
    borderWidth: 1,
    borderColor: '#22232B',
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#fff',
  },
  sendBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  hintsText: {
    color: '#7D808A',
    fontSize: 11,
    fontWeight: '500',
  },
});
