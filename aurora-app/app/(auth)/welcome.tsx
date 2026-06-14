import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, Animated, FlatList
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Colors } from '../../constants/colors'

const { width, height } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    emoji: '🌟',
    title: 'Understand yourself\nbetter every day.',
    subtitle: 'Meet your personal health companion.',
  },
  {
    id: '2',
    emoji: '💧',
    title: 'Track what\nmatters most.',
    subtitle: 'Hydration, sleep, habits, and nutrition — all in one place.',
  },
  {
    id: '3',
    emoji: '✨',
    title: 'Receive personalized\ndaily insights.',
    subtitle: 'Aurora learns your patterns and guides you forward.',
  },
  {
    id: '4',
    emoji: '🔥',
    title: 'Build healthier\nroutines.',
    subtitle: 'Consistency is the foundation of lasting change.',
  },
  {
    id: '5',
    emoji: '🧠',
    title: 'Learn more about\nyourself every day.',
    subtitle: 'The more you share, the smarter Aurora becomes.',
  },
]

export default function Welcome() {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 })
      setActiveIndex(activeIndex + 1)
    } else {
      router.push('/(auth)/login')
    }
  }

  const renderSlide = ({ item }: any) => (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  )

  return (
    <LinearGradient
      colors={['#0A0A1A', '#0D0D2B', '#0A0A1A']}
      style={styles.container}
    >
      {/* Glow orb */}
      <View style={styles.glowOrb} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <LinearGradient
            colors={['#6C63FF', '#00D4FF']}
            style={styles.logoDot}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <Text style={styles.logoText}>Aurora</Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(i) => i.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.slideList}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={['#6C63FF', '#8B85FF']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextBtnText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip */}
        {activeIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowOrb: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    top: -80, alignSelf: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
    gap: 10,
  },
  logoDot: {
    width: 28, height: 28,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  slideList: { width: width - 56 },
  slide: {
    width: width - 56,
    alignItems: 'center',
    paddingVertical: 20,
  },
  emoji: { fontSize: 72, marginBottom: 32 },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
    marginBottom: 40,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextBtn: {
    width: width - 56,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  skip: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 4,
  },
})
