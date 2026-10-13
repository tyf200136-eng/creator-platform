import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import RiyalSymbol from './RiyalSymbol';
import PlatformIcon from './PlatformIcon';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  Eye,
  Play,
  CheckCircle2,
  TrendingUp,
  Volume2,
  Flame
} from 'lucide-react';

/**
 * Animated number count-up component for the huge view count
 */
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    prevValueRef.current = value;
    let startTimestamp: number | null = null;
    const duration = 650;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return <span className="tabular-nums font-mono">{displayValue.toLocaleString()}</span>;
};

export const TopClipsSection: React.FC = () => {
  const { topClips, setSelectedClip, navigateToCampaignDetail, campaigns } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const totalClips = topClips.length;
  const activeClip = topClips[activeIndex] || topClips[0];

  // Match the campaign for the active clip (always matches active clip)
  const linkedCampaign = campaigns.find((c) => c.id === activeClip?.campaignId) || campaigns[0];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalClips);
    setProgress(0);
  }, [totalClips]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalClips) % totalClips);
    setProgress(0);
  }, [totalClips]);

  // Auto-advance every 5 seconds, pausing when hovered
  useEffect(() => {
    if (isHovered || totalClips <= 1) return;

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / 5000) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isHovered, totalClips, handleNext]);

  // Reset progress when active index changes manually
  const selectClip = (idx: number) => {
    setActiveIndex((idx + totalClips) % totalClips);
    setProgress(0);
  };

  // Drag / swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const diff = e.changedTouches[0].clientX - dragStartX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handlePrev(); // in RTL swipe right means go to previous
      } else {
        handleNext(); // swipe left means go to next
      }
    }
    setDragStartX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX === null) return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    setDragStartX(null);
  };

  // Calculate 3D transforms for relative offset (-2, -1, 0, 1, 2)
  const getCardStyle = (offset: number) => {
    // offset 0 is center active
    if (offset === 0) {
      return {
        zIndex: 30,
        x: '0px',
        scale: 1.08,
        rotateY: 0,
        opacity: 1,
        filter: 'grayscale(0%)',
        cursor: 'pointer',
      };
    }

    // offset -1 (one step right in RTL)
    if (offset === -1) {
      return {
        zIndex: 20,
        x: '210px',
        scale: 0.88,
        rotateY: -28, // tilted inward towards center
        opacity: 0.65,
        filter: 'grayscale(100%)',
        cursor: 'pointer',
      };
    }

    // offset +1 (one step left in RTL)
    if (offset === 1) {
      return {
        zIndex: 20,
        x: '-210px',
        scale: 0.88,
        rotateY: 28, // tilted inward towards center
        opacity: 0.65,
        filter: 'grayscale(100%)',
        cursor: 'pointer',
      };
    }

    // offset -2 (outer right in RTL)
    if (offset === -2) {
      return {
        zIndex: 10,
        x: '380px',
        scale: 0.74,
        rotateY: -35,
        opacity: 0.35,
        filter: 'grayscale(100%)',
        cursor: 'pointer',
      };
    }

    // offset +2 (outer left in RTL)
    if (offset === 2) {
      return {
        zIndex: 10,
        x: '-380px',
        scale: 0.74,
        rotateY: 35,
        opacity: 0.35,
        filter: 'grayscale(100%)',
        cursor: 'pointer',
      };
    }

    // Out of view
    return {
      zIndex: 0,
      x: offset > 0 ? '-550px' : '550px',
      scale: 0.6,
      rotateY: offset > 0 ? 45 : -45,
      opacity: 0,
      filter: 'grayscale(100%)',
      cursor: 'default',
    };
  };

  return (
    <section className="flex flex-col gap-6 text-right select-none w-full">
      {/* 1. Header with title and round glass navigation buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-white font-heading tracking-tight flex items-center gap-2">
            <span>أفضل المقاطع</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[11px] text-white/80 font-medium">
            مسرح ثلاثي الأبعاد · أعلى مشاهدات
          </span>
        </div>

        {/* Round Glass Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.14] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.14] hover:border-white/30 transition-all shadow-sm"
            aria-label="المقطع السابق"
            title="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.14] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.14] hover:border-white/30 transition-all shadow-sm"
            aria-label="المقطع التالي"
            title="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 3D COVER-FLOW STAGE CONTAINER */}
      <div
        className="relative w-full h-[430px] sm:h-[470px] flex items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06]"
        style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setDragStartX(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Soft Background Spotlight behind active card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-white/[0.05] rounded-full blur-[90px] pointer-events-none" />

        {/* Top spotlight cone light shining down on active card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 [background:radial-gradient(ellipse_at_top,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.12)_45%,transparent_75%)] blur-[3px] pointer-events-none z-40" />

        {/* Stage Floor Reflection Line */}
        <div className="absolute bottom-6 inset-x-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* 3D Carousel Cards */}
        {topClips.map((clip, index) => {
          // Calculate wrapped offset relative to activeIndex (-2 to +2)
          let offset = index - activeIndex;
          if (offset < -Math.floor(totalClips / 2)) offset += totalClips;
          if (offset > Math.floor(totalClips / 2)) offset -= totalClips;

          const isVisible = Math.abs(offset) <= 2;
          const isActive = offset === 0;
          const cardStyle = getCardStyle(offset);

          return (
            <motion.div
              key={clip.id}
              initial={false}
              animate={{
                x: cardStyle.x,
                scale: cardStyle.scale,
                rotateY: cardStyle.rotateY,
                opacity: cardStyle.opacity,
                filter: cardStyle.filter,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
                mass: 0.9,
              }}
              onClick={() => {
                if (isActive) {
                  setSelectedClip(clip); // Open full 9:16 interactive reel modal
                } else {
                  selectClip(index); // Bring clicked side clip to center
                }
              }}
              style={{
                zIndex: cardStyle.zIndex,
                transformStyle: 'preserve-3d',
                cursor: cardStyle.cursor,
              }}
              className={`absolute w-[190px] sm:w-[220px] aspect-[9/16] rounded-[26px] overflow-hidden bg-neutral-950 border transition-colors select-none ${
                isActive
                  ? 'border-white/40 shadow-[0_24px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'border-white/[0.12] shadow-[0_16px_36px_rgba(0,0,0,0.8)]'
              }`}
            >
              {/* Vertical video/thumbnail background */}
              <img
                src={clip.thumbnail}
                alt={clip.creatorName}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isActive ? 'scale-100' : 'scale-105'
                }`}
              />

              {/* Dynamic Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />

              {/* Active clip spotlight top glow */}
              {isActive && (
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.22] to-transparent pointer-events-none" />
              )}

              {/* TOP ROW: Platform Icon on Left, View Count Pill on Right */}
              <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between">
                {/* Platform Icon on top-left (in RTL, order-2 or left) */}
                <div className="w-7 h-7 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                  <PlatformIcon platform={clip.platform} size={13} />
                </div>

                {/* View count pill top-right */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/25 text-[11px] font-bold text-white font-mono tabular-nums shadow-sm">
                  <Eye className="w-3 h-3 text-white/80" />
                  <span>{clip.viewsFormatted}</span>
                </div>
              </div>

              {/* Active Clip Center Play / Auto-playing Visualizer */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Gentle pulsing live badge */}
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-[0_0_24px_rgba(255,255,255,0.4)]">
                    <Play className="w-5 h-5 fill-white mr-0.5" />
                  </div>
                </div>
              )}

              {/* BOTTOM CONTENT: Creator Avatar + Name */}
              <div className="absolute bottom-3.5 inset-x-3 z-10 flex flex-col gap-1.5 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={clip.creatorAvatar}
                      alt={clip.creatorName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-white/40 shrink-0"
                    />
                    <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                      {clip.creatorName}
                    </span>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1 text-[10px] text-white/70 font-mono">
                      <Volume2 className="w-3 h-3 text-white/70" />
                    </div>
                  )}
                </div>

                {/* THIN WHITE PROGRESS LINE AT BOTTOM OF ACTIVE CLIP */}
                {isActive && (
                  <div className="mt-1.5 h-1 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)] transition-[width] duration-75 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. GLASS INFO BAR LINKED TO THE ACTIVE CLIP */}
      <div className="relative w-full rounded-[24px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
        {/* Subtle stage light accent at top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeClip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 text-right"
          >
            {/* Right: Huge View Count + Creator Earnings */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
              {/* Huge View Count */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                  <Eye className="w-3.5 h-3.5 text-white/60" />
                  <span>المشاهدات المعتمدة</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight font-heading flex items-baseline gap-2">
                  <AnimatedCounter value={activeClip.views} />
                  <span className="text-xs font-normal text-white/50 font-sans">مشاهدة</span>
                </div>
              </div>

              {/* Creator Earnings Pill in Riyals */}
              <div className="flex flex-col gap-1 sm:border-r sm:border-white/[0.1] sm:pr-6">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>أرباح الصانع من هذا المقطع</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm font-mono">
                    <span className="tabular-nums">
                      {activeClip.earnings.toLocaleString('en-US', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <RiyalSymbol className="w-3 h-3 text-emerald-300 inline-block" />
                  </div>
                  <span className="text-xs text-white/90 font-medium">
                    ربح {activeClip.creatorName}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle & Left: Matching Campaign + White Glowing CTA Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
              {/* Campaign Details (always matches active clip) */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={linkedCampaign.brandAvatar}
                  alt={linkedCampaign.brandName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/25 shrink-0"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white/90">
                      {linkedCampaign.brandName}
                    </span>
                    {linkedCampaign.isVerified && (
                      <CheckCircle2 className="w-3 h-3 text-white/90 fill-white/20 shrink-0" />
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[260px] font-heading">
                    {linkedCampaign.title}
                  </h4>
                  {/* Rate Pill */}
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-mono">
                    <span className="text-white/60 font-sans">المعدل:</span>
                    <span className="font-bold text-white">{linkedCampaign.ratePer1k}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white inline-block" />
                    <span className="text-white/60">/ 1K</span>
                  </div>
                </div>
              </div>

              {/* White Glowing CTA Button */}
              <button
                onClick={() => navigateToCampaignDetail(linkedCampaign)}
                className="w-full sm:w-auto py-2.5 px-6 rounded-full bg-white text-black text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:shadow-[0_0_30px_rgba(255,255,255,0.95)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>انضم للحملة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TopClipsSection;
