import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FC } from '@/constants/theme';
import { api, TransactionCreate, TransactionType, DocumentParseResponse } from '@/services/api';
import { formatCurrency } from '@/services/category-meta';

type Tab = 'manual' | 'upload';

const CATEGORIES_EXPENSE = ['Food', 'Groceries', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Housing', 'Health', 'Education', 'Other'];
const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Interest', 'Investment', 'Gift', 'Other'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

interface FormState {
  type: TransactionType;
  amount: string;
  description: string;
  merchant: string;
  category: string;
  date: string;
}

function defaultForm(type: TransactionType): FormState {
  return { type, amount: '', description: '', merchant: '', category: '', date: todayISO() };
}

function validate(form: FormState): string | null {
  if (!form.amount.trim() || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return 'Enter a valid amount';
  if (!form.description.trim()) return 'Enter a description';
  return null;
}

export default function AddTransactionScreen() {
  const { type: paramType } = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();

  const initialType: TransactionType = paramType === 'income' ? 'income' : 'expense';
  const [tab, setTab] = useState<Tab>('manual');
  const [form, setForm] = useState<FormState>(defaultForm(initialType));
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<DocumentParseResponse[] | null>(null);
  const [selectedParsed, setSelectedParsed] = useState<number>(0);

  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const applyParsed = useCallback((item: DocumentParseResponse) => {
    setForm({
      type: item.transaction_type,
      amount: String(item.amount),
      description: item.description,
      merchant: item.merchant ?? '',
      category: item.category,
      date: item.date ?? todayISO(),
    });
    setParsed(null);
    setTab('manual');
  }, []);

  const handleSave = useCallback(async () => {
    const err = validate(form);
    if (err) { Alert.alert('Validation', err); return; }
    setSaving(true);
    try {
      const payload: TransactionCreate = {
        description: form.description.trim(),
        amount: Number(form.amount),
        transaction_type: form.type,
        category: form.category.trim() || (form.type === 'income' ? 'income' : 'other'),
        merchant: form.merchant.trim() || undefined,
        date: form.date || undefined,
      };
      await api.createTransaction(payload);
      router.back();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [form, router]);

  const parseFile = useCallback(async (uri: string, name: string, mime: string) => {
    setParsing(true);
    try {
      const results = await api.parseDocument(uri, name, mime);
      if (results.length === 0) {
        Alert.alert('No results', 'Could not extract any transactions from this file.');
        return;
      }
      if (results.length === 1) {
        applyParsed(results[0]);
      } else {
        setParsed(results);
        setSelectedParsed(0);
      }
    } catch (e) {
      Alert.alert('Parse error', (e as Error).message);
    } finally {
      setParsing(false);
    }
  }, [applyParsed]);

  const handleCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Camera permission is required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const name = asset.fileName ?? 'photo.jpg';
    const mime = asset.mimeType ?? 'image/jpeg';
    await parseFile(asset.uri, name, mime);
  }, [parseFile]);

  const handleFilePick = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await parseFile(asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream');
  }, [parseFile]);

  const categories = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="close" size={24} color={FC.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {initialType === 'income' ? 'Add Income' : 'Add Expense'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActive]}
          onPress={() => setTab('manual')}
          activeOpacity={0.8}
        >
          <IconSymbol name="edit" size={15} color={tab === 'manual' ? FC.onPrimary : FC.onSurfaceVariant} />
          <Text style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}>Manual Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'upload' && styles.tabBtnActive]}
          onPress={() => setTab('upload')}
          activeOpacity={0.8}
        >
          <IconSymbol name="upload_file" size={15} color={tab === 'upload' ? FC.onPrimary : FC.onSurfaceVariant} />
          <Text style={[styles.tabText, tab === 'upload' && styles.tabTextActive]}>Upload / Capture</Text>
        </TouchableOpacity>
      </View>

      {tab === 'manual' ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

            {/* Type toggle */}
            <Text style={styles.fieldLabel}>Transaction Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, form.type === 'expense' && styles.typeBtnActive]}
                onPress={() => { setField('type', 'expense'); setField('category', ''); }}
                activeOpacity={0.8}
              >
                <IconSymbol name="arrow_upward" size={16} color={form.type === 'expense' ? FC.onErrorContainer : FC.onSurfaceVariant} />
                <Text style={[styles.typeBtnText, form.type === 'expense' && styles.typeBtnTextActive]}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, form.type === 'income' && styles.typeBtnIncome]}
                onPress={() => { setField('type', 'income'); setField('category', ''); }}
                activeOpacity={0.8}
              >
                <IconSymbol name="arrow_downward" size={16} color={form.type === 'income' ? FC.onSecondaryContainer : FC.onSurfaceVariant} />
                <Text style={[styles.typeBtnText, form.type === 'income' && styles.typeBtnTextIncome]}>Income</Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={FC.outline}
                value={form.amount}
                onChangeText={v => setField('amount', v)}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Merchant */}
            <Text style={styles.fieldLabel}>Merchant <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Amazon, Swiggy"
              placeholderTextColor={FC.outline}
              value={form.merchant}
              onChangeText={v => setField('merchant', v)}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this for?"
              placeholderTextColor={FC.outline}
              value={form.description}
              onChangeText={v => setField('description', v)}
            />

            {/* Category chips */}
            <Text style={styles.fieldLabel}>Category <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.chipsRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, form.category.toLowerCase() === cat.toLowerCase() && styles.chipActive]}
                  onPress={() => setField('category', form.category.toLowerCase() === cat.toLowerCase() ? '' : cat.toLowerCase())}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, form.category.toLowerCase() === cat.toLowerCase() && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date */}
            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={FC.outline}
              value={form.date}
              onChangeText={v => setField('date', v)}
            />

            {/* Save */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <IconSymbol name="check" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Transaction</Text>
                </>
              )}
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.uploadContent}>
          {parsing ? (
            <View style={styles.parsingBox}>
              <ActivityIndicator size="large" color={FC.primary} />
              <Text style={styles.parsingText}>Reading document…</Text>
            </View>
          ) : parsed ? (
            /* Multiple results — let user pick one */
            <>
              <Text style={styles.parsedTitle}>Found {parsed.length} transactions</Text>
              <Text style={styles.parsedSub}>Tap one to fill the form</Text>
              {parsed.map((item, i) => (
                <TouchableOpacity key={i} style={styles.parsedCard} onPress={() => applyParsed(item)} activeOpacity={0.8}>
                  <View style={styles.parsedRow}>
                    <Text style={styles.parsedMerchant}>{item.merchant ?? item.description}</Text>
                    <Text style={[styles.parsedAmount, item.transaction_type === 'income' && styles.parsedIncome]}>
                      {item.transaction_type === 'income' ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
                    </Text>
                  </View>
                  <Text style={styles.parsedMeta}>{item.category} · {item.date ?? 'no date'}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <View style={styles.uploadIllustration}>
                <IconSymbol name="receipt_long" size={56} color={FC.outlineVariant} />
                <Text style={styles.uploadHint}>Upload a receipt, bill, or bank statement</Text>
                <Text style={styles.uploadSub}>We'll extract transaction details automatically</Text>
              </View>

              <TouchableOpacity style={styles.uploadBtn} onPress={handleCamera} activeOpacity={0.85}>
                <View style={[styles.uploadBtnIcon, { backgroundColor: FC.surfaceContainer }]}>
                  <IconSymbol name="photo_camera" size={22} color={FC.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadBtnTitle}>Take a Photo</Text>
                  <Text style={styles.uploadBtnSub}>Capture a receipt or bill with your camera</Text>
                </View>
                <IconSymbol name="chevron_right" size={20} color={FC.outline} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadBtn} onPress={handleFilePick} activeOpacity={0.85}>
                <View style={[styles.uploadBtnIcon, { backgroundColor: FC.secondaryContainer }]}>
                  <IconSymbol name="folder_open" size={22} color={FC.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadBtnTitle}>Choose a File</Text>
                  <Text style={styles.uploadBtnSub}>Select an image or PDF from your device</Text>
                </View>
                <IconSymbol name="chevron_right" size={20} color={FC.outline} />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FC.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: FC.outlineVariant,
    backgroundColor: FC.surface,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: FC.onSurface },
  tabRow: {
    flexDirection: 'row', gap: 8, padding: 12,
    backgroundColor: FC.surface,
    borderBottomWidth: 1, borderBottomColor: FC.outlineVariant,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: FC.surfaceContainerLow,
    borderWidth: 1, borderColor: FC.outlineVariant,
  },
  tabBtnActive: { backgroundColor: FC.primary, borderColor: FC.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: FC.onSurfaceVariant },
  tabTextActive: { color: FC.onPrimary },
  formContent: { padding: 16, gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: FC.onSurfaceVariant, marginTop: 12, marginBottom: 6 },
  optional: { fontWeight: '400', color: FC.outline },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 10,
    backgroundColor: FC.surfaceContainerLow,
    borderWidth: 1, borderColor: FC.outlineVariant,
  },
  typeBtnActive: { backgroundColor: FC.errorContainer, borderColor: FC.onErrorContainer },
  typeBtnIncome: { backgroundColor: FC.secondaryContainer, borderColor: FC.secondary },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: FC.onSurfaceVariant },
  typeBtnTextActive: { color: FC.onErrorContainer },
  typeBtnTextIncome: { color: FC.onSecondaryContainer },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: FC.surface, borderRadius: 12,
    borderWidth: 1, borderColor: FC.outlineVariant,
    paddingHorizontal: 14,
  },
  currencySymbol: { fontSize: 22, fontWeight: '700', color: FC.primary, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '700', color: FC.onSurface, paddingVertical: 12 },
  input: {
    backgroundColor: FC.surface, borderRadius: 12,
    borderWidth: 1, borderColor: FC.outlineVariant,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: FC.onSurface,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 99, backgroundColor: FC.surfaceContainerLow,
    borderWidth: 1, borderColor: FC.outlineVariant,
  },
  chipActive: { backgroundColor: FC.primaryContainer, borderColor: FC.primary },
  chipText: { fontSize: 13, color: FC.onSurfaceVariant, fontWeight: '500' },
  chipTextActive: { color: FC.onPrimaryContainer, fontWeight: '600' },
  saveBtn: {
    marginTop: 20, backgroundColor: FC.primary,
    paddingVertical: 16, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  uploadContent: { padding: 20, gap: 16 },
  uploadIllustration: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  uploadHint: { fontSize: 16, fontWeight: '600', color: FC.onSurface, textAlign: 'center' },
  uploadSub: { fontSize: 13, color: FC.onSurfaceVariant, textAlign: 'center' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: FC.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: FC.outlineVariant,
  },
  uploadBtnIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  uploadBtnTitle: { fontSize: 15, fontWeight: '600', color: FC.onSurface, marginBottom: 2 },
  uploadBtnSub: { fontSize: 12, color: FC.onSurfaceVariant },
  parsingBox: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  parsingText: { fontSize: 15, color: FC.onSurfaceVariant },
  parsedTitle: { fontSize: 18, fontWeight: '700', color: FC.onSurface },
  parsedSub: { fontSize: 13, color: FC.onSurfaceVariant, marginBottom: 8 },
  parsedCard: {
    backgroundColor: FC.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: FC.outlineVariant,
  },
  parsedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  parsedMerchant: { fontSize: 14, fontWeight: '600', color: FC.onSurface, flex: 1 },
  parsedAmount: { fontSize: 14, fontWeight: '700', color: FC.onSurface },
  parsedIncome: { color: FC.secondary },
  parsedMeta: { fontSize: 12, color: FC.onSurfaceVariant, marginTop: 4 },
});
