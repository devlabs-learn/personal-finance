import { Platform } from 'react-native';

export const FC = {
  primary: '#091426',
  onPrimary: '#ffffff',
  primaryContainer: '#1e293b',
  onPrimaryContainer: '#8590a6',
  secondary: '#006c49',
  onSecondary: '#ffffff',
  secondaryContainer: '#6cf8bb',
  onSecondaryContainer: '#00714d',
  tertiary: '#330009',
  tertiaryContainer: '#590016',
  onTertiaryContainer: '#ff4e69',
  background: '#f8f9ff',
  onBackground: '#0b1c30',
  surface: '#ffffff',
  surfaceContainer: '#e5eeff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#45474c',
  outline: '#75777d',
  outlineVariant: '#c5c6cd',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  primaryFixed: '#d8e3fb',
  onPrimaryFixed: '#111c2d',
  onPrimaryFixedVariant: '#3c475a',
};

export const Colors = {
  light: {
    text: FC.onBackground,
    background: FC.background,
    tint: FC.primary,
    icon: FC.onSurfaceVariant,
    tabIconDefault: FC.onSurfaceVariant,
    tabIconSelected: FC.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
