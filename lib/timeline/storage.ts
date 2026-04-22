import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Status, TimelineEntry } from './types';

const KEYS = {
  ENTRIES: 'timeline_entries',
  CUSTOM_STATUSES: 'timeline_custom_statuses',
} as const;

export const timelineStorage = {
  async getEntries(): Promise<TimelineEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.ENTRIES);
      return raw ? (JSON.parse(raw) as TimelineEntry[]) : [];
    } catch {
      return [];
    }
  },

  async saveEntries(entries: TimelineEntry[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
  },

  async getCustomStatuses(): Promise<Status[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.CUSTOM_STATUSES);
      return raw ? (JSON.parse(raw) as Status[]) : [];
    } catch {
      return [];
    }
  },

  async saveCustomStatuses(statuses: Status[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CUSTOM_STATUSES, JSON.stringify(statuses));
  },
};
