export const MINUTES_PER_LU = 30;
export const MAX_LU_PER_DAY = 5;
export const MAX_LU_PER_WEEK = 25;

/**
 * Tính toán Load Unit từ số phút thực tế.
 * @param minutes Số phút thực tế
 * @returns Load Unit tương ứng (được làm tròn theo bước 0.5 để hiển thị nếu cần,
 *          nhưng hệ thống nội bộ sẽ lưu số phút chính xác)
 */
export const calculateLU = (minutes: number): number => {
  return Math.round((minutes / MINUTES_PER_LU) * 2) / 2;
};

/**
 * Tính toán số phút từ Load Unit.
 * @param lu Load Unit
 * @returns Số phút tương ứng
 */
export const calculateMinutes = (lu: number): number => {
  return lu * MINUTES_PER_LU;
};

export const isAtomicTask = (type: string): boolean => {
  const atomicTypes = ['quiz', 'chart', 'mindmap_short', 'short_exercise'];
  return atomicTypes.includes(type);
};

export const isDecomposableTask = (type: string): boolean => {
  const decomposableTypes = ['essay', 'mindmap_long', 'presentation_individual', 'presentation_group', 'project'];
  return decomposableTypes.includes(type);
};
