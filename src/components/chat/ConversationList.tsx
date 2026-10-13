import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useChat } from '../../context/ChatContext';
import { Conversation } from '../../types';
import { Search, Paperclip } from 'lucide-react';

// آخر رسالة كنص قصير
const preview = (c: Conversation) => {
  const last = c.messages[c.messages.length - 1];
  if (!last) return 'محادثة جديدة';
  if (last.text) return last.text;
  return `مرفق: ${last.attachments?.[0]?.name ?? ''}`;
};

const Row: React.FC<{ c: Conversation }> = ({ c }) => {
  const { side, activeId, openConversation } = useChat();
  const name = side === 'brand' ? c.creatorName : c.brandName;
  const avatar = side === 'brand' ? c.creatorAvatar : c.brandAvatar;
  const unread = c.unread[side];
  const last = c.messages[c.messages.length - 1];
  const active = activeId === c.id;

  return (
    <button
      type="button"
      onClick={() => openConversation(c.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-right transition-colors ${
        active ? 'bg-white/[0.1]' : 'hover:bg-white/[0.05]'
      }`}
    >
      <img src={avatar} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover ring-1 ring-white/15 shrink-0 bg-neutral-800" />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${unread ? 'font-bold text-white' : 'font-semibold text-white/90'}`}>{name}</span>
          <span className="text-[10px] text-white/40 shrink-0">{last?.createdAt ?? ''}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs truncate flex items-center gap-1 ${unread ? 'text-white/85' : 'text-white/50'}`}>
            {!last?.text && last?.attachments && <Paperclip className="w-3 h-3 shrink-0" />}
            {c.blockedBy ? 'محادثة محظورة' : preview(c)}
          </span>
          {unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// قائمة المحادثات: عند البراند مقسّمة حسب الحملة
export const ConversationList: React.FC = () => {
  const { campaigns } = useApp();
  const { side, myConversations } = useChat();
  const [q, setQ] = useState('');

  const filtered = myConversations.filter((c) => {
    if (!q.trim()) return true;
    const name = side === 'brand' ? c.creatorName : c.brandName;
    return name.includes(q.trim()) || c.messages.some((m) => m.text?.includes(q.trim()));
  });

  // تجميع حسب الحملة (للبراند)
  const groups: { title: string; items: Conversation[] }[] = [];
  if (side === 'brand') {
    filtered.forEach((c) => {
      const title = campaigns.find((x) => x.id === c.campaignId)?.title ?? 'بدون حملة';
      const g = groups.find((x) => x.title === title);
      if (g) g.items.push(c);
      else groups.push({ title, items: [c] });
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-white/[0.08]">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في المحادثات"
            className="w-full h-10 pr-9 pl-4 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-1">
        {filtered.length === 0 && <div className="py-10 text-center text-xs text-white/50">ما فيه محادثات</div>}

        {side === 'brand'
          ? groups.map((g) => (
              <div key={g.title} className="flex flex-col gap-1 mb-2">
                <span className="px-3 pt-2 pb-1 text-[10px] font-semibold text-white/40 truncate">{g.title}</span>
                {g.items.map((c) => <Row key={c.id} c={c} />)}
              </div>
            ))
          : filtered.map((c) => <Row key={c.id} c={c} />)}
      </div>
    </div>
  );
};

export default ConversationList;