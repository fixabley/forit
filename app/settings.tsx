import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/contexts/SettingsContext';
import type { LabelingSettings, PromptFrequency, TimeConfig } from '@/lib/timeline/settingsTypes';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, Switch, View } from 'react-native';

const FREQUENCY_OPTIONS: { value: PromptFrequency; label: string; desc: string }[] = [
  { value: 'low', label: '낮음', desc: 'OFF 시에만' },
  { value: 'medium', label: '보통', desc: '하루 최대 3회' },
  { value: 'high', label: '높음', desc: '하루 최대 5회' },
];

function TimeConfigRow({
  label,
  config,
  onChange,
}: {
  label: string;
  config: TimeConfig;
  onChange: (next: TimeConfig) => void;
}) {
  const handleHour = (text: string) => {
    const h = parseInt(text, 10);
    if (!isNaN(h) && h >= 0 && h <= 23) onChange({ ...config, hour: h });
  };
  const handleMinute = (text: string) => {
    const m = parseInt(text, 10);
    if (!isNaN(m) && m >= 0 && m <= 59) onChange({ ...config, minute: m });
  };

  return (
    <View className="flex-row items-center gap-3 py-3">
      <Switch
        value={config.enabled}
        onValueChange={(v) => onChange({ ...config, enabled: v })}
      />
      <Text className="flex-1 text-base">{label}</Text>
      {config.enabled && (
        <View className="flex-row items-center gap-1">
          <Input
            value={String(config.hour).padStart(2, '0')}
            onChangeText={handleHour}
            keyboardType="number-pad"
            maxLength={2}
            className="w-12 text-center"
          />
          <Text className="text-muted-foreground">:</Text>
          <Input
            value={String(config.minute).padStart(2, '0')}
            onChangeText={handleMinute}
            keyboardType="number-pad"
            maxLength={2}
            className="w-12 text-center"
          />
        </View>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  const updateTime = (key: keyof Pick<LabelingSettings, 'lunchTime' | 'dinnerTime' | 'commuteTime'>) =>
    (next: TimeConfig) => updateSettings({ [key]: next });

  return (
    <>
      <Stack.Screen options={{ title: '설정' }} />
      <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-4">
        {/* 라벨링 유도 빈도 */}
        <View className="gap-2">
          <Text className="px-1 text-sm font-medium text-muted-foreground">라벨링 유도 빈도</Text>
          <Card className="overflow-hidden p-0">
            <View className="flex-row">
              {FREQUENCY_OPTIONS.map((opt, i) => {
                const isSelected = settings.promptFrequency === opt.value;
                return (
                  <React.Fragment key={opt.value}>
                    {i > 0 && <View className="w-px bg-border" />}
                    <Button
                      variant={isSelected ? 'default' : 'ghost'}
                      onPress={() => updateSettings({ promptFrequency: opt.value })}
                      className="flex-1 flex-col gap-0.5 rounded-none py-3"
                    >
                      <Text className={`text-sm font-semibold ${isSelected ? 'text-primary-foreground' : ''}`}>
                        {opt.label}
                      </Text>
                      <Text className={`text-[11px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {opt.desc}
                      </Text>
                    </Button>
                  </React.Fragment>
                );
              })}
            </View>
          </Card>
        </View>

        {/* 시간 알림 설정 */}
        <View className="gap-2">
          <Text className="px-1 text-sm font-medium text-muted-foreground">시간대 알림</Text>
          <Card className="px-4">
            <TimeConfigRow
              label="점심"
              config={settings.lunchTime}
              onChange={updateTime('lunchTime')}
            />
            <Separator />
            <TimeConfigRow
              label="저녁"
              config={settings.dinnerTime}
              onChange={updateTime('dinnerTime')}
            />
            <Separator />
            <TimeConfigRow
              label="출퇴근"
              config={settings.commuteTime}
              onChange={updateTime('commuteTime')}
            />
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
