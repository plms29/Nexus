import { WorkmapEntry, SubjectGroup } from './types';
import { MAX_LU_PER_DAY, MAX_LU_PER_WEEK, calculateLU } from './calculator';

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

export const checkWeeklyQuota = (
  weekDates: string[],
  existingEntries: WorkmapEntry[],
  newEntries: WorkmapEntry[]
): { isValid: boolean; ratioNatural: number; ratioSocial: number } => {
  const allEntries = [...existingEntries, ...newEntries].filter(e => weekDates.includes(e.date));
  
  const naturalLU = allEntries
    .filter(e => e.subject_group === 'natural')
    .reduce((sum, e) => sum + e.lu, 0);
    
  const socialLU = allEntries
    .filter(e => e.subject_group === 'social')
    .reduce((sum, e) => sum + e.lu, 0);
    
  const total = naturalLU + socialLU;
  if (total === 0) return { isValid: true, ratioNatural: 0, ratioSocial: 0 };
  
  const ratioNatural = naturalLU / total;
  const ratioSocial = socialLU / total;
  
  // Tỷ lệ 70% - 30% được áp dụng linh hoạt, cảnh báo nếu lệch quá 10%
  const isValid = Math.abs(ratioNatural - 0.7) <= 0.1;
  
  return { isValid, ratioNatural, ratioSocial };
};
