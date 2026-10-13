import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useChat } from '../context/ChatContext';
import { useNotifications, AppNotification, NotificationKind } from '../context/NotificationsContext';
import { Bell, MessageCircle, Megaphone, Reply, CircleHelp, UserPlus, CheckCircle2 } from 'lucide-react';

const ICONS: Record<NotificationKind, React.FC<{ className?: string }>> = {
  message: MessageCircle,
  announcement: Megaphone,
  answer: Reply,
  question: CircleHelp,
  member: UserPlus,
  system: CheckCircle2,
};

// جرس الإشعارات في الشريط العلوي
export const NotificationsMenu: React.FC = () => {
  const { role, setBrandView, setCreatorView, openBrandProfile } = useApp();
  const { openConversation, side } = useChat();
  const { notifications, markRead, markAllRead, setPendingTab } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mine = notifications.filter((n) => n.side === side);
  const unread = mine.filter((n) => !n.read).length;

  // إغلاق عند الضغط برا
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    const t = n.target;
    if (t.type === 'chat') {
      openConversation(t.conversationId);
      if (role === 'brand') setBrandView('messages');
      else setCreatorView('messages');
    }
    if (t.type === 'brand-profile') {
      setPendingTab(n.kind === 'answer' ? 'community-qa' : 'community');
      openBrandProfile(t.brandName);
    }
    if (t.type === 'brand-page') {
      setPendingTab(t.tab);
      setBrandView('brand-page');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition-all relative"
        title="الإشعارات"
        aria-label={unread ? `الإشعارات، ${unread} جديدة` : 'الإشعارات'}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-11 w-[340px] rounded-[20px] bg-[#121212] border border-white/[0.14] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-right animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] px-1">
            <span className="text-xs font-bold text-white">الإشعارات</span>
            {unread > 0 && (
              <button type="button" onClick={() => markAllRead(side)} className="text-[10px] text-white/50 hover:text-white">
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-2 max-h-80 overflow-y-auto">
            {mine.length === 0 && <div className="py-8 text-center text-xs text-white/50">ما فيه إشعارات</div>}
            {mine.map((n) => {
              const Icon = ICONS[n.kind];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => go(n)}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-right transition-colors ${
                    n.read ? 'hover:bg-white/[0.05]' : 'bg-white/[0.06] hover:bg-white/[0.09]'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/80 shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${n.read ? 'font-semibold text-white/80' : 'font-bold text-white'}`}>{n.title}</span>
                      <span className="text-[10px] text-white/40 shrink-0">{n.time}</span>
                    </span>
                    <span className="text-[11px] text-white/55 line-clamp-2 leading-relaxed">{n.body}</span>
                  </span>
                  {!n.read && <span className="w-2 h-2 mt-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;