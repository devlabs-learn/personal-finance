import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface Segment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSublabel?: string;
}

export function DonutChart({
  segments,
  size = 112,
  strokeWidth = 12,
  centerLabel,
  centerSublabel,
}: DonutChartProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          {/* Track */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const fraction = seg.value / total;
            const arcLen = circumference * fraction;
            const currentOffset = circumference - offset;
            offset += arcLen;
            return (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLen} ${circumference - arcLen}`}
                strokeDashoffset={currentOffset}
              />
            );
          })}
        </G>
      </Svg>
      {(centerLabel || centerSublabel) && (
        <View style={styles.center} pointerEvents="none">
          {centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
          {centerSublabel && <Text style={styles.centerSub}>{centerSublabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 11,
    color: '#45474c',
    fontWeight: '500',
  },
  centerSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1c30',
  },
});
