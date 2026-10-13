import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../PlatformIcon';
import { SocialPlatform } from '../../types';
import { X, CheckCircle2, Shield, ArrowRight, Lock, Check } from 'lucide-react';

export const ConnectAccountModal: React.FC = () => {
  const {
    isConnectAccountModalOpen,
    setIsConnectAccountModalOpen,
    connectSocialAccount,
  } = useApp();

  const [step, setStep] = useState<'platform' | 'login' | 'permissions' | 'success'>('platform');
  const [platform, setPlatform] = useState<SocialPlatform>('tiktok');
  const [handle, setHandle] = useState('@noura_official');

  if (!isConnectAccountModalOpen) return null;

  const handleChoosePlatform = (p: SocialPlatform) => {
    setPlatform(p);
    setStep('login');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('permissions');
  };

  const handleGrantPermissions = () => {
    connectSocialAccount(platform, handle);
    setStep('success');
  };

  const handleFinish = () => {
    setIsConnectAccountModalOpen(false);
    setStep('platform');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[28px] bg-surface border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        {/* Close Button */}
        <button
          onClick={handleFinish}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'platform' && (
          /* Step 1: Choose platform */
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">ربط حساب تواصل جديد</h2>
              <p className="text-xs text-muted mt-1">اختر المنصة التي تنشر فيها مقاطعك للتحقق التلقائي من المشاهدات</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(['tiktok', 'snapchat', 'instagram', 'youtube', 'x'] as SocialPlatform[]).map((p) => (
                <div
                  key={p}
                  onClick={() => handleChoosePlatform(p)}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                      <PlatformIcon platform={p} size={18} />
                    </div>
                    <span className="text-sm font-semibold text-white capitalize">{p}</span>
                  </div>
                  <span className="text-xs text-white/50">ربط الحساب ←</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'login' && (
          /* Step 2: Login to platform */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.08] flex items-center justify-center text-white">
                <PlatformIcon platform={platform} size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading capitalize">سجل دخولك إلى {platform}</h2>
                <p className="text-xs text-muted">سيتم التحقق عبر البوابة الرسمية للمنصة</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/80">اسم المستخدم أو المعرف (@)</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white placeholder-white/30 font-mono"
                dir="ltr"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/80">كلمة المرور</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                dir="ltr"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all"
            >
              متابعة إلى الأذونات
            </button>
          </form>
        )}

        {step === 'permissions' && (
          /* Step 3: Permissions Screen */
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.08] flex items-center justify-center text-white">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">طلب الأذونات الرسمية</h2>
                <p className="text-xs text-muted">تطبيق Content Rewards يطلب الصلاحيات التالية</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>قراءة عدد المشاهدات والإعجابات للمقاطع المنشورة</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>التحقق من ملكية الحساب وتاريخ رفع الفيديو</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Lock className="w-4 h-4 shrink-0" />
                <span>لا يمكن للمنصة النشر نيابة عنك أو تعديل بياناتك</span>
              </div>
            </div>

            <button
              onClick={handleGrantPermissions}
              className="mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all text-center"
            >
              منح الإذن وتأكيد الربط
            </button>
          </div>
        )}

        {step === 'success' && (
          /* Step 4: Success Screen */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white font-heading">تم ربط حسابك بنجاح!</h2>
              <p className="text-xs text-muted">
                أصبح حساب {handle} في {platform} معتمداً الآن، ويمكنك إرسال مقاطعك مباشرة للربح.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="mt-3 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all"
            >
              تم، العودة إلى الحملات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectAccountModal;
