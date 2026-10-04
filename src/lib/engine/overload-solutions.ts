import { addDays, format, parseISO } from 'date-fns';
import type { SubjectGroup, WorkmapEntry } from './types';
import { MAX_LU_PER_DAY, MINUTES_PER_LU } from './calculator';
import { checkWeeklyQuota } from './detector';
import { buildDateRange, planStepDates } from './step-scheduler';
import {
  GROUP_SIZE_OPTIONS,
  smallestGroupSize,
  toGroupSteps,
  toReducedScopeSteps,
  type StepLike,
} from './group-planner';

const MAX_MINUTES_PER_DAY = MAX_LU_PER_DAY * MINUTES_PER_LU;

/** Dời hạn nộp xa nhất bao nhiêu ngày khi tìm hạn mới */
const MAX_DEADLINE_EXTENSION_DAYS = 10;

export interface PlanContext {
  startDate: string;
  deadline: string;
  /** Tải nền của lớp theo ngày, chưa tính bài đang giao */
  existingMinutesByDate: Record<string, number>;
  /** Mục workmap hiện có của lớp, dùng để soi quỹ 70/30 từng tuần */
  existingEntries: WorkmapEntry[];
  subjectGroup: SubjectGroup;
  orientation: SubjectGroup;
}

export interface PlanEvaluation {
  steps: (StepLike & { date: string })[];
  totalMinutes: number;
  /** Tải cả lớp ở ngày nặng nhất sau khi xếp bài */
  maxDayMinutes: number;
  overloadedDates: string[];
  /** Có tuần nào nhóm môn vượt quỹ 70/30 hay không */
  quotaExceeded: boolean;
  quotaReason: string;
  /** Không còn ngày quá 5 LU và không tuần nào vượt quỹ nhóm môn */
  resolvesAll: boolean;
}

const mondayOf = (date: string) => {
  const d = parseISO(date);
  return format(addDays(d, d.getDay() === 0 ? -6 : 1 - d.getDay()), 'yyyy-MM-dd');
};

const weekDatesFrom = (monday: string) =>
  Array.from({ length: 7 }, (_, i) => format(addDays(parseISO(monday), i), 'yyyy-MM-dd'));

/**
 * Xếp thử một bộ bước vào khoảng [ngày giao, hạn nộp] rồi đo tải ngày và quỹ tuần.
 * Dùng chung thuật toán xếp lịch với màn xem trước nên kết quả khớp với những gì
 * giáo viên sẽ thấy khi áp dụng phương án.
 */
export const evaluatePlan = (
  steps: StepLike[],
  ctx: PlanContext,
  deadline: string = ctx.deadline
): PlanEvaluation => {
  const dates = buildDateRange(ctx.startDate, deadline);
  const planned = planStepDates(
    steps.map((s, i) => ({ ...s, lu: s.min / MINUTES_PER_LU, dayOffset: i })),
    dates,
    ctx.existingMinutesByDate
  );

  const placed = steps.map((s, i) => ({ ...s, date: planned[i] || dates[dates.length - 1] }));

  const dayTotals: Record<string, number> = {};
  placed.forEach(s => {
    dayTotals[s.date] = (dayTotals[s.date] ?? ctx.existingMinutesByDate[s.date] ?? 0) + s.min;
  });
  const overloadedDates = Object.keys(dayTotals)
    .filter(d => dayTotals[d] > MAX_MINUTES_PER_DAY)
    .sort();
  const maxDayMinutes = Math.max(0, ...Object.values(dayTotals));

  const newEntries: WorkmapEntry[] = placed.map(s => ({
    date: s.date,
    subject_group: ctx.subjectGroup,
    minutes: s.min,
    lu: s.min / MINUTES_PER_LU,
    task_id: 'preview',
    step_name: s.name,
  }));

  let quotaExceeded = false;
  let quotaReason = '';
  [...new Set(placed.map(s => mondayOf(s.date)))].forEach(monday => {
    const result = checkWeeklyQuota(weekDatesFrom(monday), ctx.existingEntries, newEntries, ctx.orientation);
    if (result.requiresOverride) {
      quotaExceeded = true;
      quotaReason = quotaReason || result.reason;
    }
  });

  return {
    steps: placed,
    totalMinutes: steps.reduce((sum, s) => sum + s.min, 0),
    maxDayMinutes,
    overloadedDates,
    quotaExceeded,
    quotaReason,
    resolvesAll: overloadedDates.length === 0 && !quotaExceeded,
  };
};

/** Hạn nộp sớm nhất (sau hạn hiện tại) mà không còn ngày nào vượt 5 LU, null nếu không tìm được */
export const findEarliestSafeDeadline = (steps: StepLike[], ctx: PlanContext) => {
  for (let i = 1; i <= MAX_DEADLINE_EXTENSION_DAYS; i++) {
    const candidate = format(addDays(parseISO(ctx.deadline), i), 'yyyy-MM-dd');
    const evaluation = evaluatePlan(steps, ctx, candidate);
    if (evaluation.overloadedDates.length === 0) return { deadline: candidate, evaluation };
  }
  return null;
};

export interface GroupSizeOutcome {
  size: number;
  groupCount: number;
  /** Số người của nhóm ít người nhất, LU mỗi thành viên tính theo nhóm này */
  minMembers: number;
  steps: ReturnType<typeof toGroupSteps>;
  evaluation: PlanEvaluation;
}

export type SolutionId = 'group' | 'deadline' | 'scope';

export interface OverloadSolutions {
  current: PlanEvaluation;
  deadline: { deadline: string; evaluation: PlanEvaluation } | null;
  groupBySize: GroupSizeOutcome[];
  /** Cỡ nhóm nhỏ nhất giải quyết được quá tải, hoặc cỡ có ngày nặng nhất thấp nhất */
  bestGroupSize: number;
  /** Nếu làm nhóm vẫn chưa đủ thì dời hạn thêm tới ngày này */
  groupWithDeadline: { deadline: string; evaluation: PlanEvaluation } | null;
  scope: { steps: ReturnType<typeof toReducedScopeSteps>; evaluation: PlanEvaluation };
  recommended: SolutionId;
}

/**
 * Sinh các phương án giảm tải cho một bài đang làm lớp quá tải, mỗi phương án được
 * xếp thử lên workmap thật của lớp để biết nó có thực sự gỡ được quá tải hay không.
 *
 * @param individualSteps Bước làm bài cá nhân (chưa có phần điều phối nhóm)
 * @param studentCount Sĩ số lớp, dùng để chia nhóm
 */
export const buildOverloadSolutions = (
  individualSteps: StepLike[],
  ctx: PlanContext,
  studentCount: number
): OverloadSolutions => {
  const current = evaluatePlan(individualSteps, ctx);
  const deadline = findEarliestSafeDeadline(individualSteps, ctx);

  const groupBySize: GroupSizeOutcome[] = GROUP_SIZE_OPTIONS.map(size => {
    const minMembers = smallestGroupSize(studentCount, size);
    const steps = toGroupSteps(individualSteps, minMembers);
    return {
      size,
      groupCount: Math.ceil(studentCount / size),
      minMembers,
      steps,
      evaluation: evaluatePlan(steps, ctx),
    };
  });

  const resolving = groupBySize.find(g => g.evaluation.resolvesAll)
    ?? groupBySize.find(g => g.evaluation.overloadedDates.length === 0);
  const best = resolving
    ?? [...groupBySize].sort((a, b) => a.evaluation.maxDayMinutes - b.evaluation.maxDayMinutes)[0];

  const groupWithDeadline = best.evaluation.overloadedDates.length > 0
    ? findEarliestSafeDeadline(best.steps, ctx)
    : null;

  const scopeSteps = toReducedScopeSteps(individualSteps);
  const scope = { steps: scopeSteps, evaluation: evaluatePlan(scopeSteps, ctx) };

  // Ưu tiên phương án giữ nguyên hạn nộp và mục tiêu học tập: làm nhóm -> dời hạn -> giảm phạm vi
  const recommended: SolutionId = best.evaluation.resolvesAll
    ? 'group'
    : deadline?.evaluation.resolvesAll
      ? 'deadline'
      : scope.evaluation.resolvesAll
        ? 'scope'
        : best.evaluation.overloadedDates.length === 0
          ? 'group'
          : deadline
            ? 'deadline'
            : 'group';

  return {
    current,
    deadline,
    groupBySize,
    bestGroupSize: best.size,
    groupWithDeadline,
    scope,
    recommended,
  };
};
