import { DEFAULT_STATUSES, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '@/lib/timeline/constants';
import { timelineStorage } from '@/lib/timeline/storage';
import type { Status, TimelineEntry } from '@/lib/timeline/types';
import * as React from 'react';

interface TimelineContextValue {
  entries: TimelineEntry[];
  statuses: Status[];
  activeEntry: TimelineEntry | null;
  isTracking: boolean;
  zoomLevel: number;
  startTracking: () => void;
  stopTracking: () => void;
  transition: () => void;
  labelEntry: (id: string, statusId: string) => void;
  addStatus: (label: string, color: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<TimelineEntry[]>([]);
  const [customStatuses, setCustomStatuses] = React.useState<Status[]>([]);
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

  const save = React.useCallback((next: TimelineEntry[]) => {
    setEntries(next);
    timelineStorage.saveEntries(next);
  }, []);

  const startTracking = React.useCallback(() => {
    if (isTracking) return;
    const entry: TimelineEntry = {
      id: Date.now().toString(),
      statusId: null,
      startTime: Date.now(),
      endTime: null,
    };
    save([...entries, entry]);
  }, [isTracking, entries, save]);

  const stopTracking = React.useCallback(() => {
    if (!activeEntry) return;
    save(entries.map((e) =>
      e.id === activeEntry.id ? { ...e, endTime: Date.now() } : e
    ));
  }, [activeEntry, entries, save]);

  const transition = React.useCallback(() => {
    if (!activeEntry) return;
    const now = Date.now();
    const closed = entries.map((e) =>
      e.id === activeEntry.id ? { ...e, endTime: now } : e
    );
    const next: TimelineEntry = {
      id: now.toString(),
      statusId: null,
      startTime: now,
      endTime: null,
    };
    save([...closed, next]);
  }, [activeEntry, entries, save]);

  const labelEntry = React.useCallback((id: string, statusId: string) => {
    save(entries.map((e) => (e.id === id ? { ...e, statusId } : e)));
  }, [entries, save]);

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
      zoomLevel,
      startTracking,
      stopTracking,
      transition,
      labelEntry,
      addStatus,
      zoomIn,
      zoomOut,
    }),
    [
      entries, statuses, activeEntry, isTracking, zoomLevel,
      startTracking, stopTracking, transition, labelEntry, addStatus, zoomIn, zoomOut,
    ]
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimeline(): TimelineContextValue {
  const ctx = React.useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used within a TimelineProvider');
  return ctx;
}
