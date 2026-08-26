import { WorkmapEntry, SubjectGroup } from './types';
import { MAX_LU_PER_DAY, MAX_LU_PER_WEEK, calculateLU } from './calculator';

// Ban chính của lớp chiếm 70% quỹ LU tuần, ban còn lại 30%
export const PRIMARY_GROUP_RATIO = 0.7;

// Cho phép lệch 10% quanh mốc 70/30 trước khi cảnh báo
export const GROUP_RATIO_TOLERANCE = 0.1;

/**
 * Tải tuần tối thiểu để việc soi tỷ lệ 70/30 có ý nghĩa (50% quỹ tuần = 12.5 LU).
 * Tuần mới chỉ có một hai bài thì tỷ lệ luôn là 100/0 — đó là chuyện bình thường,
 * không phải dấu hiệu mất cân đối nên không được bắn cảnh báo.
 */
export const RATIO_ASSESSMENT_MIN_LU = MAX_LU_PER_WEEK * 0.5;

/** Quỹ LU tuần của nhóm môn chính (70% của 25 LU) */
export const PRIMARY_GROUP_QUOTA_LU = MAX_LU_PER_WEEK * PRIMARY_GROUP_RATIO;

/** Quỹ LU tuần của nhóm môn phụ (30% của 25 LU) */
export const SECONDARY_GROUP_QUOTA_LU = MAX_LU_PER_WEEK * (1 - PRIMARY_GROUP_RATIO);

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

/**
 * Trạng thái cân đối tỷ lệ nhóm môn trong tuần.
 * - `insufficient_data`: tuần còn quá nhẹ, chưa đủ tải để nói tỷ lệ lệch hay không
 * - `ratio_deviation`  : tuần đã đủ tải nhưng tỷ lệ lệch khỏi 70/30 -> nhắc nhở mềm
 * - `quota_exceeded`   : một nhóm môn đã dùng quá phần quỹ LU tuần của mình -> phải ghi đè kèm lý do
 */
export type QuotaStatus = 'balanced' | 'insufficient_data' | 'ratio_deviation' | 'quota_exceeded';

export interface WeeklyQuotaResult {
  /** Không có vi phạm nào (bao gồm cả trường hợp tuần còn nhẹ, chưa đánh giá được) */
  isValid: boolean;
  status: QuotaStatus;
  ratioNatural: number;
  ratioSocial: number;
  naturalLU: number;
  socialLU: number;
  totalLU: number;
  /** LU và quỹ tuần của nhóm môn chính / phụ theo ban của lớp */
  primaryLU: number;
  secondaryLU: number;
  primaryQuotaLU: number;
  secondaryQuotaLU: number;
  /** Nhóm môn đã dùng vượt quỹ LU tuần của mình, null nếu chưa nhóm nào vượt */
  overloadedGroup: SubjectGroup | null;
  /** Số LU vượt quỹ của nhóm đó (0 nếu không vượt) */
  excessLU: number;
  /** Tuần đã đủ tải để đánh giá tỷ lệ 70/30 hay chưa */
  isRatioAssessable: boolean;
  /** Tổng LU tuần đã vượt ngưỡng khuyến nghị 25 LU */
  exceedsWeeklyCap: boolean;
  /** Bắt buộc nhập lý do ghi đè và lưu audit log gửi nhà trường */
  requiresOverride: boolean;
  reason: string;
}

const groupLabel = (group: SubjectGroup) => (group === 'natural' ? 'tự nhiên' : 'xã hội');

/**
 * Kiểm tra cân đối 70/30 giữa hai nhóm môn trên TỔNG LU CỦA CẢ TUẦN (không áp cho từng ngày).
 *
 * Chỉ coi là vi phạm khi một nhóm môn dùng QUÁ SỐ LU TUYỆT ĐỐI trong quỹ tuần của mình
 * (nhóm chính 70% x 25 = 17.5 LU, nhóm phụ 30% x 25 = 7.5 LU). Tỷ lệ phần trăm đơn thuần
 * không đủ để kết luận: tuần mới có 0.6/25 LU toàn môn tự nhiên thì tỷ lệ là 100/0 nhưng
 * chưa ai lấn quỹ của ai, không được cảnh báo.
 *
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

  const secondaryGroup: SubjectGroup = orientation === 'natural' ? 'social' : 'natural';
  const primaryLU = orientation === 'natural' ? naturalLU : socialLU;
  const secondaryLU = orientation === 'natural' ? socialLU : naturalLU;

  const base = {
    ratioNatural: totalLU > 0 ? naturalLU / totalLU : 0,
    ratioSocial: totalLU > 0 ? socialLU / totalLU : 0,
    naturalLU,
    socialLU,
    totalLU,
    primaryLU,
    secondaryLU,
    primaryQuotaLU: PRIMARY_GROUP_QUOTA_LU,
    secondaryQuotaLU: SECONDARY_GROUP_QUOTA_LU,
    exceedsWeeklyCap,
  };

  if (totalLU === 0) {
    return {
      ...base,
      isValid: true,
      status: 'insufficient_data',
      overloadedGroup: null,
      excessLU: 0,
      isRatioAssessable: false,
      requiresOverride: false,
      reason: '',
    };
  }

  // Vi phạm cứng: nhóm môn nào đã tiêu quá phần quỹ LU tuần của chính mình
  const primaryExcess = primaryLU - PRIMARY_GROUP_QUOTA_LU;
  const secondaryExcess = secondaryLU - SECONDARY_GROUP_QUOTA_LU;
  let overloadedGroup: SubjectGroup | null = null;
  let excessLU = 0;
  if (primaryExcess > 0 || secondaryExcess > 0) {
    // Nếu cả hai cùng vượt thì nêu tên nhóm vượt nhiều hơn so với quỹ của nó
    const primaryRatioOverQuota = primaryExcess / PRIMARY_GROUP_QUOTA_LU;
    const secondaryRatioOverQuota = secondaryExcess / SECONDARY_GROUP_QUOTA_LU;
    if (secondaryRatioOverQuota >= primaryRatioOverQuota) {
      overloadedGroup = secondaryGroup;
      excessLU = secondaryExcess;
    } else {
      overloadedGroup = orientation;
      excessLU = primaryExcess;
    }
  }

  // Nhắc nhở mềm: tuần đã đủ tải mà tỷ lệ vẫn lệch khỏi 70/30 quá biên độ cho phép
  const isRatioAssessable = totalLU >= RATIO_ASSESSMENT_MIN_LU;
  const primaryRatio = base.ratioNatural === 0 && base.ratioSocial === 0
    ? 0
    : (orientation === 'natural' ? base.ratioNatural : base.ratioSocial);
  const ratioDeviates =
    isRatioAssessable && Math.abs(primaryRatio - PRIMARY_GROUP_RATIO) > GROUP_RATIO_TOLERANCE;

  const status: QuotaStatus = overloadedGroup
    ? 'quota_exceeded'
    : ratioDeviates
      ? 'ratio_deviation'
      : isRatioAssessable
        ? 'balanced'
        : 'insufficient_data';

  let reason = '';
  if (status === 'quota_exceeded' && overloadedGroup) {
    const usedLU = overloadedGroup === orientation ? primaryLU : secondaryLU;
    const quotaLU = overloadedGroup === orientation ? PRIMARY_GROUP_QUOTA_LU : SECONDARY_GROUP_QUOTA_LU;
    const quotaPercent = Math.round((quotaLU / MAX_LU_PER_WEEK) * 100);
    reason =
      `Nhóm môn ${groupLabel(overloadedGroup)} đã dùng ${usedLU.toFixed(1)}/${quotaLU.toFixed(1)} LU ` +
      `(quỹ ${quotaPercent}% của ${MAX_LU_PER_WEEK} LU tuần), vượt ${excessLU.toFixed(1)} LU ` +
      `so với tỷ lệ 70/30 của lớp ban ${groupLabel(orientation)}.`;
  } else if (status === 'ratio_deviation') {
    const deviatingGroup = primaryRatio < PRIMARY_GROUP_RATIO ? secondaryGroup : orientation;
    const deviatingRatio = deviatingGroup === 'natural' ? base.ratioNatural : base.ratioSocial;
    reason =
      `Tuần đã có ${totalLU.toFixed(1)}/${MAX_LU_PER_WEEK} LU và nhóm môn ${groupLabel(deviatingGroup)} ` +
      `đang chiếm ${Math.round(deviatingRatio * 100)}%, lệch khỏi tỷ lệ 70/30 của lớp ban ` +
      `${groupLabel(orientation)}. Nên cân nhắc dời bớt sang nhóm môn còn lại.`;
  } else if (status === 'insufficient_data') {
    reason =
      `Tuần mới có ${totalLU.toFixed(1)}/${MAX_LU_PER_WEEK} LU — chưa đủ tải để đánh giá tỷ lệ 70/30. ` +
      `Hệ thống chỉ theo dõi, chưa cảnh báo.`;
  }

  if (exceedsWeeklyCap) {
    reason = `${reason ? reason + ' ' : ''}Tổng tải tuần ${totalLU.toFixed(1)} LU đã vượt ngưỡng khuyến nghị ${MAX_LU_PER_WEEK} LU.`;
  }

  return {
    ...base,
    isValid: status === 'balanced' || status === 'insufficient_data',
    status,
    overloadedGroup,
    excessLU: Math.max(0, excessLU),
    isRatioAssessable,
    requiresOverride: status === 'quota_exceeded',
    reason,
  };
};
