'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export const InterventionModal = () => {
  const { overloadAlert, interventionProposal, clearAlert, addWorkmapEntry, addTask, addAuditLog } = useStore();
  const [overrideReason, setOverrideReason] = useState('');

  if (!overloadAlert || !interventionProposal) return null;

  const handleApplyRecommendation = () => {
    // TBD: Apply the recommendation
    clearAlert();
  };

  const handleOverride = () => {
    if (!overrideReason.trim()) {
      alert("You must provide a reason to override.");
      return;
    }
    
    addAuditLog({
      timestamp: new Date().toISOString(),
      task_id: overloadAlert.task.title,
      teacher_id: 'current-teacher',
      reason: overrideReason,
      severity: overloadAlert.current_lu > 30 ? 'critical' : 'soft'
    });
    
    addTask(overloadAlert.task);
    addWorkmapEntry({
      date: overloadAlert.date,
      task_id: overloadAlert.task.id,
      step_name: overloadAlert.task.title,
      minutes: overloadAlert.new_minutes,
      lu: overloadAlert.new_minutes / 30,
      subject_group: 'natural'
    });
    
    clearAlert();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-card max-w-md w-full rounded-3xl overflow-hidden shadow-2xl shadow-destructive/20 border border-white/70 animate-in zoom-in-95 duration-300 bg-white/80 backdrop-blur-xl">
        
        <div className="bg-destructive/10 p-6 flex items-start gap-4 border-b border-destructive/20">
          <div className="p-3 bg-destructive rounded-2xl text-white shadow-lg shadow-destructive/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-destructive tracking-tight">Phát Hiện Quá Tải</h3>
            <p className="text-sm font-semibold mt-1 text-destructive/80">
              Thêm bài tập này sẽ dẫn đến <span className="font-bold">{overloadAlert.current_lu + overloadAlert.new_minutes / 30} LU</span> vào ngày {overloadAlert.date}.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white/50 backdrop-blur rounded-2xl p-5 border border-white/60 shadow-sm">
            <h4 className="font-bold text-foreground/80 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Đề xuất từ AI
            </h4>
            <p className="text-sm font-medium text-foreground/70">
              Chiến lược: <span className="font-bold text-primary">{interventionProposal.strategy}</span>
            </p>
            {interventionProposal.suggestions && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {interventionProposal.suggestions.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-lg border border-primary/20">
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Lý do ép buộc giao (Override)
            </label>
            <textarea
              className="w-full border-0 bg-black/5 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-destructive/50 focus:outline-none transition-shadow shadow-inner resize-none h-24 placeholder:text-foreground/30"
              placeholder="Tại sao bắt buộc phải giao vào ngày này dù đã quá tải?"
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
            />
          </div>
        </div>
        
        <div className="p-6 bg-white/20 border-t border-white/40 flex gap-4 justify-end">
          <button 
            onClick={clearAlert}
            className="px-5 py-2.5 rounded-xl font-bold text-foreground/60 hover:bg-black/5 hover:text-foreground transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleOverride}
            className="px-5 py-2.5 rounded-xl font-bold bg-white text-destructive border border-destructive/20 shadow-sm hover:bg-destructive/5 transition-colors"
          >
            Ép Giao (Force Assign)
          </button>
          <button 
            onClick={handleApplyRecommendation}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            Áp Dụng Đề Xuất
          </button>
        </div>
      </div>
    </div>
  );
};
