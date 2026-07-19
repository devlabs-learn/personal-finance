import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { CircularProgress } from '@/components/CircularProgress';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FC } from '@/constants/theme';

const BUDGETS = [
  { id: '1', title: 'Groceries', subtitle: 'Essential', icon: 'shopping_cart' as const, spent: 12450, total: 15000, pct: 83 },
  { id: '2', title: 'Rent & Utilities', subtitle: 'Fixed', icon: 'home_pin' as const, spent: 25000, total: 25000, pct: 100 },
  { id: '3', title: 'Entertainment', subtitle: 'Discretionary', icon: 'movie' as const, spent: 2100, total: 5000, pct: 42 },
];

const GOALS = [
  { id: '1', title: 'Emergency Fund', current: '₹75,000', target: '₹1,00,000', pct: 75, color: FC.secondary },
  { id: '2', title: 'New Car', current: '₹1,50,000', target: '₹5,00,000', pct: 30, color: FC.primary },
];

function progressColor(pct: number) {
  if (pct >= 100) return '#F87171';
  if (pct >= 80) return '#FBBF24';
  return '#34D399';
}

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function BudgetsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={{ marginTop: 4 }}>
          <Text style={styles.pageTitle}>Budgets & Goals</Text>
          <Text style={styles.pageSubtitle}>Track your monthly spending and savings progress.</Text>
        </View>

        {/* Monthly Budgets */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Budgets</Text>
          <View style={styles.monthBadge}>
            <Text style={styles.monthText}>August</Text>
          </View>
        </View>

        {BUDGETS.map((b) => {
          const color = progressColor(b.pct);
          const left = b.total - b.spent;
          return (
            <View key={b.id} style={styles.card}>
              <View style={styles.budgetTop}>
                <View style={styles.budgetLeft}>
                  <View style={styles.iconCircle}>
                    <IconSymbol name={b.icon} size={20} color={FC.primary} />
                  </View>
                  <View>
                    <Text style={styles.budgetTitle}>{b.title}</Text>
                    <Text style={styles.budgetSub}>{b.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.budgetRight}>
                  <Text style={styles.budgetSpent}>{formatINR(b.spent)}</Text>
                  <Text style={styles.budgetOf}>of {formatINR(b.total)}</Text>
                </View>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.min(b.pct, 100)}%` as any, backgroundColor: color }]} />
              </View>
              <Text style={[styles.budgetStatus, b.pct >= 100 && { color }]}>
                {b.pct}% used • {formatINR(left)} left
              </Text>
            </View>
          );
        })}

        {/* Savings Goals */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Savings Goals</Text>
        <View style={styles.goalsRow}>
          {GOALS.map((g) => (
            <View key={g.id} style={[styles.card, styles.goalCard]}>
              <CircularProgress
                percentage={g.pct}
                size={96}
                strokeWidth={8}
                color={g.color}
                trackColor="#e5eeff"
                label={`${g.pct}%`}
                labelStyle={{ fontSize: 16, fontWeight: '700', color: FC.onSurface }}
              />
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={styles.goalAmount}>
                  {g.current}{' '}
                  <Text style={styles.goalTarget}>/ {g.target}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <IconSymbol name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FC.background },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: FC.onSurface, letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 14, color: FC.onSurfaceVariant, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: FC.onSurface },
  monthBadge: { backgroundColor: FC.surfaceContainerLow, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  monthText: { fontSize: 12, fontWeight: '500', color: FC.onSurfaceVariant },
  card: {
    backgroundColor: FC.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: FC.outlineVariant,
    shadowColor: FC.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: FC.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  budgetTitle: { fontSize: 14, fontWeight: '600', color: FC.onSurface },
  budgetSub: { fontSize: 13, color: FC.onSurfaceVariant, marginTop: 2 },
  budgetRight: { alignItems: 'flex-end' },
  budgetSpent: { fontSize: 16, fontWeight: '600', color: FC.onSurface },
  budgetOf: { fontSize: 13, color: FC.onSurfaceVariant },
  track: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 99, marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 99 },
  budgetStatus: { fontSize: 12, fontWeight: '500', color: FC.onSurfaceVariant, marginTop: 6 },
  goalsRow: { flexDirection: 'row', gap: 12 },
  goalCard: { flex: 1, alignItems: 'center', gap: 12 },
  goalInfo: { alignItems: 'center' },
  goalTitle: { fontSize: 13, fontWeight: '600', color: FC.onSurface, textAlign: 'center' },
  goalAmount: { fontSize: 14, fontWeight: '600', color: FC.onSurface, marginTop: 4, textAlign: 'center' },
  goalTarget: { fontSize: 13, fontWeight: '400', color: FC.onSurfaceVariant },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FC.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
});
