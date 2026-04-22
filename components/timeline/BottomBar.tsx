import { useTimeline } from '@/contexts/TimelineContext';
import { ChevronUpIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { StatusPicker } from './StatusPicker';

export function BottomBar() {
  const { statuses, selectedStatusId, isTracking, startTracking, stopTracking } =
    useTimeline();
  const [pickerVisible, setPickerVisible] = React.useState(false);

  const selectedStatus = statuses.find((s) => s.id === selectedStatusId);

  return (
    <>
      <View className="flex-row items-center gap-3 border-t border-border bg-background px-4 pb-safe pt-3">
        {/* Status selector (o button) */}
        <Pressable
          onPress={() => setPickerVisible(true)}
          className="flex-1 flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3"
        >
          <View
            style={{ backgroundColor: selectedStatus?.color ?? '#6B7280' }}
            className="size-3 rounded-full"
          />
          <Text className="flex-1 text-sm font-medium">
            {selectedStatus?.label ?? '상태 선택'}
          </Text>
          <Icon as={ChevronUpIcon} className="size-4 text-muted-foreground" />
        </Pressable>

        {/* ON/OFF toggle (|--| button) */}
        <Button
          onPress={isTracking ? stopTracking : startTracking}
          variant={isTracking ? 'default' : 'outline'}
          className="min-w-[72px]"
        >
          <Text className={isTracking ? 'text-primary-foreground' : 'text-foreground'}>
            {isTracking ? 'OFF' : 'ON'}
          </Text>
        </Button>
      </View>

      <StatusPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}
