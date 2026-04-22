import { TIME_LABEL_WIDTH } from '@/lib/timeline/constants';
import type { Status, TimelineEntry } from '@/lib/timeline/types';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '../ui/text';

interface Props {
  entry: TimelineEntry;
  status: Status | undefined;
  hourHeight: number;
}

function timeToY(ms: number, hourHeight: number): number {
  const d = new Date(ms);
  return ((d.getHours() * 60 + d.getMinutes()) / 60) * hourHeight;
}

export function TimelineEntryBlock({ entry, status, hourHeight }: Props) {
  const top = timeToY(entry.startTime, hourHeight);
  const endMs = entry.endTime ?? Date.now();
  const bottom = timeToY(endMs, hourHeight);
  const height = Math.max(bottom - top, 4);

  const color = status?.color ?? '#6B7280';

  return (
    <View
      style={{
        position: 'absolute',
        top,
        left: TIME_LABEL_WIDTH + 12,
        right: 8,
        height,
        backgroundColor: color,
        borderRadius: 4,
        opacity: 0.85,
      }}
      pointerEvents="none"
    >
      {height > 20 && (
        <Text
          className="px-2 pt-0.5 text-[11px] font-medium text-white"
          numberOfLines={1}
        >
          {status?.label}
        </Text>
      )}
    </View>
  );
}
