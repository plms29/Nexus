import { TaskType } from './types';

export interface TemplateStep {
  name: string;
  min: number;
  /** Số ngày kể từ ngày bắt đầu, dùng làm gợi ý phân bổ */
  dayOffset: number;
}

/** Họp nhóm phân chia công việc và rà soát */
export const GROUP_MEETING_MINUTES = 15;
/** Tập duyệt trình bày sản phẩm */
export const GROUP_REHEARSAL_MINUTES = 30;

/**
 * Các dạng bài được phép giao, kèm nhãn tiếng Việt và khả năng chia nhỏ.
 * Theo tài liệu: quiz, sơ đồ tư duy 1-2 bài và biểu đồ nên làm gọn trong một ngày;
 * essay, sơ đồ tư duy cả chương và presentation thì tách nhiều bước.
 */
export const TASK_TYPE_OPTIONS: {
  value: TaskType;
  label: string;
  decomposable: boolean;
  groupOnly?: boolean;
}[] = [
  { value: 'quiz', label: 'Trắc nghiệm (nguyên khối)', decomposable: false },
  { value: 'short_exercise', label: 'Tự luận (nguyên khối)', decomposable: false },
  { value: 'chart', label: 'Vẽ biểu đồ', decomposable: true },
  { value: 'mindmap_short', label: 'Sơ đồ tư duy (1-2 bài)', decomposable: false },
  { value: 'mindmap_long', label: 'Sơ đồ tư duy (cả chương)', decomposable: true },
  { value: 'essay', label: 'Bài luận Essay', decomposable: true },
  { value: 'presentation_individual', label: 'Thuyết trình cá nhân', decomposable: true },
  { value: 'presentation_group', label: 'Thuyết trình nhóm', decomposable: true, groupOnly: true },
  { value: 'project', label: 'Dự án', decomposable: true },
];

export const isDecomposableType = (type: TaskType): boolean =>
  TASK_TYPE_OPTIONS.find(o => o.value === type)?.decomposable ?? true;

export const getTaskTypeLabel = (type: TaskType): string =>
  TASK_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;

/** Sơ đồ tư duy 1-2 bài: định mức 60 phút theo tài liệu, làm gọn trong một ngày */
const MINDMAP_SHORT_STEPS: TemplateStep[] = [
  { name: 'Đọc lại bài/chương và xem vở ghi', min: 10, dayOffset: 0 },
  { name: 'Chọn lọc thông tin, rút ý chính', min: 15, dayOffset: 0 },
  { name: 'Chia nhánh và sắp xếp theo cấu trúc', min: 15, dayOffset: 0 },
  { name: 'Vẽ sơ đồ tư duy', min: 15, dayOffset: 0 },
  { name: 'Kiểm tra lại', min: 5, dayOffset: 0 },
];

/** Sơ đồ tư duy cả chương: cùng các bước nhưng khối lượng lớn hơn, trải nhiều ngày */
const MINDMAP_LONG_STEPS: TemplateStep[] = [
  { name: 'Đọc lại toàn bộ chương và hệ thống vở ghi', min: 30, dayOffset: 0 },
  { name: 'Chọn lọc thông tin, rút ý chính từng bài', min: 35, dayOffset: 1 },
  { name: 'Chia nhánh và sắp xếp cấu trúc tổng thể', min: 30, dayOffset: 2 },
  { name: 'Vẽ sơ đồ tư duy hoàn chỉnh', min: 40, dayOffset: 3 },
  { name: 'Rà soát, bổ sung liên kết giữa các nhánh', min: 15, dayOffset: 4 },
];

/** Thuyết trình cá nhân: phần việc bắt buộc mỗi cá nhân phải tự làm */
const PRESENTATION_INDIVIDUAL_STEPS: TemplateStep[] = [
  { name: 'Đọc hiểu đề, xác định phạm vi và mục tiêu trình bày', min: 15, dayOffset: 0 },
  { name: 'Tra cứu tài liệu và chọn lọc dẫn chứng', min: 30, dayOffset: 1 },
  { name: 'Xây dựng dàn ý và nội dung slide', min: 30, dayOffset: 2 },
  { name: 'Thiết kế slide và hình ảnh minh hoạ', min: 30, dayOffset: 3 },
  { name: 'Tổng hợp nguồn tham khảo', min: 10, dayOffset: 3 },
  { name: 'Luyện nói và bấm giờ phần trình bày', min: 25, dayOffset: 4 },
];

/** Biểu đồ: định mức 28 phút theo tài liệu, gọn trong một ngày */
const CHART_STEPS: TemplateStep[] = [
  { name: 'Đọc bảng số liệu, xác định dạng biểu đồ', min: 5, dayOffset: 0 },
  { name: 'Xử lý số liệu và tính tỉ lệ', min: 5, dayOffset: 0 },
  { name: 'Vẽ biểu đồ', min: 10, dayOffset: 0 },
  { name: 'Nhận xét xu hướng', min: 5, dayOffset: 0 },
  { name: 'Kiểm tra chú thích, đơn vị, tên biểu đồ', min: 3, dayOffset: 0 },
];

const ESSAY_STEPS: TemplateStep[] = [
  { name: 'Đọc hiểu đề và xác định phạm vi nội dung', min: 15, dayOffset: 0 },
  { name: 'Tra cứu thông tin và kiểm tra tính xác thực', min: 20, dayOffset: 1 },
  { name: 'Xác định từ khoá, ý chính và luận điểm', min: 10, dayOffset: 1 },
  { name: 'Lập dàn ý chi tiết', min: 10, dayOffset: 2 },
  { name: 'Viết essay', min: 45, dayOffset: 3 },
  { name: 'Đọc lại, chỉnh sửa và hoàn thiện', min: 10, dayOffset: 4 },
  { name: 'Tổng hợp tài liệu tham khảo', min: 5, dayOffset: 4 },
];

const PROJECT_STEPS: TemplateStep[] = [
  { name: 'Lên kế hoạch dự án và phân công mục tiêu', min: 30, dayOffset: 0 },
  { name: 'Thu thập dữ liệu và tài liệu nghiên cứu', min: 60, dayOffset: 1 },
  { name: 'Thực hiện và tổng hợp sản phẩm', min: 90, dayOffset: 3 },
  { name: 'Hoàn thiện và chuẩn bị báo cáo', min: 30, dayOffset: 4 },
];

const STEPS_BY_TYPE: Partial<Record<TaskType, TemplateStep[]>> = {
  chart: CHART_STEPS,
  essay: ESSAY_STEPS,
  project: PROJECT_STEPS,
  mindmap_short: MINDMAP_SHORT_STEPS,
  mindmap_long: MINDMAP_LONG_STEPS,
  presentation_individual: PRESENTATION_INDIVIDUAL_STEPS,
  presentation_group: PRESENTATION_INDIVIDUAL_STEPS,
};

/**
 * Bộ bước mặc định cho một dạng bài, đã áp công thức làm nhóm nếu cần.
 *
 * Công thức nhóm theo tài liệu:
 *   LU mỗi thành viên = Mandatory Individual LU + Coordination LU
 * Mandatory là phần việc thiết yếu ai cũng phải tự làm (nghiên cứu, viết phần mình
 * phụ trách, chuẩn bị phần nói). Coordination là họp phân công 15 phút và tập duyệt 30 phút.
 *
 * @param type Dạng bài
 * @param isGroup Bài làm nhóm
 */
export const getTemplateSteps = (type: TaskType, isGroup: boolean): TemplateStep[] => {
  const baseSteps = STEPS_BY_TYPE[type] ?? ESSAY_STEPS;
  if (!isGroup) return [...baseSteps];

  const lastOffset = baseSteps.reduce((max, s) => Math.max(max, s.dayOffset), 0);

  return [
    { name: `Họp nhóm phân chia công việc và rà soát`, min: GROUP_MEETING_MINUTES, dayOffset: 0 },
    ...baseSteps.map(s => ({ ...s, dayOffset: s.dayOffset + 1 })),
    { name: `Tập duyệt trình bày sản phẩm cùng nhóm`, min: GROUP_REHEARSAL_MINUTES, dayOffset: lastOffset + 2 },
  ];
};

/** Tổng số phút của bộ bước */
export const getTemplateTotalMinutes = (type: TaskType, isGroup: boolean): number =>
  getTemplateSteps(type, isGroup).reduce((sum, s) => sum + s.min, 0);
