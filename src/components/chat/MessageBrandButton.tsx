import React from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageCircle } from 'lucide-react';

// زر "راسل البراند" لصانع المحتوى: يظهر بس إذا كان مشارك في حملة للبراند
export const MessageBrandButton: React.FC<{ brandName: string; campaignId?: string; className?: string }> = ({
  brandName,
  campaignId,
  className = '',
}) => {
  const { canMessageBrand, openChatWithBrand } = useChat();
  if (!canMessageBrand(brandName)) return null;

  return (
    <button
      type="button"
      onClick={() => openChatWithBrand(brandName, campaignId)}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.16] text-xs font-bold text-white transition-all ${className}`}
    >
      <MessageCircle className="w-3.5 h-3.5" />
      راسل {brandName}
    </button>
  );
};

export default MessageBrandButton;