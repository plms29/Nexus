'use client';
import { useTranslate, useLanguage } from '@/lib/i18n';
import React, { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';
import {
  Sparkles,
  Users,
  Calendar as CalendarIcon,
  Scissors,
  Shuffle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bot,
  Undo2,
} from 'lucide-react';
import type { StudentGroupPlan } from '@/lib/engine/types';
import { getClassRoster } from '@/lib/class-roster';
import { calculateLU } from '@/lib/engine/calculator';
import { splitIntoGroups, type GroupStep, type StepLike } from '@/lib/engine/group-planner';
import {
  buildOverloadSolutions,
  type PlanContext,
  type PlanEvaluation,
  type SolutionId,
} from '@/lib/engine/overload-solutions';
import { fill } from '@/lib/i18n/translate';

/** Sĩ số giả định khi lớp chưa có danh sách học sinh */
const DEFAULT_CLASS_SIZE = 40;

interface AiAdvice {
  recommended: SolutionId;
  headline: string;
  rationales: Record<SolutionId, string>;
}

interface OverloadSolutionsProps {
  /** Bước làm bài cá nhân gốc, chưa áp phương án nào */
  individualSteps: StepLike[];
  ctx: PlanContext;
  task: { title: string; subjectId: string; type: string; classId: string };
  /** Dạng bài chia nhỏ được mới cho phép chuyển sang làm nhóm */
  allowGroup: boolean;
  appliedGroup: StudentGroupPlan | null;
  onApplyGroup: (plan: StudentGroupPlan, steps: GroupStep[], deadline?: string) => void;
  onRevertGroup: () => void;
  onApplyDeadline: (deadline: string) => void;
  onApplyScope: (steps: { name: string; min: number; lu: number; dayOffset: number }[]) => void;
}

const fmtDate = (d: string) => format(parseISO(d), 'dd/MM');

export const OverloadSolutions: React.FC<OverloadSolutionsProps> = ({
  individualSteps,
  ctx,
  task,
  allowGroup,
  appliedGroup,
  onApplyGroup,
  onRevertGroup,
  onApplyDeadline,
  onApplyScope,
}) => {
  const tr = useTranslate();
  const lang = useLanguage(s => s.lang);
  const roster = getClassRoster(task.classId);
  const studentCount = roster?.students.length ?? DEFAULT_CLASS_SIZE;

  const solutions = useMemo(
    () => buildOverloadSolutions(individualSteps, ctx, studentCount),
    [individualSteps, ctx, studentCount]
  );

  const [groupSize, setGroupSize] = useState<number>(appliedGroup?.size ?? solutions.bestGroupSize);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [showGroups, setShowGroups] = useState(false);

  // Mỗi lần đổi cỡ nhóm hoặc bấm "Xáo lại" thì chia ngẫu nhiên lại cả lớp
  const groupPlan = useMemo<StudentGroupPlan | null>(() => {
    if (appliedGroup && appliedGroup.size === groupSize && shuffleKey === 0) return appliedGroup;
    return roster ? splitIntoGroups(roster.students, groupSize) : null;
  }, [roster, groupSize, shuffleKey, appliedGroup]);

  const selectedGroup = solutions.groupBySize.find(g => g.size === groupSize) ?? solutions.groupBySize[0];
  const groupNeedsDeadline = selectedGroup.evaluation.overloadedDates.length > 0;
  const groupDeadline = groupNeedsDeadline
    ? (selectedGroup.size === solutions.bestGroupSize ? solutions.groupWithDeadline?.deadline : undefined)
    : undefined;

  const individualLU = calculateLU(solutions.current.totalMinutes);

  // ---------- Lời giải thích dựng sẵn khi không gọi được Gemini ----------
  const statusText = (ev: PlanEvaluation) =>
    ev.resolvesAll
      ? tr('hết quá tải')
      : ev.overloadedDates.length > 0
        ? fill('vẫn quá tải ngày {dates}', { dates: ev.overloadedDates.map(fmtDate).join(', ') }, lang)
        : tr('hết quá tải ngày nhưng còn vượt quỹ 70/30');

  const ruleAdvice: AiAdvice = {
    recommended: solutions.recommended,
    headline: fill(
      'Bài "{title}" cần {lu} LU mỗi học sinh và đẩy Workmap lên {max} phút vào ngày {dates}. Hệ thống đã xếp thử 3 phương án trên lịch thật của lớp.',
      {
        title: tr(task.title),
        lu: individualLU,
        max: solutions.current.maxDayMinutes,
        dates: solutions.current.overloadedDates.map(fmtDate).join(', ') || '—',
      },
      lang
    ),
    rationales: {
      group: fill(
        'Mỗi học sinh vẫn tự đọc hiểu đề, chỉ viết phần được phân công rồi cùng họp và tập duyệt, nên tải giảm từ {before} xuống {after} LU mà cả lớp vẫn đạt đủ mục tiêu bài học.',
        { before: individualLU, after: calculateLU(selectedGroup.evaluation.totalMinutes) },
        lang
      ),
      deadline: tr('Giữ nguyên yêu cầu bài làm cá nhân, học sinh có thêm ngày trống để hoàn thành nhưng chương trình bộ môn lùi lại một chút.'),
      scope: tr('Rút ngắn độ dài bài và bớt luận điểm phụ: nhẹ nhất cho học sinh nhưng phải chấp nhận giảm độ sâu của sản phẩm.'),
    },
  };

  // ---------- Gemini viết lời khuyên dựa trên số liệu engine đã tính ----------
  const adviceKey = JSON.stringify([
    task.title, ctx.deadline, lang,
    solutions.current.totalMinutes, solutions.current.overloadedDates,
  ]);

  // Kết quả gắn với khoá của lần hỏi, khoá đổi thì tự coi như đang chờ câu trả lời mới
  const [aiResult, setAiResult] = useState<{ key: string; advice: AiAdvice | null } | null>(null);
  const aiAdvice = aiResult?.key === adviceKey ? aiResult.advice : null;
  const aiState: 'loading' | 'ready' | 'fallback' =
    aiResult?.key !== adviceKey ? 'loading' : aiAdvice ? 'ready' : 'fallback';

  useEffect(() => {
    let cancelled = false;

    const best = solutions.groupBySize.find(g => g.size === solutions.bestGroupSize)!;
    const options = [
      ...(allowGroup ? [{
        id: 'group' as const,
        title: tr('Chuyển sang làm nhóm'),
        facts: fill(
          'chia {count} nhóm tối đa {size} người, mỗi học sinh còn {after} LU thay vì {before} LU, ngày nặng nhất {max} phút',
          { count: best.groupCount, size: best.size, after: calculateLU(best.evaluation.totalMinutes), before: individualLU, max: best.evaluation.maxDayMinutes },
          'vi'
        ),
        resolvesAll: best.evaluation.resolvesAll,
      }] : []),
      ...(solutions.deadline ? [{
        id: 'deadline' as const,
        title: tr('Dời hạn nộp'),
        facts: `dời hạn sang ${solutions.deadline.deadline}, ngày nặng nhất ${solutions.deadline.evaluation.maxDayMinutes} phút`,
        resolvesAll: solutions.deadline.evaluation.resolvesAll,
      }] : []),
      {
        id: 'scope' as const,
        title: tr('Giảm phạm vi bài'),
        facts: `tổng thời lượng còn ${solutions.scope.evaluation.totalMinutes} phút thay vì ${solutions.current.totalMinutes} phút, ngày nặng nhất ${solutions.scope.evaluation.maxDayMinutes} phút`,
        resolvesAll: solutions.scope.evaluation.resolvesAll,
      },
    ];

    fetch('/api/overload-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang,
        task: { title: task.title, subject: task.subjectId, type: task.type, classId: task.classId, deadline: ctx.deadline },
        situation: `bài cần ${solutions.current.totalMinutes} phút mỗi học sinh, xếp vào lịch hiện tại thì ngày ${solutions.current.overloadedDates.join(', ') || '(không)'} vượt 150 phút (nặng nhất ${solutions.current.maxDayMinutes} phút)${solutions.current.quotaExceeded ? '; tuần còn vượt quỹ 70/30' : ''}.`,
        options,
        recommended: solutions.recommended,
      }),
    })
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: AiAdvice) => {
        if (!cancelled) setAiResult({ key: adviceKey, advice: data });
      })
      .catch(() => {
        if (!cancelled) setAiResult({ key: adviceKey, advice: null });
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adviceKey]);

  const advice: AiAdvice = aiState === 'ready' && aiAdvice
    ? {
        recommended: allowGroup || aiAdvice.recommended !== 'group' ? aiAdvice.recommended : solutions.recommended,
        headline: aiAdvice.headline || ruleAdvice.headline,
        rationales: {
          group: aiAdvice.rationales.group || ruleAdvice.rationales.group,
          deadline: aiAdvice.rationales.deadline || ruleAdvice.rationales.deadline,
          scope: aiAdvice.rationales.scope || ruleAdvice.rationales.scope,
        },
      }
    : ruleAdvice;

  const recommendedBadge = (id: SolutionId) =>
    advice.recommended === id && (
      <span className="text-[10px] font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 shrink-0">
        <Sparkles className="w-3 h-3" /> {tr('AI khuyên dùng')}
      </span>
    );

  const statusBadge = (ev: PlanEvaluation) => (
    <div className={clsx(
      'text-[11px] font-extrabold flex items-center gap-1.5',
      ev.resolvesAll ? 'text-emerald-700' : 'text-amber-700'
    )}>
      {ev.resolvesAll ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      {tr('Kết quả xếp thử:')} {statusText(ev)} • {tr('ngày nặng nhất')} {ev.maxDayMinutes} {tr('phút')}
    </div>
  );

  const cardClass = (id: SolutionId) => clsx(
    'bg-white rounded-2xl p-4 border shadow-2xs space-y-3 flex flex-col justify-between transition-all',
    advice.recommended === id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
  );

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-white to-rose-50/60 rounded-3xl p-5 border border-indigo-200/90 shadow-sm space-y-4 animate-in fade-in duration-300">
      {/* Header: tóm tắt của AI */}
      <div className="flex items-start gap-3 border-b border-indigo-100 pb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-slate-900 text-sm">{tr('AI Đề Xuất Phương Án Giảm Tải')}</h4>
            <span className={clsx(
              'text-[10px] font-extrabold px-2 py-0.5 rounded-md border',
              aiState === 'ready'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : aiState === 'loading'
                  ? 'bg-slate-50 text-slate-500 border-slate-200 animate-pulse'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
            )}>
              {aiState === 'ready'
                ? tr('Gemini đã phân tích')
                : aiState === 'loading'
                  ? tr('Gemini đang phân tích...')
                  : tr('Phân tích bằng engine ExamLoad')}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed">{advice.headline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs">
        {/* ---------- 1. Làm nhóm ---------- */}
        {allowGroup && (
          <div className={cardClass('group')}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  {tr('Chuyển sang làm nhóm')}
                </span>
                {recommendedBadge('group')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{advice.rationales.group}</p>

              {/* Chọn cỡ nhóm: mỗi lựa chọn đều đã được xếp thử trên lịch */}
              <div className="grid grid-cols-3 gap-2">
                {solutions.groupBySize.map(g => (
                  <button
                    key={g.size}
                    type="button"
                    onClick={() => { setGroupSize(g.size); setShuffleKey(k => k + 1); }}
                    className={clsx(
                      'rounded-xl border p-2 text-left transition-all cursor-pointer',
                      groupSize === g.size
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                    )}
                  >
                    <div className="font-black text-[12px]">{g.size} {tr('người/nhóm')}</div>
                    <div className={clsx('text-[10px] font-bold', groupSize === g.size ? 'text-indigo-100' : 'text-slate-500')}>
                      {g.groupCount} {tr('nhóm')} • {calculateLU(g.evaluation.totalMinutes)} {tr('LU/HS')}
                    </div>
                    <div className={clsx(
                      'text-[10px] font-extrabold mt-0.5',
                      groupSize === g.size
                        ? 'text-white'
                        : g.evaluation.overloadedDates.length === 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {g.evaluation.overloadedDates.length === 0 ? tr('✓ Không quá tải') : `✗ ${tr('Max')} ${g.evaluation.maxDayMinutes}′`}
                    </div>
                  </button>
                ))}
              </div>

              {/* Công thức LU mỗi thành viên */}
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-2.5 text-[11px] font-semibold text-indigo-950 leading-relaxed">
                {fill(
                  'LU mỗi thành viên (nhóm ít nhất {members} người) = Bắt buộc {mandatory} phút + Phần được phân công {shared} phút + Điều phối {coordination} phút = {total} phút ({lu} LU), giảm từ {before} LU khi làm cá nhân.',
                  {
                    members: selectedGroup.minMembers,
                    mandatory: selectedGroup.steps.filter(s => s.kind === 'mandatory').reduce((a, s) => a + s.min, 0),
                    shared: selectedGroup.steps.filter(s => s.kind === 'shared').reduce((a, s) => a + s.min, 0),
                    coordination: selectedGroup.steps.filter(s => s.kind === 'coordination').reduce((a, s) => a + s.min, 0),
                    total: selectedGroup.evaluation.totalMinutes,
                    lu: calculateLU(selectedGroup.evaluation.totalMinutes),
                    before: individualLU,
                  },
                  lang
                )}
              </div>

              {statusBadge(selectedGroup.evaluation)}
              {groupNeedsDeadline && groupDeadline && (
                <p className="text-[11px] font-bold text-amber-700">
                  {tr('Cần dời thêm hạn nộp sang')} {fmtDate(groupDeadline)} {tr('để hết quá tải.')}
                </p>
              )}

              {/* Danh sách nhóm ngẫu nhiên */}
              {groupPlan ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setShowGroups(v => !v)}
                      className="font-extrabold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      {showGroups ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {fill('{count} nhóm ngẫu nhiên từ {students} học sinh lớp {classId}', {
                        count: groupPlan.groups.length,
                        students: studentCount,
                        classId: task.classId,
                      }, lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShuffleKey(k => k + 1); setShowGroups(true); }}
                      className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3.5 h-3.5" /> {tr('Xáo lại')}
                    </button>
                  </div>
                  {showGroups && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 pt-0 max-h-64 overflow-y-auto">
                      {groupPlan.groups.map(g => (
                        <div key={g.name} className="bg-white rounded-lg border border-slate-200 p-2">
                          <div className="font-black text-indigo-700 text-[11px]">
                            {tr(g.name.replace(/\d+$/, '').trim())} {g.name.match(/\d+$/)?.[0]} • {g.members.length} {tr('người')}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 leading-snug">{g.members.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] font-semibold text-slate-500">
                  {tr('Lớp này chưa có danh sách học sinh nên chỉ tính LU theo cỡ nhóm, chưa chia tên.')}
                </p>
              )}
            </div>

            {appliedGroup && appliedGroup.size === groupSize && shuffleKey === 0 ? (
              <button
                type="button"
                onClick={onRevertGroup}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              >
                <Undo2 className="w-3.5 h-3.5" /> {tr('Quay lại làm cá nhân')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const plan = groupPlan ?? { size: groupSize, groups: [] };
                  onApplyGroup(plan, selectedGroup.steps, groupNeedsDeadline ? groupDeadline : undefined);
                  setShuffleKey(0);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                {fill('Áp dụng: chia {count} nhóm, mỗi HS {lu} LU', {
                  count: groupPlan?.groups.length ?? selectedGroup.groupCount,
                  lu: calculateLU(selectedGroup.evaluation.totalMinutes),
                }, lang)}
                {groupNeedsDeadline && groupDeadline ? ` + ${tr('hạn')} ${fmtDate(groupDeadline)}` : ''}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* ---------- 2. Dời hạn nộp ---------- */}
          <div className={cardClass('deadline')}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  {tr('Dời hạn nộp')}
                </span>
                {recommendedBadge('deadline')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{advice.rationales.deadline}</p>
              {solutions.deadline
                ? statusBadge(solutions.deadline.evaluation)
                : <p className="text-[11px] font-bold text-rose-700">{tr('Không tìm được hạn nộp an toàn trong 10 ngày tới.')}</p>}
            </div>
            {solutions.deadline && (
              <button
                type="button"
                onClick={() => onApplyDeadline(solutions.deadline!.deadline)}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                {tr('Đổi hạn nộp sang')} {format(parseISO(solutions.deadline.deadline), 'dd/MM/yyyy')}
              </button>
            )}
          </div>

          {/* ---------- 3. Giảm phạm vi ---------- */}
          <div className={cardClass('scope')}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-rose-600" />
                  {tr('Giảm phạm vi bài')}
                </span>
                {recommendedBadge('scope')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{advice.rationales.scope}</p>
              <p className="text-[11px] font-bold text-slate-700">
                {solutions.current.totalMinutes} → {solutions.scope.evaluation.totalMinutes} {tr('phút')}
                {' '}({individualLU} → {calculateLU(solutions.scope.evaluation.totalMinutes)} LU)
              </p>
              {statusBadge(solutions.scope.evaluation)}
            </div>
            <button
              type="button"
              onClick={() => onApplyScope(solutions.scope.steps)}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5" /> {tr('Áp dụng bản rút gọn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
