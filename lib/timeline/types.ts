export interface Status {
  id: string;
  label: string;
  color: string; // hex
  isDefault: boolean;
}

export interface TimelineEntry {
  id: string;
  statusId: string;
  startTime: number; // unix ms
  endTime: number | null; // null = currently active
}
