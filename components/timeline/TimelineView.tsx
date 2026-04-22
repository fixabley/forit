import { HOUR_HEIGHT_BASE, TIME_LABEL_WIDTH } from '@/lib/timeline/constants';
import { useTimeline } from '@/contexts/TimelineContext';
import type { TimelineEntry } from '@/lib/timeline/types';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { CurrentTimeLine } from './CurrentTimeLine';
import { TimelineEntryBlock } from './TimelineEntryBlock';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

interface Props {
  onEntryPress?: (entry: TimelineEntry) => void;
}

export function TimelineView({ onEntryPress }: Props) {
  const { entries, statuses, zoomLevel } = useTimeline();
  const scrollRef = React.useRef<ScrollView>(null);
  const hourHeight = HOUR_HEIGHT_BASE * zoomLevel;
  const totalHeight = 24 * hourHeight;

  React.useEffect(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const y = (minutes / 60) * hourHeight;
    const offset = Math.max(0, y - 150);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: false });
    }, 100);
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ height: totalHeight }}
    >
      <View style={{ height: totalHeight, position: 'relative' }}>
        {HOURS.map((h) => (
          <View
            key={h}
            style={{
              position: 'absolute',
              top: h * hourHeight,
              left: 0,
              right: 0,
              height: hourHeight,
            }}
            className="flex-row"
          >
            <View
              style={{ width: TIME_LABEL_WIDTH }}
              className="items-end justify-start pr-2 pt-0.5"
            >
              <Text className="text-[11px] text-muted-foreground">{formatHour(h)}</Text>
            </View>
            <View className="flex-1 border-t border-border" />
          </View>
        ))}

        {entries.map((entry) => {
          const status = entry.statusId
            ? statuses.find((s) => s.id === entry.statusId)
            : undefined;
          return (
            <TimelineEntryBlock
              key={entry.id}
              entry={entry}
              status={status}
              hourHeight={hourHeight}
              onPress={onEntryPress}
            />
          );
        })}

        <CurrentTimeLine hourHeight={hourHeight} />
      </View>
    </ScrollView>
  );
}
