import { useEffect, useRef } from 'react'
import {
  View, StyleSheet, Animated, Easing, TouchableOpacity
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '../../constants/colors'

interface VoiceOrbProps {
  isListening: boolean
  isSpeaking: boolean
  isThinking: boolean
  onPress: () => void
}

export default function VoiceOrb({
  isListening, isSpeaking, isThinking, onPress
}: VoiceOrbProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const ring1 = useRef(new Animated.Value(1)).current
  const ring2 = useRef(new Animated.Value(1)).current
  const ring3 = useRef(new Animated.Value(1)).current

  // Pulse when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12, duration: 600,
            useNativeDriver: true, easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, duration: 600,
            useNativeDriver: true, easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start()

      // Ripple rings
      const animateRing = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1.8, duration: 1200,
              useNativeDriver: true, easing: Easing.out(Easing.ease),
            }),
            Animated.timing(anim, {
              toValue: 1, duration: 0, useNativeDriver: true,
            }),
          ])
        ).start()

      animateRing(ring1, 0)
      animateRing(ring2, 400)
      animateRing(ring3, 800)
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
      ring1.setValue(1)
      ring2.setValue(1)
      ring3.setValue(1)
    }
  }, [isListening, pulseAnim, ring1, ring2, ring3])

  // Rotate when thinking
  useEffect(() => {
    if (isThinking) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1, duration: 2000,
          useNativeDriver: true, easing: Easing.linear,
        })
      ).start()
    } else {
      rotateAnim.stopAnimation()
      rotateAnim.setValue(0)
    }
  }, [isThinking, rotateAnim])

  // Glow when speaking
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1, duration: 800, useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3, duration: 800, useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      glowAnim.stopAnimation()
      glowAnim.setValue(0)
    }
  }, [isSpeaking, glowAnim])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const orbColors = (): [string, string, string] => {
    if (isListening) return ['#FF6B8A', '#FF3366', '#CC0044']
    if (isThinking) return ['#FFB347', '#FF8C00', '#CC6600']
    if (isSpeaking) return ['#00F5A0', '#00D4FF', '#0088CC']
    return ['#6C63FF', '#8B85FF', '#4A44CC']
  }

  return (
    <View style={styles.container}>
      {/* Ripple rings (listening only) */}
      {isListening && [ring1, ring2, ring3].map((ring, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              transform: [{ scale: ring }],
              opacity: ring.interpolate({
                inputRange: [1, 1.8],
                outputRange: [0.4, 0],
              }),
            }
          ]}
        />
      ))}

      {/* Glow layer */}
      <Animated.View style={[
        styles.glow,
        {
          opacity: isListening ? 0.5
            : isSpeaking ? glowAnim
            : isThinking ? 0.3 : 0.2,
          backgroundColor: isListening ? Colors.coral
            : isSpeaking ? Colors.mint
            : Colors.primaryGlow,
        }
      ]} />

      {/* Main orb */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Animated.View style={[
          styles.orbWrapper,
          {
            transform: [
              { scale: pulseAnim },
              { rotate: spin },
            ]
          }
        ]}>
          <LinearGradient
            colors={orbColors()}
            style={styles.orb}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.Text style={[
              styles.orbEmoji,
              { opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })}
            ]}>
              {isListening ? '🎤'
                : isThinking ? '⚙️'
                : isSpeaking ? '✨'
                : '✨'}
            </Animated.Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140, height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: Colors.coral,
  },
  glow: {
    position: 'absolute',
    width: 120, height: 120,
    borderRadius: 60,
  },
  orbWrapper: {
    width: 100, height: 100,
    borderRadius: 50,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  orb: {
    width: 100, height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbEmoji: { fontSize: 36 },
})
