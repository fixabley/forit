import { useTimeline } from '@/contexts/TimelineContext';
import * as React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { XIcon, PlusIcon, CheckIcon } from 'lucide-react-native';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function StatusPicker({ visible, onClose }: Props) {
  const { statuses, selectedStatusId, selectStatus, addStatus } = useTimeline();
  const [isAdding, setIsAdding] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState('');
  const [newColor, setNewColor] = React.useState(PRESET_COLORS[0]);

  const handleSelect = (id: string) => {
    selectStatus(id);
    onClose();
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    addStatus(label, newColor);
    setNewLabel('');
    setNewColor(PRESET_COLORS[0]);
    setIsAdding(false);
  };

  const handleClose = () => {
    setIsAdding(false);
    setNewLabel('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={handleClose}
      >
        <Pressable onPress={() => {}}>
          <View className="rounded-t-2xl bg-background pb-safe">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setIsAdding((v) => !v)}
                className="gap-1"
              >
                <Icon as={PlusIcon} className="size-4" />
                <Text className="text-sm">추가</Text>
              </Button>
              <Text variant="h4" className="text-base font-semibold">
                상태 선택
              </Text>
              <Button variant="ghost" size="icon" onPress={handleClose}>
                <Icon as={XIcon} className="size-5" />
              </Button>
            </View>

            {/* Add new status form */}
            {isAdding && (
              <View className="mx-4 mb-3 gap-3 rounded-xl bg-muted p-3">
                <TextInput
                  value={newLabel}
                  onChangeText={setNewLabel}
                  placeholder="상태 이름"
                  placeholderTextColor="#9CA3AF"
                  className="rounded-lg bg-background px-3 py-2 text-foreground"
                  autoFocus
                  maxLength={12}
                />
                {/* Color picker */}
                <View className="flex-row flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setNewColor(c)}
                      style={{ backgroundColor: c }}
                      className="size-7 rounded-full items-center justify-center"
                    >
                      {newColor === c && (
                        <Icon as={CheckIcon} size={14} color="white" />
                      )}
                    </Pressable>
                  ))}
                </View>
                <Button onPress={handleAdd} size="sm" disabled={!newLabel.trim()}>
                  <Text>추가하기</Text>
                </Button>
              </View>
            )}

            {/* Status list */}
            <ScrollView
              style={{ maxHeight: 320 }}
              contentContainerClassName="px-4 pb-4 gap-1"
            >
              {statuses.map((s) => {
                const isSelected = s.id === selectedStatusId;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => handleSelect(s.id)}
                    className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${
                      isSelected ? 'bg-muted' : ''
                    }`}
                  >
                    <View
                      style={{ backgroundColor: s.color }}
                      className="size-4 rounded-full"
                    />
                    <Text className="flex-1 text-base">{s.label}</Text>
                    {isSelected && (
                      <Icon as={CheckIcon} className="size-4 text-primary" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
