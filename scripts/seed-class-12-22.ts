/**
 * Dựng lại lịch bài tập demo của lớp 12/22 (ban tự nhiên, 51 học sinh) từ CN 06/09 đến T6 18/09/2026.
 *
 * Chạy lại trước mỗi buổi trình bày để xoá bài giao thử và đưa Workmap về trạng thái ban đầu:
 *   npm run seed:12-22
 *
 * Script XOÁ mọi bài của lớp 12/22 có hạn nộp từ 05/09 đến 19/09 (kèm mục workmap của chúng)
 * rồi giao lại 29 bài của 8 môn. Nhật ký ghi đè (audit_logs) không bị đụng tới.
 *
 * Mục tiêu khi thiết kế số phút:
 * - Hai tuần ~78% quỹ 25 LU (tuần 07-13/09: 19.5 LU, tuần 14-18/09: 18.5 LU).
 * - T2-T4 (07-09/09) mỗi ngày 115/150 phút, chỉ còn 35 phút trống. Bài luận Ngữ văn
 *   giao trực tiếp lúc demo (07/09 -> 09/09, ~115 phút) sẽ vượt 5 LU/ngày,
 *   còn chuyển sang làm nhóm (5 người) thì vừa khít.
 * - Môn xã hội tuần đầu chỉ 3 LU để phần cảnh báo tập trung vào quá tải theo ngày.
 *
 * Mỗi bài: [môn, giáo viên, dạng bài, tên bài, hạn nộp, [[ngày, phút, tên bước], ...]]
 * teacher = null nghĩa là bài của chính tài khoản teacher@school.com (GV Ngữ văn).
 */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { getClassRoster } from '../src/lib/class-roster';
import { splitIntoGroups } from '../src/lib/engine/group-planner';
import { getSubjectGroup } from '../src/lib/engine/subject-group';

const CLASS_ID = '12/22';
/** Khoảng hạn nộp bị xoá trước khi seed, rộng hơn lịch một ngày mỗi đầu để dọn cả dữ liệu cũ */
const RESET_FROM = '2026-09-05';
const RESET_TO = '2026-09-19';

type Entry = [date: string, minutes: number, stepName: string];
type ScheduledTask = [
  subject: string,
  teacher: string | null,
  type: string,
  title: string,
  deadline: string,
  entries: Entry[],
];

const T = {
  toan: 'Lê Văn Phúc',
  ly: 'Trần Thị Mai',
  hoa: 'Phạm Quốc Bảo',
  sinh: 'Võ Thị Hạnh',
  tin: 'Đặng Minh Tuấn',
  anh: 'Nguyễn Hoàng Anh',
  su: 'Huỳnh Văn Sơn',
};

const SCHEDULE: ScheduledTask[] = [
  // ---------- CN 06/09 ----------
  ['Tin học', T.tin, 'short_exercise', 'Bài tập lập trình Python: cấu trúc lặp', '2026-09-07',
    [['2026-09-06', 30, 'Viết và chạy thử 5 bài tập vòng lặp']]],

  // ---------- Tuần 07/09 - 13/09 ----------
  ['Toán', T.toan, 'short_exercise', 'Bài tập Khảo sát hàm số', '2026-09-08',
    [['2026-09-07', 45, 'Lập bảng biến thiên cho 4 hàm số']]],
  ['Vật lý', T.ly, 'short_exercise', 'Bài tập Dao động điều hòa', '2026-09-08',
    [['2026-09-07', 40, 'Giải bài tập phương trình dao động']]],
  ['Tiếng Anh', T.anh, 'short_exercise', 'Unit 2 - Urbanisation: bài tập từ vựng', '2026-09-08',
    [['2026-09-07', 30, 'Làm bài tập từ vựng Unit 2']]],

  ['Hóa học', T.hoa, 'short_exercise', 'Bài tập Este - Lipit', '2026-09-09',
    [['2026-09-08', 45, 'Bài tập danh pháp và tính chất của este']]],
  ['Sinh học', T.sinh, 'short_exercise', 'Bài tập quy luật di truyền Menđen', '2026-09-09',
    [['2026-09-08', 40, 'Giải bài tập lai một và hai cặp tính trạng']]],
  ['Tin học', T.tin, 'short_exercise', 'Bài tập Python: danh sách và chuỗi', '2026-09-09',
    [['2026-09-08', 30, 'Viết và chạy thử 4 bài tập']]],

  ['Toán', T.toan, 'short_exercise', 'Bài tập Hàm số mũ và logarit', '2026-09-10',
    [['2026-09-09', 25, 'Giải bài tập phương trình mũ']]],
  ['Lịch sử', T.su, 'mindmap_short', 'Sơ đồ tư duy: Cách mạng tháng Tám năm 1945', '2026-09-10',
    [['2026-09-09', 60, 'Vẽ sơ đồ tư duy']]],
  ['Vật lý', T.ly, 'presentation_group', 'Thuyết trình nhóm: Ứng dụng của sóng âm trong đời sống', '2026-09-12',
    [
      ['2026-09-09', 15, 'Họp nhóm phân chia công việc và rà soát'],
      ['2026-09-09', 15, 'Tra cứu tài liệu và chọn lọc dẫn chứng'],
      ['2026-09-10', 30, 'Thiết kế slide và hình ảnh minh hoạ'],
      ['2026-09-11', 30, 'Tập duyệt trình bày sản phẩm cùng nhóm'],
    ]],

  ['Hóa học', T.hoa, 'short_exercise', 'Bài tập Polime', '2026-09-11',
    [['2026-09-10', 30, 'Bài tập điều chế và tính chất polime']]],
  ['Sinh học', T.sinh, 'short_exercise', 'Bài tập di truyền quần thể', '2026-09-11',
    [['2026-09-10', 30, 'Giải bài tập cân bằng Hacđi - Vanbec']]],
  ['Tin học', T.tin, 'short_exercise', 'Bài tập Python cơ bản', '2026-09-11',
    [['2026-09-10', 30, 'Viết 3 chương trình nhỏ']]],

  ['Toán', T.toan, 'short_exercise', 'Bài tập Nguyên hàm', '2026-09-12',
    [['2026-09-11', 60, 'Làm 10 bài nguyên hàm cơ bản']]],

  ['Sinh học', T.sinh, 'short_exercise', 'Bài tập chương Tiến hóa', '2026-09-14',
    [['2026-09-12', 30, 'Trả lời câu hỏi về bằng chứng tiến hóa']]],

  // ---------- Tuần 14/09 - 18/09 ----------
  ['Toán', T.toan, 'short_exercise', 'Bài tập Tích phân', '2026-09-15',
    [['2026-09-14', 50, 'Làm 8 bài tích phân cơ bản']]],
  ['Vật lý', T.ly, 'short_exercise', 'Bài tập Sóng cơ và sóng âm', '2026-09-15',
    [['2026-09-14', 35, 'Giải bài tập giao thoa sóng']]],
  ['Tiếng Anh', T.anh, 'short_exercise', 'Writing task: A letter of application', '2026-09-15',
    [['2026-09-14', 30, 'Viết thư xin việc theo dàn ý mẫu']]],

  ['Ngữ văn', null, 'short_exercise', 'Đọc hiểu: Ai đã đặt tên cho dòng sông?', '2026-09-16',
    [['2026-09-15', 45, 'Đọc văn bản và trả lời câu hỏi đọc hiểu']]],
  ['Hóa học', T.hoa, 'short_exercise', 'Bài tập Amin - Amino axit', '2026-09-16',
    [['2026-09-15', 40, 'Bài toán hỗn hợp amino axit']]],
  ['Sinh học', T.sinh, 'short_exercise', 'Bài tập Sinh thái học', '2026-09-16',
    [['2026-09-15', 35, 'Trả lời câu hỏi về quần xã sinh vật']]],

  ['Tin học', T.tin, 'short_exercise', 'Bài tập Python: hàm và thư viện', '2026-09-17',
    [['2026-09-16', 40, 'Viết và chạy thử 4 bài tập']]],
  ['Toán', T.toan, 'short_exercise', 'Đề cương ôn tập giữa kỳ I - phần Đại số', '2026-09-17',
    [['2026-09-16', 25, 'Hoàn thành 15 câu trong đề cương']]],
  ['Lịch sử', T.su, 'mindmap_short', 'Sơ đồ tư duy: Việt Nam giai đoạn 1945 - 1954', '2026-09-17',
    [['2026-09-16', 45, 'Vẽ sơ đồ tư duy']]],

  ['Vật lý', T.ly, 'short_exercise', 'Bài tập Điện xoay chiều', '2026-09-18',
    [['2026-09-17', 45, 'Giải bài tập mạch RLC nối tiếp']]],
  ['Hóa học', T.hoa, 'short_exercise', 'Đề cương ôn tập Hóa học giữa kỳ I', '2026-09-18',
    [['2026-09-17', 40, 'Hoàn thành 20 câu trong đề cương']]],
  ['Toán', T.toan, 'short_exercise', 'Đề cương ôn tập giữa kỳ I - phần Giải tích', '2026-09-18',
    [['2026-09-17', 35, 'Hoàn thành 20 câu trong đề cương']]],

  ['Sinh học', T.sinh, 'short_exercise', 'Ôn tập giữa kỳ I: Di truyền học', '2026-09-18',
    [['2026-09-18', 45, 'Hệ thống lại các dạng bài di truyền']]],
  ['Tin học', T.tin, 'short_exercise', 'Bài tập Python: tệp và xử lý dữ liệu', '2026-09-18',
    [['2026-09-18', 45, 'Đọc, ghi tệp và thống kê dữ liệu']]],
];

/** PRNG cố định để mỗi lần seed ra cùng một cách chia nhóm cho bài thuyết trình Vật lý */
const seededRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

async function main() {
  process.loadEnvFile('.env.local');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local');
  const supabase = createClient(url, key);

  const roster = getClassRoster(CLASS_ID);
  if (!roster) throw new Error(`Chưa có danh sách lớp ${CLASS_ID}`);

  const { data: oldTasks, error: findError } = await supabase
    .from('tasks')
    .select('id')
    .eq('class_id', CLASS_ID)
    .gte('deadline', RESET_FROM)
    .lte('deadline', RESET_TO);
  if (findError) throw findError;

  const oldIds = (oldTasks ?? []).map(t => t.id);
  if (oldIds.length > 0) {
    // Xoá mục workmap trước phòng khi khoá ngoại chưa đặt ON DELETE CASCADE
    const { error: wmError } = await supabase.from('workmap_entries').delete().in('task_id', oldIds);
    if (wmError) throw wmError;
    const { error: delError } = await supabase.from('tasks').delete().in('id', oldIds);
    if (delError) throw delError;
  }
  console.log(`Đã xoá ${oldIds.length} bài cũ của lớp ${CLASS_ID} (hạn nộp ${RESET_FROM} → ${RESET_TO}).`);

  let hasNewColumns = true;
  let totalMinutes = 0;

  for (const [subject, teacher, type, title, deadline, entries] of SCHEDULE) {
    const isGroup = type === 'presentation_group';
    const task: Record<string, unknown> = {
      id: randomUUID(),
      title,
      type,
      class_id: CLASS_ID,
      subject_id: subject,
      deadline,
      is_group: isGroup,
      teacher_name: teacher,
      student_groups: isGroup ? splitIntoGroups(roster.students, 5, seededRandom(1222)) : null,
    };

    let { error } = await supabase.from('tasks').insert(hasNewColumns ? task : stripNewColumns(task));
    if (error && hasNewColumns && /column|schema cache/i.test(error.message)) {
      console.warn('⚠ Bảng tasks chưa có cột teacher_name/student_groups — hãy chạy migration mới. Tạm seed không kèm hai cột này.');
      hasNewColumns = false;
      ({ error } = await supabase.from('tasks').insert(stripNewColumns(task)));
    }
    if (error) throw new Error(`Không tạo được bài "${title}": ${error.message}`);

    const { error: entryError } = await supabase.from('workmap_entries').insert(
      entries.map(([date, minutes, stepName]) => ({
        task_id: task.id,
        date,
        minutes,
        lu: minutes / 30,
        subject_group: getSubjectGroup(subject),
        step_name: stepName,
      }))
    );
    if (entryError) throw new Error(`Không xếp được lịch cho "${title}": ${entryError.message}`);
    totalMinutes += entries.reduce((sum, [, minutes]) => sum + minutes, 0);
  }

  const subjects = new Set(SCHEDULE.map(([subject]) => subject));
  console.log(`Đã giao ${SCHEDULE.length} bài, ${subjects.size} môn (${[...subjects].join(', ')}), tổng ${totalMinutes / 30} LU.`);
}

function stripNewColumns(task: Record<string, unknown>) {
  const { teacher_name: _t, student_groups: _g, ...rest } = task;
  return rest;
}

main().catch(err => {
  console.error('Seed thất bại:', err.message ?? err);
  process.exit(1);
});
