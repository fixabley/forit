export type PromptFrequency = 'low' | 'medium' | 'high';

export interface TimeConfig {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface LabelingSettings {
  promptFrequency: PromptFrequency;
  lunchTime: TimeConfig;
  dinnerTime: TimeConfig;
  commuteTime: TimeConfig;
}

export const DEFAULT_LABELING_SETTINGS: LabelingSettings = {
  promptFrequency: 'medium',
  lunchTime: { enabled: true, hour: 12, minute: 30 },
  dinnerTime: { enabled: true, hour: 18, minute: 30 },
  commuteTime: { enabled: false, hour: 8, minute: 0 },
};

export const FREQUENCY_MAX_PROMPTS: Record<PromptFrequency, number> = {
  low: 1,
  medium: 3,
  high: 5,
};
