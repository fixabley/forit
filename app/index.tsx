import { BottomBar } from '@/components/timeline/BottomBar';
import { LabelingSheet } from '@/components/timeline/LabelingSheet';
import { TimelineView } from '@/components/timeline/TimelineView';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { TimelineProvider, useTimeline } from '@/contexts/TimelineContext';
import type { TimelineEntry } from '@/lib/timeline/types';
import { settingsStorage } from '@/lib/timeline/settingsStorage';
import { FREQUENCY_MAX_PROMPTS } from '@/lib/timeline/settingsTypes';
import { ZOOM_MAX, ZOOM_MIN } from '@/lib/timeline/constants';
import { router, Stack } from 'expo-router';
import { MinusIcon, MoonStarIcon, PlusIcon, Settings2Icon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';

export default function TimelineScreen() {
  return (
    <TimelineProvider>
      <TimelineScreenContent />
    </TimelineProvider>
  );
}

function TimelineScreenContent() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { zoomLevel, zoomIn, zoomOut, entries } = useTimeline();
  const { settings } = useSettings();
  const [labelingVisible, setLabelingVisible] = React.useState(false);
  const [targetEntryId, setTargetEntryId] = React.useState<string | null>(null);

  const unlabeledCount = React.useMemo(
    () => entries.filter((e) => e.statusId === null && e.endTime !== null).length,
    [entries]
  );

  const tryTrigger = React.useCallback(async () => {
    if (unlabeledCount === 0) return;
    const count = await settingsStorage.getTodayPromptCount();
    const max = FREQUENCY_MAX_PROMPTS[settings.promptFrequency];
    if (count >= max) return;
    await settingsStorage.incrementTodayPromptCount();
    setTargetEntryId(null);
    setLabelingVisible(true);
  }, [unlabeledCount, settings.promptFrequency]);

  // Time-based trigger: check every minute
  React.useEffect(() => {
    if (settings.promptFrequency === 'low') return;

    const check = () => {
      const now = new Date();
      const totalMin = now.getHours() * 60 + now.getMinutes();
      const isNear = (h: number, m: number) => Math.abs(totalMin - (h * 60 + m)) <= 1;

      const { lunchTime, dinnerTime, commuteTime } = settings;
      const triggered =
        (lunchTime.enabled && isNear(lunchTime.hour, lunchTime.minute)) ||
        (dinnerTime.enabled && isNear(dinnerTime.hour, dinnerTime.minute)) ||
        (settings.promptFrequency === 'high' &&
          commuteTime.enabled &&
          isNear(commuteTime.hour, commuteTime.minute));

      if (triggered) tryTrigger();
    };

    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [settings, tryTrigger]);

  const handleEntryPress = React.useCallback((entry: TimelineEntry) => {
    setTargetEntryId(entry.id);
    setLabelingVisible(true);
  }, []);

  const handleStopTracking = React.useCallback(() => {
    tryTrigger();
  }, [tryTrigger]);

  return (
    <>
      <Stack.Screen
        options={{
          title: '타임라인',
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Button onPress={zoomOut} size="icon" variant="ghost" disabled={zoomLevel <= ZOOM_MIN}>
                <Icon as={MinusIcon} className="size-5" />
              </Button>
              <Button onPress={zoomIn} size="icon" variant="ghost" disabled={zoomLevel >= ZOOM_MAX}>
                <Icon as={PlusIcon} className="size-5" />
              </Button>
              <Button onPress={toggleColorScheme} size="icon" variant="ghost">
                <Icon as={colorScheme === 'dark' ? SunIcon : MoonStarIcon} className="size-5" />
              </Button>
              <Button onPress={() => router.push('/settings')} size="icon" variant="ghost">
                <Icon as={Settings2Icon} className="size-5" />
              </Button>
            </View>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        <TimelineView onEntryPress={handleEntryPress} />
        <BottomBar onStopTracking={handleStopTracking} />
      </View>

      <LabelingSheet
        visible={labelingVisible}
        targetEntryId={targetEntryId}
        onClose={() => {
          setLabelingVisible(false);
          setTargetEntryId(null);
        }}
      />
    </>
  );
}
