import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Path, Circle as SvgCircle, G } from 'react-native-svg';
import { AppHeader } from '@/components/AppHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FC } from '@/constants/theme';
import { api } from '@/services/api';
import { formatCurrency } from '@/services/category-meta';

const HEALTH_SCORE = 85;
const GAUGE_R = 42;
const GAUGE_C = 50;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_R;
const GAUGE_OFFSET = GAUGE_CIRCUMFERENCE * (1 - HEALTH_SCORE / 100);

export default function InsightsScreen() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ count: number; total: number } | null>(null);

  async function handleScanReceipt() {
    Alert.alert(
      'Upload Receipt',
      'Choose how to import your receipt',
      [
        {
          text: 'Camera / Photo Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission required', 'Allow photo library access to upload receipts.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              quality: 0.9,
            });
            if (result.canceled || !result.assets[0]) return;
            const asset = result.assets[0];
            await uploadAndParse(asset.uri, asset.fileName ?? 'receipt.jpg', asset.mimeType ?? 'image/jpeg');
          },
        },
        {
          text: 'PDF / Document',
          onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
            if (result.canceled || !result.assets[0]) return;
            const asset = result.assets[0];
            await uploadAndParse(asset.uri, asset.name, asset.mimeType ?? 'application/pdf');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  async function uploadAndParse(uri: string, name: string, mimeType: string) {
    setScanning(true);
    setScanResult(null);
    try {
      const parsed = await api.parseDocument(uri, name, mimeType);
      const total = parsed.reduce((s, t) => s + (t.transaction_type === 'expense' ? t.amount : -t.amount), 0);
      setScanResult({ count: parsed.length, total });
      Alert.alert(
        'Receipt Scanned!',
        `Added ${parsed.length} transaction${parsed.length !== 1 ? 's' : ''} from your receipt.`
      );
    } catch (e) {
      Alert.alert('Scan failed', (e as Error).message);
    } finally {
      setScanning(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={{ marginTop: 4 }}>
          <Text style={styles.pageTitle}>AI Insights</Text>
          <Text style={styles.pageSub}>Your financial health and intelligent recommendations.</Text>
        </View>

        {/* Scan Receipt */}
        <TouchableOpacity style={styles.scanCard} activeOpacity={0.85} onPress={handleScanReceipt} disabled={scanning}>
          <View style={styles.scanIcon}>
            {scanning
              ? <ActivityIndicator color="#fff" size="small" />
              : <IconSymbol name="document_scanner" size={28} color="#fff" />
            }
          </View>
          <View style={styles.scanText}>
            <Text style={styles.scanTitle}>
              {scanning ? 'Parsing receipt…' : scanResult ? `Added ${scanResult.count} transactions` : 'Scan a Receipt'}
            </Text>
            <Text style={styles.scanSub}>
              {scanning
                ? 'Please wait while we extract your transactions.'
                : scanResult
                ? `Total: ${formatCurrency(Math.abs(scanResult.total))} · Tap to scan another`
                : 'Instantly upload or photograph receipts for auto-categorization.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Financial Health Score */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Financial Health Score</Text>
            <IconSymbol name="info" size={20} color={FC.onSurfaceVariant} />
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeSvg}>
              <Svg width={192} height={192} viewBox="0 0 100 100">
                <G rotation="-90" origin="50, 50">
                  <SvgCircle cx={GAUGE_C} cy={GAUGE_C} r={GAUGE_R} fill="transparent" stroke={FC.surfaceContainerHigh} strokeWidth={8} />
                  <SvgCircle cx={GAUGE_C} cy={GAUGE_C} r={GAUGE_R} fill="transparent" stroke={FC.secondary} strokeWidth={8}
                    strokeDasharray={GAUGE_CIRCUMFERENCE} strokeDashoffset={GAUGE_OFFSET} strokeLinecap="round" />
                </G>
              </Svg>
              <View style={styles.gaugeCenter}>
                <Text style={styles.gaugeScore}>{HEALTH_SCORE}</Text>
                <Text style={styles.gaugeLabel}>EXCELLENT</Text>
              </View>
            </View>
          </View>
          <Text style={styles.scoreDesc}>
            Your score increased by 4 points this month, driven by consistent savings and low credit utilization.
          </Text>
        </View>

        {/* Smart Recommendations */}
        <Text style={styles.sectionTitle}>Smart Recommendations</Text>

        <View style={styles.card}>
          <View style={styles.recRow}>
            <View style={[styles.recIcon, { backgroundColor: FC.errorContainer }]}>
              <IconSymbol name="subscriptions" size={20} color={FC.onErrorContainer} />
            </View>
            <View style={styles.recBody}>
              <Text style={styles.recTitle}>Unused Subscription</Text>
              <Text style={styles.recDesc}>
                You haven't accessed "StreamPlus" in 3 months. Canceling could save you ₹1,320/mo.
              </Text>
              <View style={styles.recActions}>
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
                  <Text style={styles.primaryBtnText}>Review</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.8}>
                  <Text style={styles.ghostBtnText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.recRow}>
            <View style={[styles.recIcon, { backgroundColor: FC.secondaryContainer }]}>
              <IconSymbol name="savings" size={20} color={FC.onSecondaryContainer} />
            </View>
            <View style={styles.recBody}>
              <Text style={styles.recTitle}>Optimize Savings</Text>
              <Text style={styles.recDesc}>
                Move idle funds from Checking to your High-Yield Savings to earn 4.25% APY.
              </Text>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: FC.secondary, marginTop: 12 }]} activeOpacity={0.8}>
                <Text style={styles.primaryBtnText}>Transfer Funds</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Spending Forecast */}
        <View style={styles.card}>
          <View style={styles.forecastHeader}>
            <View>
              <Text style={styles.cardTitle}>Spending Forecast</Text>
              <Text style={styles.forecastSub}>Projected end of month total</Text>
            </View>
            <View style={styles.forecastRight}>
              <Text style={styles.forecastAmount}>₹2,84,000</Text>
              <Text style={styles.forecastStatus}>Within Budget</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <Svg width="100%" height={80} viewBox="0 0 100 40" preserveAspectRatio="none">
              <Path d="M0 40 L0 25 C 20 28, 30 15, 50 18 C 65 20, 75 8, 90 12 L100 10 L100 40 Z" fill={FC.primaryFixed} />
              <Path d="M0 25 C 20 28, 30 15, 50 18 C 65 20, 75 8, 90 12" fill="none" stroke={FC.primary} strokeWidth={1.5} />
              <Path d="M90 12 C 95 13, 98 9, 100 10" fill="none" stroke={FC.primary} strokeWidth={1.5} strokeDasharray="2 2" />
              <SvgCircle cx={90} cy={12} r={2} fill={FC.primary} />
            </Svg>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FC.background },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: FC.primary },
  pageSub: { fontSize: 13, color: FC.onSurfaceVariant, marginTop: 4 },
  scanCard: {
    backgroundColor: FC.primaryFixed,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: FC.outlineVariant,
  },
  scanIcon: { backgroundColor: FC.primary, padding: 12, borderRadius: 99, alignItems: 'center', justifyContent: 'center', minWidth: 52 },
  scanText: { flex: 1 },
  scanTitle: { fontSize: 14, fontWeight: '600', color: FC.onPrimaryFixed },
  scanSub: { fontSize: 12, color: FC.onPrimaryFixedVariant, marginTop: 4, lineHeight: 18 },
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
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: FC.onSurface },
  gaugeContainer: { alignItems: 'center', marginBottom: 16 },
  gaugeSvg: { width: 192, height: 192, alignItems: 'center', justifyContent: 'center' },
  gaugeCenter: {
    position: 'absolute', width: 128, height: 128, borderRadius: 64,
    backgroundColor: FC.surface, borderWidth: 1, borderColor: FC.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  gaugeScore: { fontSize: 32, fontWeight: '700', color: FC.primary, letterSpacing: -1 },
  gaugeLabel: { fontSize: 11, fontWeight: '600', color: FC.secondary, letterSpacing: 1, marginTop: 2 },
  scoreDesc: { fontSize: 13, color: FC.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: FC.onSurface, marginTop: 4 },
  recRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  recIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recBody: { flex: 1 },
  recTitle: { fontSize: 14, fontWeight: '600', color: FC.onSurface },
  recDesc: { fontSize: 13, color: FC.onSurfaceVariant, marginTop: 4, lineHeight: 19 },
  recActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: { flex: 1, backgroundColor: FC.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  ghostBtn: { flex: 1, borderWidth: 1, borderColor: FC.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  ghostBtnText: { fontSize: 13, fontWeight: '600', color: FC.primary },
  forecastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  forecastSub: { fontSize: 13, color: FC.onSurfaceVariant, marginTop: 3 },
  forecastRight: { alignItems: 'flex-end' },
  forecastAmount: { fontSize: 16, fontWeight: '700', color: FC.primary },
  forecastStatus: { fontSize: 12, fontWeight: '500', color: FC.secondary, marginTop: 2 },
  chartContainer: { borderRadius: 10, backgroundColor: FC.surfaceContainerLow, overflow: 'hidden', height: 80 },
});
