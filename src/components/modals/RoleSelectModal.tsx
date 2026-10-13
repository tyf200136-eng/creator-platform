import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Video,
  Megaphone,
  ArrowLeft,
  Star
} from 'lucide-react';

export const RoleSelectModal: React.FC = () => {
  const {
    isRoleSelectModalOpen,
    setIsRoleSelectModalOpen,
    setRole,
    setCreatorView,
    setBrandView,
    setIsCreatorOnboardingOpen,
    setIsBrandOnboardingOpen,
  } = useApp();

  if (!isRoleSelectModalOpen) return null;

  const handleChooseCreator = () => {
    setRole('creator');
    setCreatorView('discover');
    setIsRoleSelectModalOpen(false);
    setIsCreatorOnboardingOpen(true);
  };

  const handleChooseBrand = () => {
    setRole('brand');
    setBrandView('dashboard');
    setIsRoleSelectModalOpen(false);
    setIsBrandOnboardingOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[32px] bg-surface border border-white/[0.18] p-8 text-right shadow-[0_24px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(255,255,255,0.08)]">
        {/* Close Button */}
        <button
          onClick={() => setIsRoleSelectModalOpen(false)}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex flex-col gap-2 mb-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            وش تبي تسوي؟
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            اختر مسارك في المنصة، وبإمكانك التبديل بين الدورين في أي وقت بضغطة زر
          </p>
        </div>

        {/* Two Big Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: ابدأ اربح (Creator) */}
          <div
            onClick={handleChooseCreator}
            className="group relative rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.16] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.3] hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* Recommended Badge */}
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold shadow-[0_0_12px_rgba(255,255,255,0.6)] flex items-center gap-1">
              <Star className="w-3 h-3 fill-black" />
              <span>الأكثر اختياراً</span>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.14] flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Video className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading mb-1.5 group-hover:text-white">
                  ابدأ اربح كصانع محتوى
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  قص وشارك مقاطع الفيديو القصيرة على حساباتك، واحصل على أرباح فورية مقابل كل 1,000 مشاهدة تحققها.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:underline">
                ابدأ رحلة الربح
              </span>
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: أطلق حملة (Brand Owner) */}
          <div
            onClick={handleChooseBrand}
            className="group relative rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.14] p-6 flex flex-col justify-between cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.3] hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col gap-4 mt-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.14] flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Megaphone className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading mb-1.5 group-hover:text-white">
                  أطلق حملة لبراندك
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  أنشئ ميزانية تسويقية، حدد سعر كل 1,000 مشاهدة، واجعل مئات صناع المحتوى ينشرون لعلامتك التجارية.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:underline">
                إطلاق حملة جديدة
              </span>
              <div className="w-8 h-8 rounded-full bg-white/[0.12] border border-white/20 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectModal;
