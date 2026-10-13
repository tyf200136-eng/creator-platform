import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { useChat } from '../../context/ChatContext';
import { ChatAttachment, ChatMessage, Conversation } from '../../types';
import { MASK_WARNING } from '../../utils/maskContacts';
import {
  ArrowRight,
  Send,
  ImagePlus,
  Paperclip,
  Clapperboard,
  MoreVertical,
  Flag,
  Ban,
  ShieldCheck,
  FileText,
  X,
  Link2,
  PenTool,
  Video,
} from 'lucide-react';

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

// ---------- عرض المرفقات ----------
const AttachmentView: React.FC<{ a: ChatAttachment; mine: boolean }> = ({ a, mine }) => {
  if (a.kind === 'image' && a.url) {
    return <img src={a.url} alt={a.name} className="max-w-[240px] w-full rounded-xl object-cover border border-white/10" />;
  }
  if (a.kind === 'work') {
    return (
      <div className={`flex items-center gap-3 p-2 rounded-xl border ${mine ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/[0.04]'}`}>
        {a.thumbnail && <img src={a.thumbnail} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-lg object-cover bg-neutral-800" />}
        <div className="flex flex-col min-w-0">
          <span className="flex items-center gap-1 text-[10px] opacity-60">
            {a.workType === 'design' ? <PenTool className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            {a.workType === 'design' ? 'تصميم من أعمالي' : 'مقطع من أعمالي'}
          </span>
          <span className="text-xs font-semibold truncate max-w-[180px]">{a.name}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${mine ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/[0.04]'}`}>
      <FileText className="w-4 h-4 shrink-0" />
      <span className="text-xs font-semibold truncate max-w-[180px]">{a.name}</span>
      {a.size && <span className="text-[10px] opacity-60 shrink-0">{a.size}</span>}
    </div>
  );
};

// ---------- فقاعة الرسالة ----------
const Bubble: React.FC<{ m: ChatMessage; mine: boolean }> = ({ m, mine }) => (
  <div className={`flex flex-col gap-1 max-w-[75%] ${mine ? 'self-start items-start' : 'self-end items-end'}`}>
    <div
      className={`px-3.5 py-2.5 rounded-2xl flex flex-col gap-2 ${
        mine
          ? 'bg-white text-black rounded-tr-md shadow-[0_0_16px_rgba(255,255,255,0.15)]'
          : 'bg-white/[0.07] border border-white/[0.1] text-white rounded-tl-md'
      }`}
    >
      {m.attachments?.map((a, i) => <AttachmentView key={i} a={a} mine={mine} />)}
      {m.text && <p className="text-sm leading-relaxed whitespace-pre-line break-words">{m.text}</p>}
    </div>
    <div className="flex items-center gap-1.5 px-1 text-[10px] text-white/40">
      <span>{m.createdAt}</span>
      {m.masked && (
        <span className="flex items-center gap-1 text-amber-300/80">
          <ShieldCheck className="w-3 h-3" />
          انخفت معلومات تواصل
        </span>
      )}
    </div>
  </div>
);

// ---------- اختيار عمل من أعمالي ----------
const WorkPicker: React.FC<{ onPick: (a: ChatAttachment) => void; onClose: () => void }> = ({ onPick, onClose }) => {
  const { submissions, designSubmissions, creatorProfile } = useApp();
  const myDesigns = designSubmissions.filter((d) => d.designerId === creatorProfile.id);
  const works: ChatAttachment[] = [
    ...submissions.map((s) => ({
      kind: 'work' as const,
      workType: 'video' as const,
      name: s.campaignTitle,
      thumbnail: s.thumbnail,
      url: s.videoUrl,
    })),
    ...(myDesigns.length ? myDesigns : designSubmissions).map((d) => ({
      kind: 'work' as const,
      workType: 'design' as const,
      name: d.campaignTitle,
      thumbnail: d.previewImages?.[0],
    })),
  ];

  return createPortal(
    <div dir="rtl" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[80vh] rounded-[26px] bg-[#121212] border border-white/[0.16] p-5 flex flex-col gap-4 text-right"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-heading">أرفق عمل من أعمالك</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] text-white/70 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-3">
          {works.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPick(w)}
              className="flex flex-col gap-2 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:border-white/30 text-right transition-colors"
            >
              <img src={w.thumbnail} alt="" referrerPolicy="no-referrer" className="w-full aspect-video rounded-xl object-cover bg-neutral-800" />
              <span className="flex items-center gap-1 text-[10px] text-white/50">
                {w.workType === 'design' ? <PenTool className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                {w.workType === 'design' ? 'تصميم' : 'مقطع'}
              </span>
              <span className="text-xs font-semibold text-white line-clamp-2">{w.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ---------- المحادثة ----------
export const ChatThread: React.FC<{ conversation: Conversation; onBack: () => void }> = ({ conversation: c, onBack }) => {
  const { campaigns, navigateToCampaignDetail } = useApp();
  const { side, sendMessage, reportConversation, toggleBlock } = useChat();
  const [text, setText] = useState('');
  const [pending, setPending] = useState<ChatAttachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const name = side === 'brand' ? c.creatorName : c.brandName;
  const avatar = side === 'brand' ? c.creatorAvatar : c.brandAvatar;
  const campaign = campaigns.find((x) => x.id === c.campaignId);
  const blockedByMe = c.blockedBy === side;
  const blockedByOther = !!c.blockedBy && !blockedByMe;

  // نزول تلقائي لآخر رسالة
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [c.id, c.messages.length]);

  // تفريغ الحقل عند تغيير المحادثة
  useEffect(() => {
    setText('');
    setPending([]);
    setMenuOpen(false);
  }, [c.id]);

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>, kind: 'image' | 'file') => {
    const files = Array.from(e.target.files ?? []);
    setPending((prev) => [
      ...prev,
      ...files.map((f) => ({ kind, name: f.name, url: URL.createObjectURL(f), size: formatSize(f.size) })),
    ]);
    e.target.value = '';
  };

  const send = () => {
    if (!text.trim() && pending.length === 0) return;
    sendMessage(c.id, text, pending.length ? pending : undefined);
    setText('');
    setPending([]);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* رأس المحادثة */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className="md:hidden w-8 h-8 rounded-full bg-white/[0.06] text-white flex items-center justify-center shrink-0" aria-label="رجوع">
            <ArrowRight className="w-4 h-4" />
          </button>
          <img src={avatar} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20 shrink-0 bg-neutral-800" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{name}</span>
            {campaign && (
              <button
                type="button"
                onClick={() => navigateToCampaignDetail(campaign)}
                className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors min-w-0"
              >
                <Link2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{campaign.title}</span>
              </button>
            )}
          </div>
        </div>

        {/* إبلاغ / حظر */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.12] text-white/80 hover:bg-white/[0.1] flex items-center justify-center"
            aria-label="خيارات المحادثة"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-11 w-40 rounded-2xl bg-[#141414] border border-white/[0.18] p-1.5 shadow-2xl z-20">
              <button
                type="button"
                onClick={() => {
                  reportConversation(c.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-white/80 hover:bg-white/[0.08] rounded-xl"
              >
                <Flag className="w-3.5 h-3.5" />
                إبلاغ
              </button>
              {!blockedByOther && (
                <button
                  type="button"
                  onClick={() => {
                    toggleBlock(c.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/10 rounded-xl"
                >
                  <Ban className="w-3.5 h-3.5" />
                  {blockedByMe ? 'إلغاء الحظر' : 'حظر'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* الرسائل */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <div className="self-center flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/50 mb-2">
          <ShieldCheck className="w-3 h-3" />
          {MASK_WARNING}. الأرقام والإيميلات والروابط الخارجية تنخفي تلقائياً.
        </div>
        {c.messages.length === 0 && (
          <div className="self-center text-xs text-white/40 py-8">ابدأ المحادثة مع {name}</div>
        )}
        {c.messages.map((m) => (
          <Bubble key={m.id} m={m} mine={m.from === side} />
        ))}
        <div ref={endRef} />
      </div>

      {/* الكتابة */}
      {c.blockedBy ? (
        <div className="px-4 py-4 border-t border-white/[0.08] flex items-center justify-between gap-3 text-xs text-white/60">
          <span>{blockedByMe ? 'حظرت هذي المحادثة.' : 'ما تقدر ترسل رسائل في هذي المحادثة.'}</span>
          {blockedByMe && (
            <button type="button" onClick={() => toggleBlock(c.id)} className="px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.14] text-white font-semibold">
              إلغاء الحظر
            </button>
          )}
        </div>
      ) : (
        <div className="px-3 py-3 border-t border-white/[0.08] flex flex-col gap-2">
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pending.map((a, i) => (
                <div key={i} className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-[11px] text-white">
                  {a.kind === 'image' ? <ImagePlus className="w-3 h-3" /> : a.kind === 'work' ? <Clapperboard className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  <span className="truncate max-w-[140px]">{a.name}</span>
                  <button type="button" onClick={() => setPending((p) => p.filter((_, j) => j !== i))} aria-label="إزالة">
                    <X className="w-3 h-3 text-white/60" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input ref={imageRef} type="file" accept="image/*" multiple hidden onChange={(e) => pickFiles(e, 'image')} />
            <input ref={fileRef} type="file" multiple hidden onChange={(e) => pickFiles(e, 'file')} />

            <div className="flex items-center gap-1 shrink-0 pb-1">
              <button type="button" onClick={() => imageRef.current?.click()} title="صورة" className="w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center justify-center">
                <ImagePlus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} title="ملف" className="w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center justify-center">
                <Paperclip className="w-4 h-4" />
              </button>
              {side === 'creator' && (
                <button type="button" onClick={() => setPickerOpen(true)} title="أرفق عمل من أعمالي" className="w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center justify-center">
                  <Clapperboard className="w-4 h-4" />
                </button>
              )}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="اكتب رسالة..."
              className="flex-1 resize-none max-h-32 rounded-2xl bg-white/[0.05] border border-white/[0.12] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />

            <button
              type="button"
              onClick={send}
              disabled={!text.trim() && pending.length === 0}
              className="white-glow-button w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="إرسال"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </div>
        </div>
      )}

      {pickerOpen && (
        <WorkPicker
          onClose={() => setPickerOpen(false)}
          onPick={(w) => {
            setPending((p) => [...p, w]);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatThread;