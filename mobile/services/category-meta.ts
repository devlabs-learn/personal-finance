import { FC } from '@/constants/theme';

type IconName =
  | 'shopping_cart' | 'storefront' | 'local_cafe' | 'payments' | 'directions_car'
  | 'live_tv' | 'bolt' | 'home_pin' | 'movie' | 'savings' | 'subscriptions' | 'wallet' | 'sync_alt';

interface CategoryMeta {
  icon: IconName;
  iconBg: string;
  iconColor: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  // Income
  'income':          { icon: 'payments',       iconBg: '#4edea3',             iconColor: '#005236' },
  'salary':          { icon: 'payments',       iconBg: '#4edea3',             iconColor: '#005236' },
  'interest':        { icon: 'payments',       iconBg: '#4edea3',             iconColor: '#005236' },
  // Food
  'groceries':       { icon: 'shopping_cart',  iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  'food':            { icon: 'storefront',     iconBg: FC.secondaryContainer, iconColor: FC.onSecondaryContainer },
  'dining':          { icon: 'local_cafe',     iconBg: '#545f7333',           iconColor: '#545f73' },
  // Transport
  'transport':       { icon: 'directions_car', iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  'travel':          { icon: 'directions_car', iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  'fuel':            { icon: 'directions_car', iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  // Entertainment
  'entertainment':   { icon: 'live_tv',        iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  // Bills & Utilities
  'bills':           { icon: 'bolt',           iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  'utilities':       { icon: 'bolt',           iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  'bank charges':    { icon: 'bolt',           iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  'insurance':       { icon: 'bolt',           iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  // Housing
  'housing':         { icon: 'home_pin',       iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  'rent':            { icon: 'home_pin',       iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  // Savings & Subscriptions
  'savings':         { icon: 'savings',        iconBg: FC.secondaryContainer, iconColor: FC.onSecondaryContainer },
  'subscription':    { icon: 'subscriptions',  iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  'subscriptions':   { icon: 'subscriptions',  iconBg: FC.errorContainer,     iconColor: FC.onErrorContainer },
  // Shopping & ATM
  'shopping':        { icon: 'shopping_cart',  iconBg: FC.surfaceContainer,   iconColor: FC.primary },
  'atm withdrawal':  { icon: 'payments',       iconBg: FC.surfaceContainerHigh, iconColor: FC.onSurfaceVariant },
  'wallet':          { icon: 'wallet',         iconBg: FC.surfaceContainerHigh, iconColor: FC.onSurfaceVariant },
  'transfer':        { icon: 'sync_alt',       iconBg: FC.surfaceContainer,   iconColor: FC.primary },
};

const DEFAULT_EXPENSE: CategoryMeta = { icon: 'wallet', iconBg: FC.surfaceContainer, iconColor: FC.primary };
const DEFAULT_INCOME: CategoryMeta  = { icon: 'payments', iconBg: '#4edea3', iconColor: '#005236' };

export function getCategoryMeta(category: string, type: 'income' | 'expense'): CategoryMeta {
  const key = category.toLowerCase().trim();
  return CATEGORY_MAP[key] ?? (type === 'income' ? DEFAULT_INCOME : DEFAULT_EXPENSE);
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return amount.toLocaleString('en-US', { style: 'currency', currency });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function groupByDate(transactions: import('@/services/api').Transaction[]) {
  const groups: Record<string, import('@/services/api').Transaction[]> = {};
  for (const tx of transactions) {
    const d = new Date(tx.date ?? tx.created_at);
    const label = formatGroupLabel(d);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return Object.entries(groups).map(([date, transactions]) => ({ date, transactions }));
}

function formatGroupLabel(d: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today, ' + d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  if (diff === 1) return 'Yesterday, ' + d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
}
