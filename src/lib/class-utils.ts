import type { SubjectGroup } from './engine/types';

export const DEFAULT_CLASS_ID = '10A1';

export function normalizeClassId(classId?: string | null): string {
  return (classId || '').trim().toUpperCase();
}

/**
 * Suy định hướng (ban) của lớp từ mã lớp.
 * Quy ước: 10A1/11B2 (chữ A, B) là ban tự nhiên; 10C1/12D1 (chữ C, D) là ban xã hội;
 * lớp dạng 10/1 không có chữ cái thì mặc định ban tự nhiên.
 */
export function getClassOrientation(classId?: string | null): SubjectGroup {
  const normalized = normalizeClassId(classId);
  const match = normalized.match(/^(?:10|11|12)([A-D])\d+$/);
  if (!match) return 'natural';
  return match[1] === 'C' || match[1] === 'D' ? 'social' : 'natural';
}

export function resolveStudentClassId(classId?: string | null): string | null {
  const normalized = normalizeClassId(classId);
  return normalized || null;
}

export function normalizeClassList(classes?: string[] | null): string[] {
  if (!classes?.length) return [];
  return [...new Set(classes.map(normalizeClassId).filter(Boolean))];
}
