import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Colors } from '../../constants/colors'

interface CardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  glow?: 'purple' | 'aqua' | 'mint' | 'coral' | 'amber'
}

const GLOWS = {
  purple: Colors.primaryGlow,
  aqua: Colors.aquaGlow,
  mint: Colors.mintGlow,
  coral: Colors.coralGlow,
  amber: Colors.amberGlow,
}

export default function Card({ children, style, glow }: CardProps) {
  return (
    <View style={[
      styles.card,
      glow && { shadowColor: GLOWS[glow], shadowOpacity: 1, elevation: 6 },
      style
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
  },
})
