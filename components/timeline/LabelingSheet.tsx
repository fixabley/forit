import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useTimeline } from '@/contexts/TimelineContext';
import type { TimelineEntry } from '@/lib/timeline/types';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { StatusPicker } from './StatusPicker';

interface Props {
  visible: boolean;
  /** 특정 블록만 라벨링할 때. null이면 미라벨 블록 전체를 순차 처리 */
  targetEntryId?: string | null;
  onClose: () => void;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function LabelingSheet({ visible, targetEntryId, onClose }: Props) {
  const { entries, statuses, labelEntry } = useTimeline();
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const unlabeled = React.useMemo(
    () =>
      targetEntryId
        ? entries.filter((e) => e.id === targetEntryId)
        : entries.filter((e) => e.statusId === null && e.endTime !== null),
    [entries, targetEntryId]
  );

  const current: TimelineEntry | undefined = unlabeled[currentIndex];

  React.useEffect(() => {
    if (visible) setCurrentIndex(0);
  }, [visible]);

  const handleSelect = React.useCallback(
    (statusId: string) => {
      if (!current) return;
      labelEntry(current.id, statusId);
      setPickerVisible(false);
      if (currentIndex < unlabeled.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onClose();
      }
    },
    [current, currentIndex, unlabeled.length, labelEntry, onClose]
  );

  const handleSkip = React.useCallback(() => {
    if (currentIndex < unlabeled.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, unlabeled.length, onClose]);

  if (!visible) return null;

  if (unlabeled.length === 0) {
    onClose();
    return null;
  }

  const status = current?.statusId
    ? statuses.find((s) => s.id === current.statusId)
    : undefined;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
          <Pressable onPress={() => {}}>
            <View className="rounded-t-2xl bg-background pb-safe">
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
                <Text className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {unlabeled.length}
                </Text>
                <Text variant="h4" className="text-base font-semibold">
                  이 시간엔 뭘 했나요?
                </Text>
                <Button variant="ghost" size="sm" onPress={onClose}>
                  <Text className="text-sm text-muted-foreground">닫기</Text>
                </Button>
              </View>

              <Separator />

              {/* Time range */}
              {current && (
                <View className="items-center px-4 py-5">
                  <Text className="text-3xl font-semibold tabular-nums">
                    {formatTime(current.startTime)}
                    {current.endTime ? ` ~ ${formatTime(current.endTime)}` : ''}
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    {current.endTime
                      ? `${Math.round((current.endTime - current.startTime) / 60000)}분`
                      : '진행 중'}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View className="gap-2 px-4 pb-4">
                <Button onPress={() => setPickerVisible(true)} className="w-full">
                  <Text className="text-primary-foreground">
                    {status ? status.label : '상태 선택하기'}
                  </Text>
                </Button>
                <Button variant="ghost" onPress={handleSkip} className="w-full">
                  <Text className="text-muted-foreground">건너뛰기</Text>
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <StatusPicker
        visible={pickerVisible}
        selectedId={current?.statusId ?? null}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}
