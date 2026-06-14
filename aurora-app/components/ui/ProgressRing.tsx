import Svg, { Circle } from 'react-native-svg'
import { View } from 'react-native'

interface Props {
  size: number
  strokeWidth: number
  progress: number  // 0 to 1
  color: string
  bgColor?: string
}

export default function ProgressRing({
  size, strokeWidth, progress, color,
  bgColor = 'rgba(255,255,255,0.06)'
}: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1))

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2} cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2} cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  )
}
