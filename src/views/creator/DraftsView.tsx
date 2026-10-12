import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DraftStatus } from '../../types';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  FileEdit, 
  MessageSquare, 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Film
} from 'lucide-react';

export const DraftsView: React.FC = () => {
  const { drafts, setIsUploadDraftModalOpen, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<DraftStatus | 'all'>('all');
  const [activeDraftId, setActiveDraftId] = useState<string>(drafts[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  const filteredDrafts = drafts.filter((d) => {
    if (activeTab !== 'all' && d.status !== activeTab) return false;
    return true;
  });

  const selectedDraft = drafts.find(d => d.id === activeDraftId) || drafts[0];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDraft) return;

    selectedDraft.chatMessages.push({
      sender: 'creator',
      senderName: 'نورة الدوسري',
      message: replyText,
      time: 'الآن',
    });
    setReplyText('');
    showToast('تم إرسال رسالتك إلى فريق مراجعة البراند');
  };

  const getStatusBadge = (status: DraftStatus) => {
    switch (status) {
      case 'needs_edit': return <StatusBadge tone="warning" pulse>تحتاج تعديل</StatusBadge>;
      case 'pending':    return <StatusBadge tone="warning">تنتظر المراجعة</StatusBadge>;
      case 'approved':   return <StatusBadge tone="success">مقبولة للنشر</StatusBadge>;
      case 'published':  return <StatusBadge tone="neutral">منشورة</StatusBadge>;
      case 'rejected':   return <StatusBadge tone="danger">مرفوضة</StatusBadge>;
      default:           return null;
    }
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-heading">المسودات والموافقة المسبقة</h1>
            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold shadow-[0_0_8px_rgba(255,255,255,0.6)]">
              جديد
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">
            ارفع مسودات الفيديوهات وناقش التعديلات مع البراند مباشرة قبل النشر النهائي
          </p>
        </div>

        <button
          onClick={() => setIsUploadDraftModalOpen(true)}
          className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_16px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>+ رفع مسودة جديدة</span>
        </button>
      </div>

      {/* Status Tabs: تحتاج تعديل / تنتظر / مقبولة / منشورة / مرفوضة */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'needs_edit', label: 'تحتاج تعديل' },
          { id: 'pending', label: 'تنتظر' },
          { id: 'approved', label: 'مقبولة' },
          { id: 'published', label: 'منشورة' },
          { id: 'rejected', label: 'مرفوضة' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeTab === tab.id
                ? 'bg-white text-black border-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Split View: Left List of Drafts + Right Chat & Video Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* List of Drafts (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              onClick={() => setActiveDraftId(draft.id)}
              className={`p-4 rounded-[22px] border transition-all cursor-pointer flex flex-col gap-3 ${
                activeDraftId === draft.id
                  ? 'bg-white/[0.09] border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.08)]'
                  : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={draft.platform} size={13} />
                  <span className="text-xs font-semibold text-white/60">{draft.brandName}</span>
                </div>
                {getStatusBadge(draft.status)}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={draft.thumbnail}
                  alt={draft.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 grayscale hover:grayscale-0 transition-all"
                />
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{draft.title}</h3>
                  <p className="text-[11px] text-[#A3A3A3] line-clamp-1 mt-0.5">{draft.notes}</p>
                  <span className="text-[10px] text-white/40 mt-1">{draft.submittedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Draft Details & Chat Thread (7 cols) */}
        {selectedDraft && (
          <div className="lg:col-span-7 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.14] p-6 flex flex-col gap-5">
            {/* Top header of selected draft */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs text-[#A3A3A3]">{selectedDraft.campaignTitle}</span>
                <h2 className="text-base font-bold text-white font-heading mt-0.5">{selectedDraft.title}</h2>
              </div>
              <button
                onClick={() => setIsUploadDraftModalOpen(true)}
                className="py-2 px-4 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all"
              >
                ارفع نسخة معدلة
              </button>
            </div>

            {/* Video preview thumbnail card */}
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-neutral-900 relative border border-white/[0.1]">
              <img
                src={selectedDraft.thumbnail}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                  <Film className="w-5 h-5 fill-black" />
                </div>
              </div>
            </div>

            {/* Brand Feedback Box */}
            {selectedDraft.feedback && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1 text-xs">
                <span className="font-bold text-amber-300">ملاحظات مراجع البراند:</span>
                <p className="text-white/90 leading-relaxed">{selectedDraft.feedback}</p>
              </div>
            )}

            {/* Chat Thread */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-white/70">محادثة المراجعة:</span>
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto p-1">
                {selectedDraft.chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                      msg.sender === 'creator'
                        ? 'bg-white/[0.1] text-white self-start border border-white/[0.14]'
                        : 'bg-white/[0.04] text-white/90 self-end border border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] text-white/50 mb-1">
                      <span className="font-semibold text-white/80">{msg.senderName}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="relative flex items-center mt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك أو استفسارك للبراند..."
                  className="w-full h-11 pr-4 pl-12 rounded-full bg-white/[0.05] border border-white/[0.14] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <button
                  type="submit"
                  className="absolute left-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftsView;
