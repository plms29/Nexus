export const DEFAULT_CLASS_ID = '10A1';

export function normalizeClassId(classId?: string | null): string {
  return (classId || '').trim().toUpperCase();
}

export function resolveStudentClassId(classId?: string | null): string | null {
  const normalized = normalizeClassId(classId);
  return normalized || null;
}

export function normalizeClassList(classes?: string[] | null): string[] {
  if (!classes?.length) return [];
  return [...new Set(classes.map(normalizeClassId).filter(Boolean))];
}
