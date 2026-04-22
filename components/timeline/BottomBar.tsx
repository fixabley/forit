import { useTimeline } from '@/contexts/TimelineContext';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

interface Props {
  onStopTracking?: () => void;
}

export function BottomBar({ onStopTracking }: Props) {
  const { isTracking, startTracking, stopTracking, transition } = useTimeline();

  const handleStop = React.useCallback(() => {
    stopTracking();
    onStopTracking?.();
  }, [stopTracking, onStopTracking]);

  return (
    <View className="flex-row items-center gap-3 border-t border-border bg-background px-4 pb-safe pt-3">
      {isTracking ? (
        <>
          <Button onPress={transition} variant="outline" className="flex-1">
            <Text>전환</Text>
          </Button>
          <Button onPress={handleStop} className="flex-1">
            <Text className="text-primary-foreground">OFF</Text>
          </Button>
        </>
      ) : (
        <Button onPress={startTracking} className="flex-1">
          <Text className="text-primary-foreground">ON</Text>
        </Button>
      )}
    </View>
  );
}
