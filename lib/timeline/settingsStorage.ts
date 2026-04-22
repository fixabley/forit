import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LABELING_SETTINGS, type LabelingSettings } from './settingsTypes';

const KEYS = {
  LABELING_SETTINGS: 'labeling_settings',
  PROMPT_COUNT_PREFIX: 'prompt_count_',
} as const;

function todayKey(): string {
  return new Date().toDateString();
}

export const settingsStorage = {
  async getSettings(): Promise<LabelingSettings> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.LABELING_SETTINGS);
      if (!raw) return DEFAULT_LABELING_SETTINGS;
      return { ...DEFAULT_LABELING_SETTINGS, ...JSON.parse(raw) } as LabelingSettings;
    } catch {
      return DEFAULT_LABELING_SETTINGS;
    }
  },

  async saveSettings(settings: LabelingSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.LABELING_SETTINGS, JSON.stringify(settings));
  },

  async getTodayPromptCount(): Promise<number> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PROMPT_COUNT_PREFIX + todayKey());
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  },

  async incrementTodayPromptCount(): Promise<void> {
    const current = await this.getTodayPromptCount();
    await AsyncStorage.setItem(
      KEYS.PROMPT_COUNT_PREFIX + todayKey(),
      String(current + 1)
    );
  },
};
