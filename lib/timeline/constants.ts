import type { Status } from './types';

export const DEFAULT_STATUSES: Status[] = [
  { id: 'working',  label: '작업중', color: '#3B82F6', isDefault: true },
  { id: 'moving',   label: '이동중', color: '#10B981', isDefault: true },
  { id: 'studying', label: '공부중', color: '#8B5CF6', isDefault: true },
  { id: 'resting',  label: '휴식중', color: '#F59E0B', isDefault: true },
  { id: 'eating',   label: '식사중', color: '#EF4444', isDefault: true },
];

export const HOUR_HEIGHT_BASE = 80; // px per hour at zoom 1.0
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3.0;
export const ZOOM_STEP = 0.25;
export const TIME_LABEL_WIDTH = 52;
