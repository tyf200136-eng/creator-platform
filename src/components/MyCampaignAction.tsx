import React from 'react';
import { Campaign, MyParticipation } from '../types';
import { useApp } from '../context/AppContext';
import StatusBadge from './common/StatusBadge';
import { Upload, Video, CheckCircle2, BarChart3 } from 'lucide-react';

interface MyCampaignActionProps {
  campaign: Campaign;
  participation: MyParticipation;
}

// حاوية الشريط أسفل الكرت
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center gap-2 px-1 min-h-[45px]">
    {children}
  </div>
);

// شريط الزر/الحالة أسفل كرت الحملة في شاشة "الحملات" عند صانع المحتوى
export const MyCampaignAction: React.FC<MyCampaignActionProps> = ({ campaign, participation }) => {
  const { navigateToCampaignDetail, setSelectedCampaign, setIsSubmitClipModalOpen } = useApp();
  const isDesign = campaign.campaignType === 'design';

  // فتح نافذة الإرسال بدون ما يفتح تفاصيل الحملة
  const openSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCampaign(campaign);
    setIsSubmitClipModalOpen(true);
  };

  const openDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToCampaignDetail(campaign);
  };

  const primaryBtn =
    'flex-1 h-9 rounded-xl bg-white text-black font-bold text-xs shadow-[0_0_16px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer';
  const secondaryBtn =
    'flex-1 h-9 rounded-xl bg-white/[0.08] border border-white/[0.14] text-white font-semibold text-xs hover:bg-white/[0.14] transition-all flex items-center justify-center gap-1.5 cursor-pointer';

  // ١) حملة موقفة مؤقتاً ← بدون زر
  if (campaign.status === 'paused') {
    return <Row><StatusBadge tone="neutral">الحملة متوقفة مؤقتاً</StatusBadge></Row>;
  }

  // ٢) حسب حالة المشاركة
  if (participation.status === 'rejected') {
    return <Row><StatusBadge tone="danger">لم يتم قبول طلبك</StatusBadge></Row>;
  }

  if (participation.status === 'pending_approval') {
    return <Row><StatusBadge tone="warning">بانتظار قبول طلبك</StatusBadge></Row>;
  }

  if (participation.status === 'ended') {
    return (
      <Row>
        <button type="button" onClick={openDetails} className={secondaryBtn}>
          <BarChart3 className="w-3.5 h-3.5" />
          <span>عرض النتائج</span>
        </button>
      </Row>
    );
  }

  // ٣) منضم: حملة مقاطع
  if (!isDesign) {
    return (
      <Row>
        <button type="button" onClick={openSubmit} className={primaryBtn}>
          <Video className="w-3.5 h-3.5" />
          <span>أرسل مقطع</span>
        </button>
      </Row>
    );
  }

  // ٤) منضم: حملة تصميم
  if (participation.workStatus === 'needs_revision') {
    return (
      <Row>
        <StatusBadge tone="warning" pulse>يحتاج تعديل</StatusBadge>
        <button type="button" onClick={openSubmit} className={primaryBtn}>
          <Upload className="w-3.5 h-3.5" />
          <span>ارفع النسخة المعدّلة</span>
        </button>
      </Row>
    );
  }

  if (participation.workStatus === 'submitted') {
    return (
      <Row>
        <div className={`${secondaryBtn} cursor-default opacity-70 hover:bg-white/[0.08]`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تم الإرسال</span>
        </div>
      </Row>
    );
  }

  return (
    <Row>
      <button type="button" onClick={openSubmit} className={primaryBtn}>
        <Upload className="w-3.5 h-3.5" />
        <span>ارفع تصميمك</span>
      </button>
    </Row>
  );
};

export default MyCampaignAction;