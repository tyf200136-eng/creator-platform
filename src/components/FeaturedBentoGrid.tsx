import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import RiyalSymbol from './RiyalSymbol';
import PlatformIcon from './PlatformIcon';
import { Campaign } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  CheckCircle2,
  Flame,
  Clock,
  CircleDollarSign
} from 'lucide-react';

interface LivingTileProps {
  campaignsPool: Campaign[];
  intervalMs: number;
  className?: string;
  isWide?: boolean;
  isMedium?: boolean;
  customTag?: string;
  isFixed?: boolean;
}

const BentoTile: React.FC<LivingTileProps> = ({
  campaignsPool,
  intervalMs,
  className = '',
  isWide = false,
  isMedium = false,
  customTag,
  isFixed = false,
}) => {
  const { navigateToCampaignDetail } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-swap living tiles every intervalMs (unless paused on hover or fixed)
  useEffect(() => {
    if (isFixed || isHovered || campaignsPool.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaignsPool.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isFixed, isHovered, intervalMs, campaignsPool.length]);

  const campaign = campaignsPool[currentIndex] || campaignsPool[0];
  if (!campaign) return null;

  // Determine tag to display
  const tag = customTag || (campaign.isTrending ? 'الأعلى طلباً' : campaign.isNew ? 'جديد' : campaign.status === 'almost_full' ? 'قربت تخلص' : undefined);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
      onClick={() => navigateToCampaignDetail(campaign)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`on-media group relative rounded-[20px] overflow-hidden bg-neutral-950 border border-white/[0.14] cursor-pointer select-none transition-all duration-300 hover:border-white/[0.38] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_28px_rgba(255,255,255,0.12)] hover:-translate-y-[3px] flex flex-col justify-between p-4 ${className}`}
    >
      {/* Living Crossfade Background Cover */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-105"
          />
          {/* Subtle Stage Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Top Bar inside Tile: Tags on Right, Lock Pill on Left (in RTL) */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Top-Right Tag */}
        <div className="flex items-center gap-1.5">
          {tag && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight shadow-sm flex items-center gap-1 ${
              tag === 'الأعلى أجراً' || tag === 'الأكثر طلباً'
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                : tag === 'قربت تخلص'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md'
                : 'bg-white/15 text-white border border-white/25 backdrop-blur-md'
            }`}>
              {tag === 'الأعلى أجراً' && <CircleDollarSign className="w-2.5 h-2.5" />}
              {tag === 'قربت تخلص' && <Flame className="w-2.5 h-2.5 text-amber-300" />}
              <span>{tag}</span>
            </span>
          )}
        </div>

        {/* Top-Left: Lock "بطلب" pill if application required */}
        {campaign.requiresApplication && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white shadow-sm">
            <Lock className="w-3 h-3 text-white/90" />
            <span>بطلب</span>
          </div>
        )}
      </div>

      {/* Bottom Content Area: Brand + Title + Rate Pill & Budget */}
      <div className="relative z-10 flex flex-col gap-2 text-right mt-auto">
        {/* Brand Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={campaign.brandAvatar}
              alt={campaign.brandName}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30 shrink-0"
            />
            <span className="text-xs font-semibold text-white/90 truncate max-w-[120px]">
              {campaign.brandName}
            </span>
            {campaign.isVerified && (
              <CheckCircle2 className="w-3 h-3 text-white/90 fill-white/20 shrink-0" />
            )}
          </div>

          {/* Social Platforms Icons (shown on Wide and Medium tiles) */}
          {(isWide || isMedium) && (
            <div className="flex items-center gap-1 shrink-0">
              {campaign.platforms.slice(0, 3).map((p) => (
                <div
                  key={p}
                  className="w-4 h-4 rounded-full bg-white/[0.1] border border-white/[0.15] flex items-center justify-center text-white/80"
                >
                  <PlatformIcon platform={p} size={9} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Title */}
        <h3 className={`font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-white transition-colors ${
          isWide
            ? 'text-lg sm:text-xl font-heading'
            : isMedium
            ? 'text-sm sm:text-base font-heading'
            : 'text-xs'
        }`}>
          {campaign.title}
        </h3>

        {/* Bottom Metrics: Rate Pill + Budget (on wide/medium) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.08]">
          {/* Rate Pill: White fill, black text */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-black text-[11px] font-bold shadow-[0_0_12px_rgba(255,255,255,0.45)]">
            <span className="font-mono tabular-nums">{campaign.ratePer1k}</span>
            <RiyalSymbol className="w-2.5 h-2.5 text-black inline-block" />
            <span className="text-[10px] font-normal text-neutral-800">/ 1K</span>
          </div>

          {/* Budget Info on Wide & Medium tiles */}
          {isWide && (
            <div className="flex items-center gap-1 text-xs text-neutral-300 font-mono">
              <span className="text-white/60 font-sans">الميزانية:</span>
              <span className="font-bold text-white tabular-nums">{campaign.totalBudget.toLocaleString()}</span>
              <RiyalSymbol className="w-3 h-3 text-neutral-300 inline-block" />
            </div>
          )}

          {isMedium && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-300 font-mono">
              <span className="text-white/60 font-sans">متبقي:</span>
              <span className="font-bold text-white tabular-nums">
                {(campaign.totalBudget - campaign.spentBudget).toLocaleString()}
              </span>
              <RiyalSymbol className="w-2.5 h-2.5 text-neutral-300 inline-block" />
            </div>
          )}

          {/* On Square tiles: subtle category or time tag */}
          {!isWide && !isMedium && (
            <span className="text-[10px] text-white/50 truncate max-w-[85px]">
              {campaign.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturedBentoGrid: React.FC = () => {
  const { campaigns } = useApp();

  // Pick high-paying and diverse campaigns to populate the Bento Grid
  // Wide fixed tile: highest-paying (جاهز Jahez: 10 SAR / 1K, 120,000 budget, or fallback to highest)
  const fixedHighestCampaign = campaigns.find(c => c.id === 'camp-3') || campaigns[0];

  // Pools for living tiles (never changing at once, staggered intervals 4–6s)
  // Tile 2 (Row 1, Left Square tile, col-span-1): Staggered at 4.2s
  const tile2Pool = [
    campaigns.find(c => c.id === 'camp-8') || campaigns[1], // نينجا (8.5 SAR)
    campaigns.find(c => c.id === 'camp-2') || campaigns[2], // عنوان القهوة (6.5 SAR)
  ].filter(Boolean) as Campaign[];

  // Tile 3 (Row 2, Right Square tile #1, col-span-1): Staggered at 5.4s
  const tile3Pool = [
    campaigns.find(c => c.id === 'camp-7') || campaigns[3], // ريف العطور (7.0 SAR)
    campaigns.find(c => c.id === 'camp-6') || campaigns[4], // بودكاست فنجان (4.5 SAR)
  ].filter(Boolean) as Campaign[];

  // Tile 4 (Row 2, Right Square tile #2, col-span-1): Staggered at 4.7s
  const tile4Pool = [
    campaigns.find(c => c.id === 'camp-4') || campaigns[1], // فالكونز (5.0 SAR)
    campaigns.find(c => c.id === 'camp-9') || campaigns[2], // سوني بست (9.5 SAR)
  ].filter(Boolean) as Campaign[];

  // Tile 5 (Row 2, Left Medium tile, col-span-2): Staggered at 5.9s
  const tile5Pool = [
    campaigns.find(c => c.id === 'camp-1') || campaigns[0], // دخون العشب عطر إمبريال (8.0 SAR, 65k)
    campaigns.find(c => c.id === 'camp-5') || campaigns[3], // لومار للأزياء (9.0 SAR, 40k)
  ].filter(Boolean) as Campaign[];

  return (
    <div className="relative w-full select-none">
      {/* Background soft stage spotlight halo */}
      <div className="absolute -top-10 right-1/4 w-[500px] h-[300px] bg-white/[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* 4-column Bento Grid with staggered entrance animation */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-3 w-full"
      >
        {/* =========================================================================
            ROW 1:
            - WIDE tile spanning 3 columns on the RIGHT (Highest paying, tag "الأعلى أجراً", fixed)
            - 1 SQUARE tile on the LEFT (Living tile, col-span-1)
            ========================================================================= */}
        <BentoTile
          campaignsPool={[fixedHighestCampaign]}
          intervalMs={999999}
          isFixed={true}
          isWide={true}
          customTag="الأعلى أجراً"
          className="col-span-1 md:col-span-3 min-h-[260px] md:h-[280px]"
        />

        <BentoTile
          campaignsPool={tile2Pool}
          intervalMs={4200}
          className="col-span-1 md:col-span-1 min-h-[220px] md:h-[280px]"
        />

        {/* =========================================================================
            ROW 2:
            - 2 SQUARE tiles side by side on the RIGHT (col-span-1 each = 2 cols)
            - 1 MEDIUM tile spanning 2 columns on the LEFT (col-span-2)
            ========================================================================= */}
        <BentoTile
          campaignsPool={tile3Pool}
          intervalMs={5400}
          className="col-span-1 md:col-span-1 min-h-[220px] md:h-[240px]"
        />

        <BentoTile
          campaignsPool={tile4Pool}
          intervalMs={4700}
          className="col-span-1 md:col-span-1 min-h-[220px] md:h-[240px]"
        />

        <BentoTile
          campaignsPool={tile5Pool}
          intervalMs={5900}
          isMedium={true}
          className="col-span-1 md:col-span-2 min-h-[230px] md:h-[240px]"
        />
      </motion.div>
    </div>
  );
};

export default FeaturedBentoGrid;
