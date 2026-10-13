import React from 'react';
import { useApp } from '../../context/AppContext';
import { useChat } from '../../context/ChatContext';
import { MessageCircle } from 'lucide-react';

// أيقونة الرسائل في الشريط العلوي مع عدد غير المقروء
export const MessagesButton: React.FC = () => {
  const { role, setCreatorView, setBrandView } = useApp();
  const { unreadTotal } = useChat();

  return (
    <button
      type="button"
      onClick={() => (role === 'brand' ? setBrandView('messages') : setCreatorView('messages'))}
      className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition-all relative"
      title="الرسائل"
      aria-label={unreadTotal ? `الرسائل، ${unreadTotal} غير مقروءة` : 'الرسائل'}
    >
      <MessageCircle className="w-4 h-4" />
      {unreadTotal > 0 && (
        <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.6)]">
          {unreadTotal}
        </span>
      )}
    </button>
  );
};

export default MessagesButton;