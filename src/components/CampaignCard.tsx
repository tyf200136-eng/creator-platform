import React from 'react';
import { Campaign, MyParticipation } from '../types';
import MyCampaignAction from './MyCampaignAction';
import RiyalSymbol from './RiyalSymbol';
import PlatformIcon from './PlatformIcon';
import StatusBadge from './common/StatusBadge';
import { 
  Lock, 
  CheckCircle2, 
  Users, 
  PenTool, 
  Clock, 
  Smartphone, 
  Square, 
  Layers,
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CampaignCardProps {
  campaign: Campaign;
  showNewBadge?: boolean;
  className?: string;
  participation?: MyParticipation;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  showNewBadge = false,
  className = "",
  participation 
}) => {
  const { navigateToCampaignDetail, setSelectedCampaign, setIsSubmitClipModalOpen } = useApp();

  const isDesign = campaign.campaignType === 'design';
  const designDetails = campaign.designDetails;

  const progressPercent = Math.min(100, Math.round((campaign.spentBudget / campaign.totalBudget) * 100));

  // Design Campaign specific calculations
  const totalSlots = designDetails?.totalDesignsNeeded || 10;
  const acceptedSlots = designDetails?.acceptedDesignsCount || 3;
  const pricePerDesign = designDetails?.pricePerDesign || 150;
  const deadlineText = designDetails?.deadline ? designDetails.deadline.replace('باقي', 'متبقٍّ') : 'متبقٍّ 4 أيام';

  return (
    <div
      onClick={() => navigateToCampaignDetail(campaign)}
      className={`group relative flex flex-col rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-3 text-right cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.28] hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(255,255,255,0.08)] hover:-translate-y-1 ${className}`}
    >
      {/* 16:9 Cover Image with Grayscale default + Bloom to color on hover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[18px] bg-neutral-900">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover grayscale transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-105"
        />
        {/* Soft dark gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        {/* =========================================================================
            DESIGN CAMPAIGN COVER BADGES
            ========================================================================= */}
        {isDesign ? (
          <>
            {/* Top-Right: Glass tag "تصميم" with pen icon */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-[11px] font-bold text-white shadow-sm">
              <PenTool className="w-3 h-3 text-white" />
              <span>تصميم</span>
            </div>

            {/* Top-Left: Countdown tag "باقي 4 أيام" */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-amber-300 shadow-sm">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>{deadlineText}</span>
            </div>

            {/* Bottom-Right on Cover: Small outline shapes of required sizes */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
              {designDetails?.sizes?.slice(0, 3).map((size) => (
                <div
                  key={size}
                  className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[9px] text-white/80 flex items-center gap-1 font-mono"
                  title={size}
                >
                  {size.includes('بوست') ? (
                    <Smartphone className="w-2.5 h-2.5 text-white/70" />
                  ) : size.includes('مربع') ? (
                    <Square className="w-2.5 h-2.5 text-white/70" />
                  ) : (
                    <Layers className="w-2.5 h-2.5 text-white/70" />
                  )}
                  <span>{size.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            {/* Hover Action Button: ارفع تصميمك */}
            {!participation && (
            <div className="absolute inset-x-2.5 bottom-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCampaign(campaign);
                  setIsSubmitClipModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white text-black font-bold text-xs shadow-[0_4px_20px_rgba(255,255,255,0.6)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-black" />
                <span>ارفع تصميمك</span>
              </button>
            </div>
            )}
          </>
        ) : (
          /* =========================================================================
             VIDEO CAMPAIGN COVER BADGES
             ========================================================================= */
          <>
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
              {campaign.requiresApplication && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-sm">
                  <Lock className="w-3 h-3 text-white/90" />
                  <span>بطلب</span>
                </div>
              )}
              {(showNewBadge || campaign.isNew) && (
                <div className="flex items-center px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold tracking-tight shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                  جديد
                </div>
              )}
            </div>

            {campaign.status === 'almost_full' && (
              <div className="absolute top-2.5 left-2.5">
                <StatusBadge tone="warning" className="bg-black/60!">أوشكت على الاكتمال</StatusBadge>
              </div>
            )}
          </>
        )}
      </div>

      {/* Meta Row: Brand on Right, Brand Colors (if Design) or Platforms on Left */}
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        {/* Brand info */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={campaign.brandAvatar}
            alt={campaign.brandName}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20 shrink-0"
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium text-white truncate max-w-[120px]">
              {campaign.brandName}
            </span>
            {campaign.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-white/90 fill-white/20 shrink-0" />
            )}
            
            {/* Brand color swatches as small circles next to brand name for design campaigns */}
            {isDesign && designDetails?.brandColors && (
              <div className="flex items-center gap-1 mr-1 shrink-0">
                {designDetails.brandColors.slice(0, 3).map((col) => (
                  <div
                    key={col}
                    className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>
            )}

            {!isDesign && (
              <span className="text-[11px] text-[#A3A3A3] whitespace-nowrap">
                · {campaign.timeAgo}
              </span>
            )}
          </div>
        </div>

        {/* Left side: Platform icons for video, or format count for design */}
        <div className="flex items-center gap-1 shrink-0">
          {campaign.platforms.slice(0, 3).map((p) => (
            <div
              key={p}
              className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/[0.14] transition-colors"
              title={p}
            >
              <PlatformIcon platform={p} size={11} />
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Title (one line, ellipsis) */}
      <h3 className="mt-2 text-sm font-semibold text-white/95 truncate px-1 group-hover:text-white transition-colors">
        {campaign.title}
      </h3>

      {/* Bottom Metric Row */}
      {isDesign ? (
        /* =========================================================================
           DESIGN CAMPAIGN BOTTOM METRIC:
           - "قُبل 3 من 10" with segmented progress bar
           - White pill "150 ﷼ لكل تصميم"
           ========================================================================= */
        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          {/* Slots count: "قُبل 3 من 10" */}
          <div className="flex items-center gap-1 text-xs text-white/70">
            <span>قُبل</span>
            <span className="font-bold text-white font-mono">{acceptedSlots}</span>
            <span>من</span>
            <span className="font-bold text-white font-mono">{totalSlots}</span>
          </div>

          {/* White rate pill: "150 ﷼ لكل تصميم" */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            <span className="font-mono tabular-nums">{pricePerDesign}</span>
            <RiyalSymbol className="w-3 h-3 text-black inline-block" />
            <span className="text-[10px] font-normal text-neutral-800">لكل تصميم</span>
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIDEO CAMPAIGN BOTTOM METRIC:
           - Budget info on right
           - Participants + White Rate pill "8 ﷼ / 1K" on left
           ========================================================================= */
        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          {/* Budget */}
          <div className="flex items-baseline gap-1 text-xs text-[#A3A3A3]">
            <span className="font-semibold text-white font-mono tabular-nums">
              {campaign.spentBudget.toLocaleString()}
            </span>
            <span>/</span>
            <span className="font-mono tabular-nums">{campaign.totalBudget.toLocaleString()}</span>
            <RiyalSymbol className="w-3 h-3 text-[#A3A3A3] inline-block mr-0.5" />
          </div>

          {/* Left cluster: Participants pill + Rate Pill */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] text-white/80">
              <Users className="w-3 h-3 text-white/60" />
              <span className="font-mono tabular-nums">{campaign.participantsCount}</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              <span className="font-mono tabular-nums">{campaign.ratePer1k}</span>
              <RiyalSymbol className="w-3 h-3 text-black inline-block" />
              <span className="text-[10px] font-normal text-neutral-800">/ 1K</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isDesign ? (
        /* Segmented Progress Bar (one segment per design slot) */
        <div className="mt-2.5 flex items-center gap-1 w-full px-0.5">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const isFilled = idx < acceptedSlots;
            return (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all ${
                  isFilled
                    ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                    : 'bg-white/15'
                }`}
              />
            );
          })}
        </div>
      ) : (
        /* Continuous glowing progress bar for video campaigns */
        <div className="mt-2.5 h-1 w-full rounded-full bg-white/10 overflow-hidden px-0.5">
          <div
            className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
     {/* زر/حالة المشاركة (يظهر في شاشة "الحملات" فقط) */}
      {participation && (
      <MyCampaignAction campaign={campaign} participation={participation} />
      )}
    </div>
  );
};

export default CampaignCard;
