import { format, addDays, parseISO } from 'date-fns';
import { MAX_LU_PER_DAY } from './calculator';
import type { WorkmapEntry, Task } from './types';

/** Một bước làm bài chờ được xếp lịch lên Workmap */
export interface SchedulableStep {
  name: string;
  min: number;
  lu: number;
  /** Gợi ý số ngày kể từ ngày giao, chỉ dùng khi chưa có ngày cụ thể */
  dayOffset: number;
  /** Ngày cụ thể (yyyy-MM-dd). Giáo viên chỉnh tay thì luôn được tôn trọng */
  date?: string;
}

/** Trần tải một ngày: 5 LU = 150 phút */
export const MAX_MINUTES_PER_DAY = MAX_LU_PER_DAY * 30;

/**
 * Mức tải mong muốn của RIÊNG bài tập này trong một ngày.
 * Nhờ mốc này các bước liên quan nhau được gộp chung một ngày thay vì
 * rải mỗi ngày đúng một bước.
 */
export const PREFERRED_MINUTES_PER_DAY = 60;

/** Cho phép vượt nhẹ mức mong muốn để không đẩy một bước lẻ sang ngày mới */
const TARGET_TOLERANCE = 1.25;

/** Danh sách ngày làm bài hợp lệ từ ngày giao tới hạn nộp */
export const buildDateRange = (start: string, end: string, maxDays = 60): string[] => {
  const dates: string[] = [];
  try {
    let curr = parseISO(start);
    const last = parseISO(end);
    while (curr <= last && dates.length < maxDays) {
      dates.push(format(curr, 'yyyy-MM-dd'));
      curr = addDays(curr, 1);
    }
  } catch (e) {
    // Ngày không hợp lệ thì rơi về nhánh dưới
  }
  if (dates.length === 0 && start) dates.push(start);
  return dates;
};

/**
 * Tổng số phút đã xếp cho từng ngày của một lớp, dùng làm tải nền khi xếp bài mới.
 * @param matchClassId Chỉ tính bài của lớp này, bỏ qua nếu không truyền
 */
export const buildExistingMinutesByDate = (
  workmap: WorkmapEntry[],
  tasks: Task[] = [],
  matchClassId?: (task: Task | undefined) => boolean
): Record<string, number> => {
  const map: Record<string, number> = {};
  workmap.forEach(entry => {
    const task = tasks.find(t => t.id === entry.task_id);
    if (matchClassId && !matchClassId(task)) return;
    map[entry.date] = (map[entry.date] || 0) + Number(entry.minutes || 0);
  });
  return map;
};

/**
 * Xếp từng bước vào một ngày cụ thể trong khoảng [ngày giao, hạn nộp].
 *
 * Nguyên tắc:
 * - Bước nào giáo viên đã chốt ngày (step.date nằm trong khoảng) thì giữ nguyên.
 * - Các bước còn lại xếp tuần tự, gộp nhiều bước vào cùng một ngày cho tới khi
 *   chạm mức mong muốn ~{@link PREFERRED_MINUTES_PER_DAY} phút/ngày.
 * - Không xếp thêm vào ngày đã chạm trần 150 phút (tính cả bài tập môn khác).
 * - Hết ngày mà còn bước thì dồn vào ngày cuối, để lớp cảnh báo quá tải xử lý.
 *
 * @returns Mảng ngày tương ứng theo đúng thứ tự các bước truyền vào
 */
export const planStepDates = (
  steps: SchedulableStep[],
  dates: string[],
  existingMinutesByDate: Record<string, number> = {}
): string[] => {
  if (steps.length === 0) return [];
  if (dates.length === 0) return steps.map(s => s.date || '');

  const unpinnedMinutes = steps
    .filter(s => !s.date || !dates.includes(s.date))
    .reduce((sum, s) => sum + s.min, 0);

  const neededDays = Math.min(
    dates.length,
    Math.max(1, Math.ceil(unpinnedMinutes / PREFERRED_MINUTES_PER_DAY))
  );
  const targetPerDay = Math.max(1, Math.ceil(unpinnedMinutes / neededDays));

  // Số phút của riêng bài tập này đã xếp cho từng ngày
  const plannedByDate: Record<string, number> = {};
  const remainingCapacity = (d: string) =>
    Math.max(0, MAX_MINUTES_PER_DAY - (existingMinutesByDate[d] || 0) - (plannedByDate[d] || 0));

  const result: string[] = [];
  let cursor = 0;

  steps.forEach(step => {
    const pinnedIdx = step.date ? dates.indexOf(step.date) : -1;

    if (pinnedIdx >= 0) {
      const d = dates[pinnedIdx];
      result.push(d);
      plannedByDate[d] = (plannedByDate[d] || 0) + step.min;
      cursor = Math.max(cursor, pinnedIdx);
      return;
    }

    let idx = cursor;
    while (idx < dates.length - 1) {
      const d = dates[idx];
      const used = plannedByDate[d] || 0;
      const fitsTarget = used === 0 || used + step.min <= targetPerDay * TARGET_TOLERANCE;
      const fitsCapacity = step.min <= remainingCapacity(d);
      if (fitsTarget && fitsCapacity) break;
      idx++;
    }

    const chosen = dates[Math.min(idx, dates.length - 1)];
    result.push(chosen);
    plannedByDate[chosen] = (plannedByDate[chosen] || 0) + step.min;
    cursor = idx;
  });

  return result;
};

/** Gắn ngày đã xếp vào từng bước, giữ nguyên các trường khác */
export const withPlannedDates = <T extends SchedulableStep>(
  steps: T[],
  dates: string[],
  existingMinutesByDate: Record<string, number> = {}
): T[] => {
  const planned = planStepDates(steps, dates, existingMinutesByDate);
  return steps.map((s, i) => ({ ...s, date: planned[i] || s.date }));
};
