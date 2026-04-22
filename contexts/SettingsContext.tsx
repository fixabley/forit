import { settingsStorage } from '@/lib/timeline/settingsStorage';
import { DEFAULT_LABELING_SETTINGS, type LabelingSettings } from '@/lib/timeline/settingsTypes';
import * as React from 'react';

interface SettingsContextValue {
  settings: LabelingSettings;
  updateSettings: (patch: Partial<LabelingSettings>) => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<LabelingSettings>(DEFAULT_LABELING_SETTINGS);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    settingsStorage.getSettings().then((s) => {
      setSettings(s);
      setIsLoaded(true);
    });
  }, []);

  const updateSettings = React.useCallback(
    async (patch: Partial<LabelingSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await settingsStorage.saveSettings(next);
    },
    [settings]
  );

  const value = React.useMemo(
    () => ({ settings, updateSettings, isLoaded }),
    [settings, updateSettings, isLoaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
