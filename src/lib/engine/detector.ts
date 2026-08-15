import { WorkmapEntry, SubjectGroup } from './types';
import { MAX_LU_PER_DAY, MAX_LU_PER_WEEK, calculateLU } from './calculator';

// Ban chính của lớp chiếm 70% quỹ LU tuần, ban còn lại 30%
export const PRIMARY_GROUP_RATIO = 0.7;

// Cho phép lệch 10% quanh mốc 70/30 trước khi cảnh báo
export const GROUP_RATIO_TOLERANCE = 0.1;

export type WarningLevel = 'none' | 'soft' | 'must_review' | 'must_adjust' | 'critical';

export interface OverloadResult {
  isOverloaded: boolean;
  level: WarningLevel;
  overloadedDates: string[];
  reason: string;
  totalLU: number;
}

export const getWarningLevel = (excessMinutes: number): WarningLevel => {
  if (excessMinutes <= 5) return 'none';
  if (excessMinutes <= 15) return 'soft';
  if (excessMinutes <= 30) return 'must_review';
  if (excessMinutes < 60) return 'must_adjust';
  return 'critical';
};

export const checkDailyOverload = (
  date: string,
  existingEntries: WorkmapEntry[],
  newMinutes: number
): OverloadResult => {
  const currentMinutes = existingEntries
    .filter(e => e.date === date)
    .reduce((sum, e) => sum + e.minutes, 0);
  
  const totalMinutes = currentMinutes + newMinutes;
  const maxMinutes = MAX_LU_PER_DAY * 30; // 150 minutes
  
  const excessMinutes = totalMinutes - maxMinutes;
  const level = getWarningLevel(excessMinutes);
  
  return {
    isOverloaded: excessMinutes > 5,
    level,
    overloadedDates: excessMinutes > 5 ? [date] : [],
    reason: excessMinutes > 5 ? `Workload vượt ngưỡng ${calculateLU(totalMinutes)} LU/ngày` : '',
    totalLU: calculateLU(totalMinutes)
  };
};

export interface WeeklyQuotaResult {
  isValid: boolean;
  ratioNatural: number;
  ratioSocial: number;
  naturalLU: number;
  socialLU: number;
  totalLU: number;
  /** Ban đang bị giao vượt phần quỹ tuần của mình, null nếu tỷ lệ còn cân đối */
  overloadedGroup: SubjectGroup | null;
  /** Tổng LU tuần đã vượt ngưỡng khuyến nghị 25 LU */
  exceedsWeeklyCap: boolean;
  reason: string;
}

/**
 * Kiểm tra tỷ lệ 70/30 giữa hai ban trên TỔNG LU CỦA CẢ TUẦN (không áp cho từng ngày).
 * Ban chính của lớp được 70%: lớp ban tự nhiên thì môn tự nhiên chiếm 70%, lớp ban xã hội thì ngược lại.
 * @param orientation Ban của lớp, suy từ mã lớp qua getClassOrientation
 */
export const checkWeeklyQuota = (
  weekDates: string[],
  existingEntries: WorkmapEntry[],
  newEntries: WorkmapEntry[],
  orientation: SubjectGroup = 'natural'
): WeeklyQuotaResult => {
  const allEntries = [...existingEntries, ...newEntries].filter(e => weekDates.includes(e.date));

  const naturalLU = allEntries
    .filter(e => e.subject_group === 'natural')
    .reduce((sum, e) => sum + e.lu, 0);

  const socialLU = allEntries
    .filter(e => e.subject_group === 'social')
    .reduce((sum, e) => sum + e.lu, 0);

  const totalLU = naturalLU + socialLU;
  const exceedsWeeklyCap = totalLU > MAX_LU_PER_WEEK;

  if (totalLU === 0) {
    return {
      isValid: true,
      ratioNatural: 0,
      ratioSocial: 0,
      naturalLU: 0,
      socialLU: 0,
      totalLU: 0,
      overloadedGroup: null,
      exceedsWeeklyCap: false,
      reason: '',
    };
  }

  const ratioNatural = naturalLU / totalLU;
  const ratioSocial = socialLU / totalLU;

  // Tỷ lệ của ban chính so với mốc 70%, cho phép lệch trong biên độ 10%
  const primaryRatio = orientation === 'natural' ? ratioNatural : ratioSocial;
  const deviation = primaryRatio - PRIMARY_GROUP_RATIO;
  const isValid = Math.abs(deviation) <= GROUP_RATIO_TOLERANCE;

  // Lệch âm nghĩa là ban phụ đang lấn quỹ của ban chính
  const overloadedGroup: SubjectGroup | null = isValid
    ? null
    : deviation < 0
      ? (orientation === 'natural' ? 'social' : 'natural')
      : orientation;

  const groupLabel = (group: SubjectGroup) => (group === 'natural' ? 'tự nhiên' : 'xã hội');

  let reason = '';
  if (!isValid && overloadedGroup) {
    reason = `Nhóm môn ${groupLabel(overloadedGroup)} đang chiếm ${Math.round(
      (overloadedGroup === 'natural' ? ratioNatural : ratioSocial) * 100
    )}% quỹ LU tuần, lệch khỏi tỷ lệ 70/30 của lớp ban ${groupLabel(orientation)}.`;
  } else if (exceedsWeeklyCap) {
    reason = `Tổng tải tuần ${totalLU.toFixed(1)} LU đã vượt ngưỡng khuyến nghị ${MAX_LU_PER_WEEK} LU.`;
  }

  return {
    isValid,
    ratioNatural,
    ratioSocial,
    naturalLU,
    socialLU,
    totalLU,
    overloadedGroup,
    exceedsWeeklyCap,
    reason,
  };
};
