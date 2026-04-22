import { TIME_LABEL_WIDTH } from '@/lib/timeline/constants';
import type { Status, TimelineEntry } from '@/lib/timeline/types';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';

interface Props {
  entry: TimelineEntry;
  status: Status | undefined;
  hourHeight: number;
  onPress?: (entry: TimelineEntry) => void;
}

function timeToY(ms: number, hourHeight: number): number {
  const d = new Date(ms);
  return ((d.getHours() * 60 + d.getMinutes()) / 60) * hourHeight;
}

export function TimelineEntryBlock({ entry, status, hourHeight, onPress }: Props) {
  const top = timeToY(entry.startTime, hourHeight);
  const endMs = entry.endTime ?? Date.now();
  const bottom = timeToY(endMs, hourHeight);
  const height = Math.max(bottom - top, 4);

  const isUnlabeled = entry.statusId === null;
  const color = status?.color ?? '#6B7280';

  return (
    <Pressable
      style={{
        position: 'absolute',
        top,
        left: TIME_LABEL_WIDTH + 12,
        right: 8,
        height,
        backgroundColor: isUnlabeled ? 'transparent' : color,
        borderRadius: 4,
        opacity: isUnlabeled ? 1 : 0.85,
        borderWidth: isUnlabeled ? 1.5 : 0,
        borderColor: isUnlabeled ? '#9CA3AF' : undefined,
        borderStyle: isUnlabeled ? 'dashed' : undefined,
      }}
      onPress={() => onPress?.(entry)}
    >
      {height > 20 && (
        <View className="flex-1 justify-start px-2 pt-0.5">
          <Text className="text-[11px] font-medium" style={{ color: isUnlabeled ? '#9CA3AF' : '#fff' }} numberOfLines={1}>
            {isUnlabeled ? '탭하여 라벨 추가' : status?.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
