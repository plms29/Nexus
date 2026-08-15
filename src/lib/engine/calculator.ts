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

export type QuestionLevel = 'l1' | 'l2' | 'l3' | 'l4';

/**
 * Định mức giây/câu cho từng mức độ nhận thức, lấy trung bình các khoảng trong tài liệu:
 * L1 nhận biết 15-30s, L2 thông hiểu 45-60s, L3 vận dụng 2-2.5 phút, L4 vận dụng cao 3-5 phút.
 * Giáo viên có thể chỉnh lại trước khi giao bài.
 */
export const DEFAULT_SECONDS_PER_LEVEL: Record<QuestionLevel, number> = {
  l1: 22,
  l2: 52,
  l3: 135,
  l4: 240,
};

export const LEVEL_LABELS: Record<QuestionLevel, string> = {
  l1: 'Nhận biết',
  l2: 'Thông hiểu',
  l3: 'Vận dụng',
  l4: 'Vận dụng cao',
};

export const QUESTION_LEVELS: QuestionLevel[] = ['l1', 'l2', 'l3', 'l4'];

export interface QuizDurationResult {
  /** Số câu theo từng mức độ */
  countByLevel: Record<QuestionLevel, number>;
  /** Số phút quy đổi của riêng từng mức độ (đã làm tròn lên) */
  minutesByLevel: Record<QuestionLevel, number>;
  totalQuestions: number;
  totalMinutes: number;
  totalLU: number;
}

/**
 * Tính thời gian làm quiz từ ma trận độ khó thay vì áp một định mức phẳng cho mọi câu.
 * @param questions Danh sách câu hỏi (chỉ cần trường level)
 * @param secondsPerLevel Định mức giây/câu, mặc định theo DEFAULT_SECONDS_PER_LEVEL
 */
export const calculateQuizDuration = (
  questions: { level?: string | null }[],
  secondsPerLevel: Record<QuestionLevel, number> = DEFAULT_SECONDS_PER_LEVEL
): QuizDurationResult => {
  const countByLevel: Record<QuestionLevel, number> = { l1: 0, l2: 0, l3: 0, l4: 0 };

  questions.forEach(q => {
    const level = (q.level || 'l1').toLowerCase() as QuestionLevel;
    // Câu hỏi thiếu mức độ hoặc ghi sai được tính như mức nhận biết
    countByLevel[QUESTION_LEVELS.includes(level) ? level : 'l1'] += 1;
  });

  const minutesByLevel: Record<QuestionLevel, number> = { l1: 0, l2: 0, l3: 0, l4: 0 };
  let totalSeconds = 0;

  QUESTION_LEVELS.forEach(level => {
    const seconds = countByLevel[level] * (secondsPerLevel[level] ?? DEFAULT_SECONDS_PER_LEVEL[level]);
    totalSeconds += seconds;
    minutesByLevel[level] = Math.ceil(seconds / 60);
  });

  const totalMinutes = Math.ceil(totalSeconds / 60);

  return {
    countByLevel,
    minutesByLevel,
    totalQuestions: questions.length,
    totalMinutes,
    // Bài đã giao thì luôn chiếm ít nhất nửa LU, tránh hiển thị "0 LU" cho đề toàn câu dễ
    totalLU: totalMinutes > 0 ? Math.max(0.5, calculateLU(totalMinutes)) : 0,
  };
};

export const isAtomicTask = (type: string): boolean => {
  return type === 'quiz';
};

export const isDecomposableTask = (type: string): boolean => {
  return type !== 'quiz';
};
