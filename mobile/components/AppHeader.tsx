import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FC } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <Text style={styles.title}>Personal Finance</Text>
      </View>
      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
        <IconSymbol name="notifications" size={24} color={FC.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: FC.surface,
    borderBottomWidth: 1,
    borderBottomColor: FC.outlineVariant,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FC.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FC.outlineVariant,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: FC.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FC.primary,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
