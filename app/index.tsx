import { BottomBar } from '@/components/timeline/BottomBar';
import { TimelineView } from '@/components/timeline/TimelineView';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TimelineProvider, useTimeline } from '@/contexts/TimelineContext';
import { ZOOM_MAX, ZOOM_MIN } from '@/lib/timeline/constants';
import { Stack } from 'expo-router';
import { MinusIcon, MoonStarIcon, PlusIcon, SunIcon } from 'lucide-react-native';
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
  const { zoomLevel, zoomIn, zoomOut } = useTimeline();

  return (
    <>
      <Stack.Screen
        options={{
          title: '타임라인',
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Button
                onPress={zoomOut}
                size="icon"
                variant="ghost"
                disabled={zoomLevel <= ZOOM_MIN}
              >
                <Icon as={MinusIcon} className="size-5" />
              </Button>
              <Button
                onPress={zoomIn}
                size="icon"
                variant="ghost"
                disabled={zoomLevel >= ZOOM_MAX}
              >
                <Icon as={PlusIcon} className="size-5" />
              </Button>
              <Button onPress={toggleColorScheme} size="icon" variant="ghost">
                <Icon
                  as={colorScheme === 'dark' ? SunIcon : MoonStarIcon}
                  className="size-5"
                />
              </Button>
            </View>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        <TimelineView />
        <BottomBar />
      </View>
    </>
  );
}
