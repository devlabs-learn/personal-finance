import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { DonutChart } from '@/components/DonutChart';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FC } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTransactions } from '@/hooks/use-transactions';
import { Transaction } from '@/services/api';
import { getCategoryMeta, formatCurrency, formatDate } from '@/services/category-meta';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_COLORS = [FC.primary, FC.secondary, FC.tertiaryContainer, FC.outlineVariant];

function buildCashFlow(transactions: Transaction[]) {
  const now = new Date();
  const buckets: { month: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: MONTHS[d.getMonth()], income: 0, expense: 0 });
  }
  for (const tx of transactions) {
    const d = new Date(tx.date ?? tx.created_at);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) {
      const bucket = buckets[5 - monthsAgo];
      if (tx.transaction_type === 'income') bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }
  }
  const maxVal = Math.max(...buckets.flatMap(b => [b.income, b.expense]), 1);
  return buckets.map(b => ({
    month: b.month,
    inH: Math.round((b.income / maxVal) * 80),
    outH: Math.round((b.expense / maxVal) * 80),
  }));
}

function buildCategories(transactions: Transaction[]) {
  const totals: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.transaction_type === 'expense') {
      totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
    }
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  return sorted.map(([label, value], i) => ({
    label,
    pct: Math.round((value / total) * 100),
    color: CHART_COLORS[i],
    value,
  }));
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: summary, loading: summaryLoading, refresh: refreshSummary } = useDashboard();
  const { data: transactions, loading: txLoading, refresh: refreshTx } = useTransactions();

  const loading = summaryLoading || txLoading;

  const cashFlow = useMemo(() => buildCashFlow(transactions), [transactions]);
  const categories = useMemo(() => buildCategories(transactions), [transactions]);
  const recentTx = useMemo(() => transactions.slice(0, 3), [transactions]);

  const donutSegments = useMemo(() =>
    categories.length > 0
      ? categories.map(c => ({ value: c.pct, color: c.color }))
      : [{ value: 1, color: FC.outlineVariant }],
    [categories]);

  const balanceStr = summary ? formatCurrency(summary.balance) : '—';

  const onRefresh = () => { refreshSummary(); refreshTx(); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={FC.primary} />}
      >
        {/* Balance Card */}
        <View style={styles.card}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            {summary && (
              <View style={[styles.badge, summary.balance >= 0 ? styles.badgePositive : styles.badgeNegative]}>
                <IconSymbol name={summary.balance >= 0 ? 'trending_up' : 'trending_down'} size={12} color={FC.onSecondaryContainer} />
                <Text style={styles.badgeText}>{summary.balance >= 0 ? '+' : ''}
                  {summary.income > 0 ? Math.round(((summary.balance) / summary.income) * 100) : 0}%
                </Text>
              </View>
            )}
          </View>
          {summaryLoading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color={FC.primary} />
          ) : (
            <>
              <Text style={styles.balanceAmount}>{balanceStr}</Text>
              <Text style={styles.balanceSub}>
                Income: {formatCurrency(summary?.income ?? 0)} · Expenses: {formatCurrency(summary?.expenses ?? 0)}
              </Text>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={() => router.push('/add-transaction?type=income')}>
              <IconSymbol name="add" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={() => router.push('/add-transaction?type=expense')}>
              <IconSymbol name="sync_alt" size={18} color={FC.primary} />
              <Text style={styles.secondaryBtnText}>Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cash Flow */}
        <Text style={styles.sectionTitle}>Cash Flow</Text>
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: FC.primary }]} />
              <Text style={styles.legendText}>In</Text>
              <View style={[styles.dot, { backgroundColor: FC.errorContainer }]} />
              <Text style={styles.legendText}>Out</Text>
            </View>
            <View style={styles.monthBadge}>
              <Text style={styles.monthBadgeText}>Last 6 Months</Text>
            </View>
          </View>
          {txLoading ? (
            <ActivityIndicator style={{ height: 80 }} color={FC.primary} />
          ) : (
            <View style={styles.bars}>
              {cashFlow.map(({ month, inH, outH }) => (
                <View key={month} style={styles.barCol}>
                  <View style={styles.barPair}>
                    <View style={[styles.bar, { height: Math.max(inH * 0.8, 2), backgroundColor: FC.primary }]} />
                    <View style={[styles.bar, { height: Math.max(outH * 0.8, 2), backgroundColor: FC.errorContainer }]} />
                  </View>
                  <Text style={styles.barLabel}>{month}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Top Categories */}
        <Text style={styles.sectionTitle}>Top Categories</Text>
        <View style={[styles.card, styles.catCard]}>
          {txLoading ? (
            <ActivityIndicator style={{ flex: 1, height: 80 }} color={FC.primary} />
          ) : categories.length > 0 ? (
            <>
              <DonutChart
                segments={donutSegments}
                size={112}
                strokeWidth={14}
                centerLabel="Total"
                centerSublabel={formatCurrency(categories.reduce((s, c) => s + c.value, 0)).replace(/\.00$/, '')}
              />
              <View style={styles.catList}>
                {categories.map(({ label, pct, color }) => (
                  <View key={label} style={styles.catRow}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.catLabel}>{label}</Text>
                    <Text style={styles.catPct}>{pct}%</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No expense data yet</Text>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.txHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {txLoading ? (
            <ActivityIndicator style={{ height: 60 }} color={FC.primary} />
          ) : recentTx.length > 0 ? (
            recentTx.map((tx, i) => {
              const meta = getCategoryMeta(tx.category, tx.transaction_type);
              return (
                <View key={tx.id}>
                  {i > 0 && <View style={styles.txDivider} />}
                  <View style={styles.txRow}>
                    <View style={[styles.txIcon, { backgroundColor: meta.iconBg }]}>
                      <IconSymbol name={meta.icon} size={18} color={meta.iconColor} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle} numberOfLines={1}>{tx.merchant ?? tx.description}</Text>
                      <Text style={styles.txMeta}>{tx.category} · {formatDate(tx.date ?? tx.created_at)}</Text>
                    </View>
                    <Text style={[styles.txAmount, tx.transaction_type === 'income' && styles.txIncome]}>
                      {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FC.background },
  scroll: { flex: 1, backgroundColor: FC.background },
  content: { padding: 16, gap: 12 },
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
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: FC.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  badgePositive: { backgroundColor: FC.secondaryContainer },
  badgeNegative: { backgroundColor: FC.errorContainer },
  badgeText: { fontSize: 12, fontWeight: '600', color: FC.onSecondaryContainer },
  balanceAmount: { fontSize: 32, fontWeight: '700', color: FC.primary, marginTop: 8, letterSpacing: -1 },
  balanceSub: { fontSize: 12, color: FC.onSurfaceVariant, marginTop: 2 },
  divider: { height: 1, backgroundColor: FC.outlineVariant, marginVertical: 12, opacity: 0.5 },
  actions: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1, backgroundColor: FC.secondary, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: FC.primary, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secondaryBtnText: { color: FC.primary, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: FC.primary, marginTop: 4 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 13, color: FC.onSurfaceVariant, marginRight: 8 },
  dot: { width: 10, height: 10, borderRadius: 99 },
  monthBadge: { backgroundColor: FC.secondaryContainer + '80', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  monthBadgeText: { fontSize: 12, color: FC.secondary, fontWeight: '600' },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80 },
  barCol: { alignItems: 'center', flex: 1, gap: 6 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, flex: 1, justifyContent: 'center' },
  bar: { width: 10, borderRadius: 4 },
  barLabel: { fontSize: 11, color: FC.outline },
  catCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  catList: { flex: 1, gap: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catLabel: { flex: 1, fontSize: 14, color: FC.onSurface },
  catPct: { fontSize: 14, fontWeight: '700', color: FC.onSurface },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  seeAll: { fontSize: 14, color: FC.primary, fontWeight: '600' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: FC.onSurface },
  txMeta: { fontSize: 12, color: FC.onSurfaceVariant, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700', color: FC.onSurface },
  txIncome: { color: FC.secondary },
  txDivider: { height: 1, backgroundColor: FC.outlineVariant, marginVertical: 4, opacity: 0.4 },
  emptyText: { fontSize: 14, color: FC.onSurfaceVariant, textAlign: 'center', paddingVertical: 16 },
});
