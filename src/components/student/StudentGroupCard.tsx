'use client';
import { useTranslate } from '@/lib/i18n';
import React, { useState } from 'react';
import clsx from 'clsx';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { StudentGroupPlan } from '@/lib/engine/types';
import { calculateLU } from '@/lib/engine/calculator';

/** So khớp tên không phân biệt hoa thường, khoảng trắng và dạng dấu (Thuỷ / Thủy) */
const normalizeName = (name: string) =>
  name.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

interface StudentGroupCardProps {
  plan: StudentGroupPlan;
  studentName: string;
  /** Tổng phút workmap của bài, với bài nhóm đây đã là phần việc của MỖI thành viên */
  memberMinutes: number;
}

/** Thẻ cho học sinh biết mình thuộc nhóm nào và mỗi thành viên phải gánh bao nhiêu LU */
export const StudentGroupCard: React.FC<StudentGroupCardProps> = ({ plan, studentName, memberMinutes }) => {
  const tr = useTranslate();
  const [showAll, setShowAll] = useState(false);

  const me = normalizeName(studentName || '');
  const myGroup = me ? plan.groups.find(g => g.members.some(m => normalizeName(m) === me)) : undefined;
  const groupLabel = (name: string) => `${tr('Nhóm')} ${name.match(/\d+$/)?.[0] ?? ''}`.trim();

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-black text-indigo-900 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {myGroup ? `${tr('Em thuộc')} ${groupLabel(myGroup.name)}` : tr('Bài làm nhóm')}
        </span>
        {memberMinutes > 0 && (
          <span className="font-extrabold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-lg">
            {calculateLU(memberMinutes)} {tr('LU/thành viên')}
          </span>
        )}
      </div>

      {myGroup ? (
        <div className="flex flex-wrap gap-1">
          {myGroup.members.map(m => (
            <span
              key={m}
              className={clsx(
                'px-2 py-0.5 rounded-md font-bold border',
                normalizeName(m) === me
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200'
              )}
            >
              {m}
            </span>
          ))}
        </div>
      ) : (
        <p className="font-semibold text-slate-600">
          {tr('Chưa tìm thấy tên em trong danh sách nhóm, hãy hỏi giáo viên bộ môn.')}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowAll(v => !v)}
        className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
      >
        {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {tr('Xem cả')} {plan.groups.length} {tr('nhóm của lớp')}
      </button>

      {showAll && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {plan.groups.map(g => (
            <div key={g.name} className="text-[11px] text-slate-600 leading-snug">
              <strong className="text-slate-800">{groupLabel(g.name)}:</strong> {g.members.join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
