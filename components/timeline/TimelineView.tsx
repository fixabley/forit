import { HOUR_HEIGHT_BASE, TIME_LABEL_WIDTH } from '@/lib/timeline/constants';
import { useTimeline } from '@/contexts/TimelineContext';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../ui/text';
import { CurrentTimeLine } from './CurrentTimeLine';
import { TimelineEntryBlock } from './TimelineEntryBlock';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export function TimelineView() {
  const { entries, statuses, zoomLevel } = useTimeline();
  const scrollRef = React.useRef<ScrollView>(null);
  const hourHeight = HOUR_HEIGHT_BASE * zoomLevel;
  const totalHeight = 24 * hourHeight;

  // Auto-scroll to current time on mount
  React.useEffect(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const y = (minutes / 60) * hourHeight;
    // Scroll so current time is roughly 1/3 from top
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
        {/* Hour rows */}
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
            {/* Time label */}
            <View
              style={{ width: TIME_LABEL_WIDTH }}
              className="items-end justify-start pr-2 pt-0.5"
            >
              <Text className="text-[11px] text-muted-foreground">{formatHour(h)}</Text>
            </View>
            {/* Grid line */}
            <View className="flex-1 border-t border-border" />
          </View>
        ))}

        {/* Entry blocks */}
        {entries.map((entry) => {
          const status = statuses.find((s) => s.id === entry.statusId);
          return (
            <TimelineEntryBlock
              key={entry.id}
              entry={entry}
              status={status}
              hourHeight={hourHeight}
            />
          );
        })}

        {/* Current time line */}
        <CurrentTimeLine hourHeight={hourHeight} />
      </View>
    </ScrollView>
  );
}
