import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  labelStyle?: object;
}

export function CircularProgress({
  percentage,
  size = 96,
  strokeWidth = 8,
  color = '#006c49',
  trackColor = '#e5eeff',
  label,
  labelStyle,
}: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percentage));
  const offset = circumference * (1 - pct / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {label != null && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b1c30',
    textAlign: 'center',
  },
});
