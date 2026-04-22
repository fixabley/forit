import { TIME_LABEL_WIDTH } from '@/lib/timeline/constants';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '../ui/text';

interface Props {
  hourHeight: number;
}

function getCurrentY(hourHeight: number): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (minutes / 60) * hourHeight;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function CurrentTimeLine({ hourHeight }: Props) {
  const [y, setY] = React.useState(() => getCurrentY(hourHeight));
  const [label, setLabel] = React.useState(() => formatTime(new Date()));

  React.useEffect(() => {
    setY(getCurrentY(hourHeight));
  }, [hourHeight]);

  React.useEffect(() => {
    const tick = () => {
      setY(getCurrentY(hourHeight));
      setLabel(formatTime(new Date()));
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [hourHeight]);

  return (
    <View
      style={{ position: 'absolute', top: y, left: 0, right: 0, zIndex: 10 }}
      pointerEvents="none"
    >
      <View className="flex-row items-center">
        {/* Time label */}
        <View style={{ width: TIME_LABEL_WIDTH }} className="items-end pr-2">
          <Text className="text-[10px] font-semibold text-red-500">{label}</Text>
        </View>
        {/* Dot */}
        <View className="size-2.5 rounded-full bg-red-500" />
        {/* Line */}
        <View className="h-px flex-1 bg-red-500" />
      </View>
    </View>
  );
}
