import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCommunity } from '../../context/CommunityContext';
import { CommunityQuestion } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { Send, Pin, PinOff } from 'lucide-react';

// سؤال بانتظار الرد
const PendingQuestion: React.FC<{ q: CommunityQuestion }> = ({ q }) => {
  const { answerQuestion } = useCommunity();
  const { showToast } = useApp();
  const [answer, setAnswer] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    answerQuestion(q.id, answer.trim());
    showToast('تم نشر الرد، صار يظهر لكل الأعضاء');
  };

  return (
    <form onSubmit={submit} className="p-5 rounded-[22px] bg-white/[0.05] border border-white/[0.16] flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={q.authorAvatar} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{q.authorName}</span>
            <span className="text-[11px] text-white/50">{q.createdAt}</span>
          </div>
        </div>
        <StatusBadge tone="warning" pulse>بانتظار ردك</StatusBadge>
      </div>
      <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        placeholder="اكتب ردك، بيظهر قدام كل الأعضاء"
        className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/[0.1] p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40"
      />
      <button
        type="submit"
        disabled={!answer.trim()}
        className="white-glow-button self-end px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
      >
        <Send className="w-3.5 h-3.5" />
        نشر الرد
      </button>
    </form>
  );
};

// إدارة الأسئلة من جهة البراند
export const QuestionsManager: React.FC<{ brandName: string }> = ({ brandName }) => {
  const { questions, toggleFaq } = useCommunity();

  const mine = questions.filter((q) => q.brandName === brandName);
  const pending = mine.filter((q) => !q.answer);
  const answered = mine.filter((q) => q.answer).sort((a, b) => Number(b.isFaq) - Number(a.isFaq));

  return (
    <div className="flex flex-col gap-6">
      {/* بانتظار الرد */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white font-heading">بانتظار الرد ({pending.length})</h3>
        {pending.length > 0 ? (
          pending.map((q) => <PendingQuestion key={q.id} q={q} />)
        ) : (
          <div className="glass-panel rounded-[22px] py-10 text-center text-sm text-white/60">ما فيه أسئلة جديدة</div>
        )}
      </section>

      {/* المجاب عليها */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white font-heading">تم الرد ({answered.length})</h3>
        <p className="text-[11px] text-white/50 -mt-1">السؤال المكرر حوّله لـ"سؤال شائع" عشان يتثبت فوق.</p>
        {answered.map((q) => (
          <div key={q.id} className="p-4 rounded-[20px] bg-white/[0.04] border border-white/[0.1] flex items-start gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{q.authorName}</span>
                {q.isFaq && <StatusBadge tone="neutral">سؤال شائع</StatusBadge>}
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>
              <p className="text-xs text-white/70 leading-relaxed">{q.answer}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleFaq(q.id)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-[11px] text-white hover:bg-white/[0.12] transition-colors"
            >
              {q.isFaq ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              {q.isFaq ? 'إلغاء التثبيت' : 'سؤال شائع'}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default QuestionsManager;