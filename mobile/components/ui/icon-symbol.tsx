// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'receipt.long': 'receipt-long',
  'chart.pie.fill': 'pie-chart',
  'lightbulb.fill': 'lightbulb',
  'brain.fill': 'psychology',
  // UI
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  chevron_right: 'chevron-right',
  'bell': 'notifications',
  notifications: 'notifications',
  'magnifyingglass': 'search',
  search: 'search',
  'slider.horizontal.3': 'tune',
  tune: 'tune',
  add: 'add',
  close: 'close',
  check: 'check',
  edit: 'edit',
  sync_alt: 'sync-alt',
  trending_up: 'trending-up',
  trending_down: 'trending-down',
  bar_chart: 'bar-chart',
  pie_chart: 'pie-chart',
  arrow_upward: 'arrow-upward',
  arrow_downward: 'arrow-downward',
  upload_file: 'upload-file',
  photo_camera: 'photo-camera',
  folder_open: 'folder-open',
  receipt_long: 'receipt-long',
  // Transaction icons
  shopping_cart: 'shopping-cart',
  bolt: 'flash-on',
  wallet: 'account-balance-wallet',
  payments: 'payments',
  'car.fill': 'directions-car',
  directions_car: 'directions-car',
  play_circle: 'play-circle-filled',
  live_tv: 'live-tv',
  coffee: 'local-cafe',
  local_cafe: 'local-cafe',
  storefront: 'storefront',
  // Budget & Goals
  home_pin: 'home',
  movie: 'movie',
  savings: 'savings',
  // Insights
  document_scanner: 'document-scanner',
  subscriptions: 'subscriptions',
  info: 'info',
  'creditcard.fill': 'credit-card',
} as const;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
