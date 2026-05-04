import { Account } from '@/types/email';

export type ThemeMode = 'darkGold' | 'darkBlue' | 'lightGold';
export type DensityMode = 'comfortable' | 'compact';
export type NotificationCadence = 'instant' | 'hourly' | 'daily';
export type SyncWindow = '30 days' | '90 days' | '1 year';
export type AutoDeleteWindow = '30 days' | '90 days' | 'never';
export type AiProvider = 'gemini' | 'ollama';
export type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.0-flash';

export interface EmailSettings {
  signature: string;
  themeMode: ThemeMode;
  density: DensityMode;
  showPreviewText: boolean;
  showAvatars: boolean;
  desktopAlerts: boolean;
  soundAlerts: boolean;
  digestCadence: NotificationCadence;
  notifyOnMentions: boolean;
  blockRemoteImages: boolean;
  confirmExternalLinks: boolean;
  sessionLock: boolean;
  autoDeleteTrash: AutoDeleteWindow;
  syncWindow: SyncWindow;
  keepAttachmentsOffline: boolean;
  smartCleanup: boolean;
  aiProvider: AiProvider;
  geminiModel: GeminiModel;
  ollamaBaseUrl: string;
  ollamaModel: string;
}

export interface EmailTheme {
  background: string;
  panel: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  hover: string;
  input: string;
  text: string;
  textStrong: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentContrast: string;
  danger: string;
  shadow: string;
}

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  signature: '',
  themeMode: 'darkBlue',
  density: 'comfortable',
  showPreviewText: true,
  showAvatars: true,
  desktopAlerts: true,
  soundAlerts: false,
  digestCadence: 'hourly',
  notifyOnMentions: true,
  blockRemoteImages: true,
  confirmExternalLinks: true,
  sessionLock: false,
  autoDeleteTrash: '30 days',
  syncWindow: '90 days',
  keepAttachmentsOffline: true,
  smartCleanup: true,
  aiProvider: 'gemini',
  geminiModel: 'gemini-2.5-flash',
  ollamaBaseUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3.2',
};

export const DEFAULT_PRIMARY_ACCOUNT: Account = {
  id: 'disconnected',
  name: 'No Account Connected',
  email: 'Connect Microsoft account',
  initials: 'NA',
  color: '#A9793D',
  provider: 'local',
};

export const EMAIL_THEMES: Record<'darkGold' | 'darkBlue' | 'lightGold', EmailTheme> = {
  darkGold: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.6)',
  },
  darkBlue: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.6)',
  },
  lightGold: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.18)',
  },
};

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
