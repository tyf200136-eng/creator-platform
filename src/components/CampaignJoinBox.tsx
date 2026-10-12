import React from 'react';
import { Campaign, MyParticipation } from '../types';
import { useApp } from '../context/AppContext';
import StatusBadge from './common/StatusBadge';
import { Lock, UserPlus } from 'lucide-react';

interface CampaignJoinBoxProps {
  campaign: Campaign;
  participation?: MyParticipation;
}

// صندوق حالة بدون زر
const StatusRow: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex flex-col items-center gap-2 text-center">
    {children}
    {hint && <p className="text-[11px] text-white/50 leading-relaxed">{hint}</p>}
  </div>
);

// يظهر في صفحة تفاصيل الحملة قبل ما يصير الصانع "منضم"
export const CampaignJoinBox: React.FC<CampaignJoinBoxProps> = ({ campaign, participation }) => {
  const { joinCampaign, setIsApplyModalOpen } = useApp();

  const primaryBtn =
    'w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_36px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer';

  // حملة موقفة مؤقتاً ← بدون زر
  if (campaign.status === 'paused') {
    return <StatusRow><StatusBadge tone="neutral">الحملة متوقفة مؤقتاً</StatusBadge></StatusRow>;
  }

  if (participation?.status === 'pending_approval') {
    return (
      <StatusRow hint="راح يوصلك إشعار أول ما يرد صاحب الحملة على طلبك">
        <StatusBadge tone="warning">بانتظار قبول طلبك</StatusBadge>
      </StatusRow>
    );
  }

  if (participation?.status === 'rejected') {
    return <StatusRow><StatusBadge tone="danger">لم يتم قبول طلبك</StatusBadge></StatusRow>;
  }

  if (participation?.status === 'ended') {
    return <StatusRow><StatusBadge tone="neutral">الحملة منتهية</StatusBadge></StatusRow>;
  }

  // ما انضم بعد
  return (
    <div className="flex flex-col gap-2">
      {campaign.requiresApplication ? (
        <button type="button" onClick={() => setIsApplyModalOpen(true)} className={primaryBtn}>
          <Lock className="w-4 h-4" />
          <span>قدّم على الحملة</span>
        </button>
      ) : (
        <button type="button" onClick={() => joinCampaign(campaign)} className={primaryBtn}>
          <UserPlus className="w-4 h-4" />
          <span>انضم للحملة</span>
        </button>
      )}
      <p className="text-[11px] text-white/50 text-center">بعد الانضمام تلقى الحملة في "حملاتي"</p>
    </div>
  );
};

export default CampaignJoinBox;