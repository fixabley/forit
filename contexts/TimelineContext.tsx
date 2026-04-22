import { DEFAULT_STATUSES, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '@/lib/timeline/constants';
import { timelineStorage } from '@/lib/timeline/storage';
import type { Status, TimelineEntry } from '@/lib/timeline/types';
import * as React from 'react';

interface TimelineContextValue {
  entries: TimelineEntry[];
  statuses: Status[];
  activeEntry: TimelineEntry | null;
  isTracking: boolean;
  selectedStatusId: string;
  zoomLevel: number;
  startTracking: () => void;
  stopTracking: () => void;
  selectStatus: (id: string) => void;
  addStatus: (label: string, color: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<TimelineEntry[]>([]);
  const [customStatuses, setCustomStatuses] = React.useState<Status[]>([]);
  const [selectedStatusId, setSelectedStatusId] = React.useState(DEFAULT_STATUSES[0].id);
  const [zoomLevel, setZoomLevel] = React.useState(1.0);

  const statuses = React.useMemo(
    () => [...DEFAULT_STATUSES, ...customStatuses],
    [customStatuses]
  );

  const activeEntry = React.useMemo(
    () => entries.find((e) => e.endTime === null) ?? null,
    [entries]
  );

  const isTracking = activeEntry !== null;

  // Load persisted data on mount
  React.useEffect(() => {
    (async () => {
      const [storedEntries, storedCustomStatuses] = await Promise.all([
        timelineStorage.getEntries(),
        timelineStorage.getCustomStatuses(),
      ]);
      setEntries(storedEntries);
      setCustomStatuses(storedCustomStatuses);
    })();
  }, []);

  const startTracking = React.useCallback(() => {
    if (isTracking) return;
    const entry: TimelineEntry = {
      id: Date.now().toString(),
      statusId: selectedStatusId,
      startTime: Date.now(),
      endTime: null,
    };
    const next = [...entries, entry];
    setEntries(next);
    timelineStorage.saveEntries(next);
  }, [isTracking, selectedStatusId, entries]);

  const stopTracking = React.useCallback(() => {
    if (!activeEntry) return;
    const next = entries.map((e) =>
      e.id === activeEntry.id ? { ...e, endTime: Date.now() } : e
    );
    setEntries(next);
    timelineStorage.saveEntries(next);
  }, [activeEntry, entries]);

  const selectStatus = React.useCallback((id: string) => {
    setSelectedStatusId(id);
  }, []);

  const addStatus = React.useCallback(
    (label: string, color: string) => {
      const newStatus: Status = {
        id: Date.now().toString(),
        label,
        color,
        isDefault: false,
      };
      const next = [...customStatuses, newStatus];
      setCustomStatuses(next);
      timelineStorage.saveCustomStatuses(next);
    },
    [customStatuses]
  );

  const zoomIn = React.useCallback(() => {
    setZoomLevel((z) => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(2))));
  }, []);

  const zoomOut = React.useCallback(() => {
    setZoomLevel((z) => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(2))));
  }, []);

  const value = React.useMemo<TimelineContextValue>(
    () => ({
      entries,
      statuses,
      activeEntry,
      isTracking,
      selectedStatusId,
      zoomLevel,
      startTracking,
      stopTracking,
      selectStatus,
      addStatus,
      zoomIn,
      zoomOut,
    }),
    [
      entries, statuses, activeEntry, isTracking,
      selectedStatusId, zoomLevel,
      startTracking, stopTracking, selectStatus, addStatus, zoomIn, zoomOut,
    ]
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimeline(): TimelineContextValue {
  const ctx = React.useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used within a TimelineProvider');
  return ctx;
}
