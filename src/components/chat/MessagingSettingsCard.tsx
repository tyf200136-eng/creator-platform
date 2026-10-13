import React from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageCircle } from 'lucide-react';

// إعداد البراند: قفل استقبال الرسائل الجديدة
export const MessagingSettingsCard: React.FC = () => {
  const { acceptNewMessages, setAcceptNewMessages } = useChat();

  return (
    <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex items-center justify-between gap-4 text-right">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white/80 shrink-0">
          <MessageCircle className="w-4 h-4" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-white">استقبال الرسائل الجديدة</span>
          <span className="text-xs text-white/55 leading-relaxed">
            إذا قفلته، ما يقدر صناع المحتوى يبدؤون محادثات جديدة معك. المحادثات الحالية تبقى شغالة.
          </span>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={acceptNewMessages}
        onClick={() => setAcceptNewMessages(!acceptNewMessages)}
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${acceptNewMessages ? 'bg-white' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full transition-all ${
            acceptNewMessages ? 'right-1 bg-black' : 'right-6 bg-white/70'
          }`}
        />
      </button>
    </div>
  );
};

export default MessagingSettingsCard;
