import React from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationList from './ConversationList';
import ChatThread from './ChatThread';
import { MessagesSquare } from 'lucide-react';

// صندوق الرسائل (نفس الشاشة للطرفين)
export const MessagesView: React.FC = () => {
  const { myConversations, activeId, setActiveId, side } = useChat();
  const active = myConversations.find((c) => c.id === activeId);

  return (
    <div className="px-4 sm:px-6 pt-6 pb-24 md:pb-8 max-w-[1440px] mx-auto text-right">
      <div className="h-[calc(100vh-140px)] min-h-[520px] rounded-[26px] bg-white/[0.03] border border-white/[0.1] overflow-hidden grid grid-cols-1 md:grid-cols-[340px_1fr]">
        {/* القائمة (يمين) */}
        <aside className={`min-h-0 md:border-l border-white/[0.08] ${active ? 'hidden md:flex' : 'flex'} flex-col`}>
          <div className="px-4 pt-4 pb-1">
            <h1 className="text-lg font-bold text-white font-heading">الرسائل</h1>
            <p className="text-[11px] text-white/50">
              {side === 'brand' ? 'محادثاتك مع صناع المحتوى، مقسّمة حسب الحملة' : 'محادثاتك مع أصحاب الحملات'}
            </p>
          </div>
          <ConversationList />
        </aside>

        {/* المحادثة (يسار) */}
        <section className={`min-h-0 ${active ? 'flex' : 'hidden md:flex'} flex-col`}>
          {active ? (
            <ChatThread conversation={active} onBack={() => setActiveId(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-white/50">
              <MessagesSquare className="w-10 h-10 text-white/25" />
              <span className="text-sm">اختر محادثة من القائمة</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesView;