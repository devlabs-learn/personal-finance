import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FC } from '@/constants/theme';
import { useTransactions } from '@/hooks/use-transactions';
import { getCategoryMeta, formatCurrency, groupByDate } from '@/services/category-meta';

export default function ActivityScreen() {
  const { data: transactions, loading, refresh } = useTransactions();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return transactions;
    const q = query.toLowerCase();
    return transactions.filter(
      tx => tx.description.toLowerCase().includes(q) ||
            tx.category.toLowerCase().includes(q) ||
            (tx.merchant?.toLowerCase().includes(q) ?? false)
    );
  }, [transactions, query]);


  console.log(filtered)

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={FC.primary} />}
      >
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <IconSymbol name="search" size={20} color={FC.outline} />
            <TextInput
              placeholder="Search transactions..."
              placeholderTextColor={FC.outline}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <IconSymbol name="tune" size={20} color={FC.primary} />
          </TouchableOpacity>
        </View>

        {loading && groups.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 48 }} color={FC.primary} />
        ) : groups.length === 0 ? (
          <Text style={styles.emptyText}>
            {query ? 'No transactions match your search.' : 'No transactions yet.'}
          </Text>
        ) : (
          groups.map((group) => (
            <View key={group.date}>
              <Text style={styles.dateLabel}>{group.date}</Text>
              <View style={styles.card}>
                {group.transactions.map((tx, i) => {
                  const meta = getCategoryMeta(tx.category, tx.transaction_type);
                  return (
                    <View key={tx.id}>
                      {i > 0 && <View style={styles.divider} />}
                      <TouchableOpacity style={styles.txRow} activeOpacity={0.7}>
                        <View style={[styles.txIcon, { backgroundColor: meta.iconBg }]}>
                          <IconSymbol name={meta.icon} size={20} color={meta.iconColor} />
                        </View>
                        <View style={styles.txInfo}>
                          <Text style={styles.txTitle} numberOfLines={1}>{tx.merchant ?? tx.description}</Text>
                          <Text style={styles.txMeta} numberOfLines={1}>{tx.category} · {tx.description}</Text>
                        </View>
                        <Text style={[styles.txAmount, tx.transaction_type === 'income' && styles.txIncome]}>
                          {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FC.background },
  scroll: { flex: 1, backgroundColor: FC.background },
  content: { padding: 16, gap: 12 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FC.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: FC.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: FC.onSurface },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: FC.surface,
    borderWidth: 1,
    borderColor: FC.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: { fontSize: 14, fontWeight: '600', color: FC.onSurfaceVariant, marginBottom: 8, marginTop: 4 },
  card: {
    backgroundColor: FC.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: FC.outlineVariant,
    shadowColor: FC.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: FC.outlineVariant, opacity: 0.4 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  txIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: FC.onSurface },
  txMeta: { fontSize: 12, color: FC.onSurfaceVariant, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700', color: FC.onSurface },
  txIncome: { color: FC.secondary },
  emptyText: { textAlign: 'center', color: FC.onSurfaceVariant, fontSize: 15, marginTop: 48 },
});
