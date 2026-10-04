import type { StudentGroupPlan } from './types';
import { GROUP_MEETING_MINUTES, GROUP_REHEARSAL_MINUTES } from './task-templates';

/** Các cỡ nhóm giáo viên được chọn khi chuyển bài sang làm nhóm */
export const GROUP_SIZE_OPTIONS = [4, 5, 6];

export const GROUP_MEETING_STEP_NAME = 'Họp nhóm phân chia công việc và rà soát';
export const GROUP_REHEARSAL_STEP_NAME = 'Tập duyệt trình bày sản phẩm cùng nhóm';

/** Hậu tố gắn vào bước được chia đều cho các thành viên */
export const SHARED_STEP_SUFFIX = ' (phần được phân công)';

/**
 * Việc mỗi thành viên vẫn phải tự làm trọn vẹn dù làm nhóm: đọc hiểu đề và xác định
 * phạm vi. Research, viết và tổng hợp nguồn thì theo tài liệu là cho "phần phụ trách"
 * của từng người, nên được chia đều.
 */
const MANDATORY_STEP_PATTERN =
  /(đọc hiểu|đọc kỹ|đọc đề|tìm hiểu đề|xác định (yêu cầu|phạm vi)|understand|read the prompt)/i;

export interface StepLike {
  name: string;
  min: number;
}

export interface GroupStep extends StepLike {
  lu: number;
  dayOffset: number;
  /** mandatory: tự làm trọn vẹn, shared: chia đều, coordination: họp và tập duyệt */
  kind: 'mandatory' | 'shared' | 'coordination';
}

/**
 * Chia học sinh thành các nhóm ngẫu nhiên, không nhóm nào vượt quá `size` người.
 * Số nhóm = ceil(sĩ số / size); học sinh được rải vòng tròn sau khi xáo nên các nhóm
 * chênh nhau nhiều nhất 1 người.
 */
export const splitIntoGroups = (
  students: string[],
  size: number,
  random: () => number = Math.random
): StudentGroupPlan => {
  const shuffled = [...students];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const groupCount = Math.max(1, Math.ceil(shuffled.length / size));
  const groups = Array.from({ length: groupCount }, (_, i) => ({
    name: `Nhóm ${i + 1}`,
    members: [] as string[],
  }));
  shuffled.forEach((student, i) => groups[i % groupCount].members.push(student));

  return { size, groups };
};

/**
 * Số thành viên của nhóm ít người nhất. Nhóm này gánh nhiều việc nhất trên mỗi người,
 * nên LU mỗi thành viên được tính theo nhóm này để không đánh giá thấp tải.
 */
export const smallestGroupSize = (studentCount: number, size: number) => {
  const groupCount = Math.max(1, Math.ceil(studentCount / size));
  return Math.max(1, Math.floor(studentCount / groupCount));
};

/** Bước có phải việc thiết yếu mỗi thành viên phải tự làm trọn vẹn hay không */
export const isMandatoryStep = (name: string, index: number) =>
  index === 0 || MANDATORY_STEP_PATTERN.test(name);

/**
 * Quy đổi các bước làm CÁ NHÂN thành phần việc của MỖI THÀNH VIÊN khi làm nhóm.
 *
 * Công thức theo tài liệu: LU mỗi thành viên = Mandatory Individual LU + Coordination LU
 * - Mandatory: đọc hiểu đề, xác định phạm vi (bước đầu tiên) làm trọn vẹn; research, viết
 *   và tổng hợp nguồn cho phần phụ trách thì chia đều cho số thành viên.
 * - Coordination: họp phân công 15 phút ở đầu và tập duyệt 30 phút ở cuối.
 *
 * @param individualSteps Bước làm bài cá nhân, chưa có phần điều phối nhóm
 * @param memberCount Số thành viên của nhóm ít người nhất
 */
export const toGroupSteps = (individualSteps: StepLike[], memberCount: number): GroupStep[] => {
  const members = Math.max(1, memberCount);

  const converted: GroupStep[] = individualSteps.map((s, i) => {
    const mandatory = isMandatoryStep(s.name, i);
    const min = mandatory ? s.min : Math.max(5, Math.ceil(s.min / members));
    return {
      name: mandatory ? s.name : s.name + SHARED_STEP_SUFFIX,
      min,
      lu: min / 30,
      dayOffset: i + 1,
      kind: mandatory ? 'mandatory' : 'shared',
    };
  });

  return [
    {
      name: GROUP_MEETING_STEP_NAME,
      min: GROUP_MEETING_MINUTES,
      lu: GROUP_MEETING_MINUTES / 30,
      dayOffset: 0,
      kind: 'coordination',
    },
    ...converted,
    {
      name: GROUP_REHEARSAL_STEP_NAME,
      min: GROUP_REHEARSAL_MINUTES,
      lu: GROUP_REHEARSAL_MINUTES / 30,
      dayOffset: converted.length + 1,
      kind: 'coordination',
    },
  ];
};

/**
 * Thu gọn phạm vi bài: giữ nguyên bước thiết yếu, các bước còn lại còn ~60% thời lượng
 * (ví dụ bài luận 600 chữ còn 350-400 chữ, bớt một luận điểm phụ).
 */
export const SCOPE_REDUCTION_RATIO = 0.6;

export const toReducedScopeSteps = (individualSteps: StepLike[]) =>
  individualSteps.map((s, i) => {
    const min = isMandatoryStep(s.name, i)
      ? s.min
      : Math.max(5, Math.round((s.min * SCOPE_REDUCTION_RATIO) / 5) * 5);
    return { name: s.name, min, lu: min / 30, dayOffset: i };
  });
