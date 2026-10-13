import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import CampaignCard from '../../components/CampaignCard';
import UnifiedBudgetInput from '../../components/common/UnifiedBudgetInput';
import CategoryTreePicker from '../../components/common/CategoryTreePicker';
import CampaignCoverUpload from '../../components/common/CampaignCoverUpload';
import ReferenceLinksEditor, { ReferenceLink } from '../../components/common/ReferenceLinksEditor';
import DosDontsEditor from '../../components/common/DosDontsEditor';
import PlatformPicker from '../../components/common/PlatformPicker';
import FieldError, { fieldBorder } from '../../components/common/FieldError';
import { validateStep, firstInvalidStep, CampaignFormValues } from './campaignValidation';
import { SocialPlatform, PaymentModel, Campaign, CampaignType, DesignDetails } from '../../types';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Layers,
  Lock,
  Clock,
  Play,
  PenTool,
  Scissors,
  Smile,
  EyeOff,
  Images,
  Stamp,
  Music,
  Repeat,
  Tv,
  Square,
  Smartphone,
  Image as ImageIcon,
  SlidersHorizontal,
  Palette,
  FileCheck2,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  Info,
  Megaphone
} from 'lucide-react';

// تاريخ اليوم (أو بعد عدد أيام) بصيغة YYYY-MM-DD حسب توقيت جهاز المستخدم
const localDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const CreateCampaignView: React.FC = () => {
  const { 
    setBrandView, 
    brandProfile, 
    addCampaign, 
    setIsFundModalOpen,
    showToast 
  } = useApp();

  // Step 0: Model Selection (Video vs Design)
  const [modelStep, setModelStep] = useState<boolean>(true);
  const [chosenType, setChosenType] = useState<CampaignType>('video');

  // Multi-step form step (1-5 for video, 1-4 for design)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // =========================================================================
  // SHARED FIELDS
  // =========================================================================
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([]);

  // DURATION (Shared): Start date + End date with quick chips
  const [startDate, setStartDate] = useState(localDate(0));
  const [endDate, setEndDate] = useState(localDate(14));
  const [durationPreset, setDurationPreset] = useState<'week' | 'two_weeks' | 'month'>('two_weeks');

  const setDurationByPreset = (preset: 'week' | 'two_weeks' | 'month') => {
    setDurationPreset(preset);
    const start = new Date();
    const end = new Date();
    if (preset === 'week') end.setDate(start.getDate() + 7);
    else if (preset === 'two_weeks') end.setDate(start.getDate() + 14);
    else if (preset === 'month') end.setDate(start.getDate() + 30);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // =========================================================================
  // VIDEO CAMPAIGN SPECIFIC FIELDS
  // =========================================================================
  const [videoBudget, setVideoBudget] = useState(1000);
  const [ratePer1k, setRatePer1k] = useState(7.5);
  const [videoTypes, setVideoTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [access, setAccess] = useState<'open' | 'application'>('open');
  const [screeningQuestion, setScreeningQuestion] = useState('');
  const [rules, setRules] = useState<string[]>([]);
  const [videoDonts, setVideoDonts] = useState<string[]>([]);
  const [requireBioLink, setRequireBioLink] = useState(true);
  const [requireSound, setRequireSound] = useState(true);
  const [requirePreApproval, setRequirePreApproval] = useState(false);
  const [creatorTypes, setCreatorTypes] = useState<string[]>([]);
  const [creatorDescription, setCreatorDescription] = useState('');

  // Styled Video Content Types with individual Icons
  const videoContentOptions = [
    { id: 'Clipping', label: 'Clipping', icon: Scissors },
    { id: 'UGC بوجه', label: 'UGC بوجه', icon: Smile },
    { id: 'UGC بدون وجه', label: 'UGC بدون وجه', icon: EyeOff },
    { id: 'سلايدشو', label: 'سلايدشو', icon: Images },
    { id: 'شعار', label: 'شعار', icon: Stamp },
    { id: 'صوت', label: 'صوت', icon: Music },
    { id: 'إعادة نشر', label: 'إعادة نشر', icon: Repeat },
    { id: 'يوتيوب طويل', label: 'يوتيوب طويل', icon: Tv },
  ];

  const toggleVideoType = (t: string) => {
    setVideoTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  // =========================================================================
  // DESIGN CAMPAIGN SPECIFIC FIELDS
  // a) الطلب, b) المواصفات, c) الميزانية والتسليم, d) الملخص
  // =========================================================================
  const [exactCopy, setExactCopy] = useState('');
  const [designDos, setDesignDos] = useState<string[]>([]);
  const [designDonts, setDesignDonts] = useState<string[]>([]);

  // b) المواصفات: Sizes, Formats, Brand Kit, Bundle
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<number>(4);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(630);

  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [newColorInput, setNewColorInput] = useState('#D97706');
  const [brandFonts, setBrandFonts] = useState('');
  const [isBundle, setIsBundle] = useState<boolean>(false);

  // c) الميزانية والتسليم:
  // Price per design (min 300 SAR), designs needed stepper, revision rounds (0, 1, 2)
  const [pricePerDesign, setPricePerDesign] = useState<number>(300);
  const [designsNeeded, setDesignsNeeded] = useState<number>(1);
  const [revisionRounds, setRevisionRounds] = useState<number>(1);

  // Total calculated budget for design: pricePerDesign * designsNeeded
  const totalDesignBudget = pricePerDesign * designsNeeded;

  const designSizeOptions = [
    { id: 'بوست 1080×1350', label: 'بوست 1080×1350', icon: Smartphone, ratio: '4:5 عمودي' },
    { id: 'مربع 1080×1080', label: 'مربع 1080×1080', icon: Square, ratio: '1:1 مربع' },
    { id: 'ستوري 1080×1920', label: 'ستوري 1080×1920', icon: Smartphone, ratio: '9:16 طولي' },
    { id: 'كاروسيل', label: 'كاروسيل', icon: Layers, ratio: 'شرائح متعددة' },
    { id: 'غلاف يوتيوب 1280×720', label: 'غلاف يوتيوب 1280×720', icon: Tv, ratio: '16:9 عريض' },
    { id: 'مقاس مخصص', label: 'مقاس مخصص', icon: SlidersHorizontal, ratio: 'أبعاد حرة' },
  ];

  const designFormatOptions = [
    'PNG عالي الدقة',
    'JPG',
    'PDF',
    'ملف PSD',
    'ملف AI',
    'رابط Figma',
    'رابط Canva',
  ];

  const toggleSize = (s: string) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleFormat = (f: string) => {
    if (selectedFormats.includes(f)) {
      if (selectedFormats.length > 1) setSelectedFormats(prev => prev.filter(x => x !== f));
    } else {
      setSelectedFormats(prev => [...prev, f]);
    }
  };

  const addBrandColor = () => {
    if (!brandColors.includes(newColorInput)) {
      setBrandColors(prev => [...prev, newColorInput]);
    }
  };

  const removeBrandColor = (c: string) => {
    setBrandColors(prev => prev.filter(color => color !== c));
  };

  // Validation checks
  const isVideoBudgetValid = videoBudget >= 1000;
  const isDesignPriceValid = pricePerDesign >= 300;

  // ===================== حالات الخطأ =====================
  // الأخطاء ما تطلع إلا بعد ما يضغط "متابعة" أو "أطلق"، وبعدها تختفي أول ما يصلّح الخانة
  const [showErrors, setShowErrors] = useState(false);
  const lastStep = chosenType === 'design' ? 4 : 5;

  const formValues: CampaignFormValues = {
    name, description, coverUrl, category, startDate, endDate,
    videoTypes, rules, selectedPlatforms, videoBudget, ratePer1k, access, screeningQuestion,
    exactCopy, designDos, selectedSizes, selectedFormats,
    customWidth, customHeight, carouselSlides, pricePerDesign, designsNeeded,
  };
  const stepErrors = validateStep(chosenType, currentStep, formValues);
  const err = (key: string) => (showErrors ? stepErrors[key] : undefined);

  const scrollToFirstError = () =>
    requestAnimationFrame(() =>
      document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );

  /** التنقل بين الخطوات: الرجوع مسموح دايماً، والتقدّم ما يصير إلا لو الخطوات اللي قبل سليمة */
  const goToStep = (target: number) => {
    if (target <= currentStep) {
      setShowErrors(false);
      setCurrentStep(target);
      return;
    }
    const bad = firstInvalidStep(chosenType, target - 1, formValues);
    if (bad !== null) {
      setCurrentStep(bad);
      setShowErrors(true);
      scrollToFirstError();
      return;
    }
    setShowErrors(false);
    setCurrentStep(target);
  };

  // Live Campaign Preview Object
  const liveCampaignPreview: Campaign = useMemo(() => {
    if (chosenType === 'design') {
      return {
        id: 'preview-camp-design',
        title: name || 'عنوان حملة التصميم',
        brandName: brandProfile.name,
        brandAvatar: brandProfile.logo,
        isVerified: true,
        timeAgo: 'الآن',
        category,
        coverImage: coverUrl,
        platforms: [], // التصميم: صاحب الحملة هو اللي ينشره، فما فيه منصات
        requiresApplication: false,
        campaignType: 'design',
        paymentModel: 'design_fixed',
        ratePer1k: 0,
        spentBudget: 0,
        totalBudget: totalDesignBudget,
        participantsCount: 0,
        status: 'live',
        description,
        allowedTypes: ['تصميم', 'جرافيك', 'سوشال ميديا'],
        startDate,
        endDate,
        designDetails: {
          exactCopy,
          sizes: selectedSizes,
          customWidth: selectedSizes.includes('مقاس مخصص') ? customWidth : undefined,
          customHeight: selectedSizes.includes('مقاس مخصص') ? customHeight : undefined,
          carouselSlidesCount: selectedSizes.includes('كاروسيل') ? carouselSlides : undefined,
          formats: selectedFormats,
          brandColors,
          brandFonts,
          isBundle,
          pricePerDesign,
          totalDesignsNeeded: designsNeeded,
          acceptedDesignsCount: 0,
          deadline: 'باقي 14 يوم',
          revisionRoundsAllowed: revisionRounds,
        },
        referenceLinks,
        dos: designDos,
        donts: designDonts,
        payoutRules: [],
      };
    }

    // Video Campaign Preview
    return {
      id: 'preview-camp-video',
      title: name || 'عنوان الحملة الجديد',
      brandName: brandProfile.name,
      brandAvatar: brandProfile.logo,
      isVerified: true,
      timeAgo: 'الآن',
      category,
      coverImage: coverUrl,
      platforms: selectedPlatforms,
      requiresApplication: access === 'application',
      screeningQuestion: access === 'application' ? screeningQuestion.trim() : undefined,
      campaignType: 'video',
      paymentModel: 'cpm',
      ratePer1k,
      spentBudget: 0,
      totalBudget: videoBudget,
      participantsCount: 0,
      status: 'live',
      description,
      allowedTypes: videoTypes,
      startDate,
      endDate,
      referenceLinks,
      dos: rules,
      donts: videoDonts,
      payoutRules: selectedPlatforms.map(p => ({
        platform: p,
        ratePer1k,
        minPayout: Math.round(ratePer1k * 10),
        maxPayout: 5000,
      })),
    };
  }, [
    chosenType,
    name,
    brandProfile,
    category,
    coverUrl,
    referenceLinks,
    description,
    startDate,
    endDate,
    selectedPlatforms,
    access,
    screeningQuestion,
    ratePer1k,
    videoBudget,
    videoTypes,
    rules,
    videoDonts,
    totalDesignBudget,
    exactCopy,
    selectedSizes,
    customWidth,
    customHeight,
    carouselSlides,
    selectedFormats,
    brandColors,
    brandFonts,
    isBundle,
    pricePerDesign,
    designsNeeded,
    revisionRounds,
    designDos,
    designDonts
  ]);

  const handleLaunch = () => {
    const bad = firstInvalidStep(chosenType, lastStep - 1, formValues);
    if (bad !== null) {
      setCurrentStep(bad);
      setShowErrors(true);
      scrollToFirstError();
      showToast('فيه خانات ناقصة، كمّلها قبل الإطلاق');
      return;
    }
    addCampaign(liveCampaignPreview);
    setIsFundModalOpen(true);
    setBrandView('campaigns');
    showToast(chosenType === 'design' ? 'تم إنشاء حملة التصميم بنجاح!' : 'تم إنشاء حملة المقاطع بنجاح!');
  };

  return (
    <div className="relative pb-36 px-6 pt-6 flex flex-col gap-8 max-w-[1440px] mx-auto text-right select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!modelStep) {
                setModelStep(true);
              } else {
                setBrandView('dashboard');
              }
            }}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-heading">
              {modelStep ? 'إنشاء وإطلاق حملة جديدة' : chosenType === 'design' ? 'إطلاق حملة تصميم جرافيك' : 'إطلاق حملة مقاطع وفيديوهات'}
            </h1>
            <p className="text-xs text-[#A3A3A3]">
              {modelStep ? 'اختر نوع الحملة التي ترغب في تمويلها ومكافأة المبدعين عليها' : 'حدد التفاصيل والمواصفات والميزانية المطلوبة'}
            </p>
          </div>
        </div>

        {/* Form Steps Indicator (When inside a form) */}
        {!modelStep && (
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto py-1">
            {(chosenType === 'design'
              ? [
                  { num: 1, label: 'الطلب' },
                  { num: 2, label: 'المواصفات' },
                  { num: 3, label: 'الميزانية والتسليم' },
                  { num: 4, label: 'المعاينة' },
                ]
              : [
                  { num: 1, label: 'التفاصيل' },
                  { num: 2, label: 'الشروط' },
                  { num: 3, label: 'الميزانية' },
                  { num: 4, label: 'صانع المحتوى' },
                  { num: 5, label: 'المعاينة' },
                ]
            ).map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => goToStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                  currentStep === s.num
                    ? 'bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : currentStep > s.num
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/[0.02] text-white/40 border-white/[0.06]'
                }`}
              >
                <span className="font-mono">{s.num}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          1) "اختر نموذج الدفع للحملة" SCREEN — SIMPLIFY TO TWO TYPES
          - No Retainer option
          - Two large glass cards with line icons:
            a) "حملة مقاطع" (play/eye)
            b) "حملة تصميم" (pen-tool)
          - Subtitle: "كيف تبي تكافئ صناع المحتوى؟"
          ========================================================================= */}
      {modelStep ? (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              اختر نموذج الدفع للحملة
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              كيف تبي تكافئ صناع المحتوى؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            {/* Card 1: حملة مقاطع */}
            <div
              onClick={() => {
                setChosenType('video');
                setModelStep(false);
                setCurrentStep(1);
                setShowErrors(false);
              }}
              className="p-7 rounded-[28px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] hover:border-white/50 hover:bg-white/[0.08] hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,255,255,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.15] text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all shadow-sm">
                  <Play className="w-7 h-7 fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    حملة مقاطع
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
                    تدفع لكل 1,000 مشاهدة حقيقية معتمدة — مقاطع كليبنغ وUGC مخصصة لمنصات التواصل.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-white group-hover:text-white">
                <span>اختيار حملة المقاطع</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: حملة تصميم */}
            <div
              onClick={() => {
                setChosenType('design');
                setModelStep(false);
                setCurrentStep(1);
                setShowErrors(false);
              }}
              className="p-7 rounded-[28px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] hover:border-white/50 hover:bg-white/[0.08] hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,255,255,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.15] text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all shadow-sm">
                  <PenTool className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    حملة تصميم
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
                    تدفع مبلغ ثابت لكل تصميم تقبله، والتصميم يصير ملكك — مصممون محترفون يبدعون منشورات لبراندك.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-white group-hover:text-white">
                <span>اختيار حملة التصميم</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           2) DYNAMIC CREATE-CAMPAIGN FORM
           ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Fields (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* =====================================================================
                CASE A: VIDEO CAMPAIGN STEPS
                ===================================================================== */}
            {chosenType === 'video' && (
              <>
                {/* Video Step 1: التفاصيل والمدة */}
                {currentStep === 1 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">1. تفاصيل وهوية حملة المقاطع</h2>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/80">عنوان الحملة</label>
                      <input
                        type="text"
                        maxLength={50}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: حملة إطلاق عطر ليالي الشرق"
                        className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('name'))} text-xs text-white`}
                        required
                      />
                      <FieldError message={err('name')} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/80">وصف الحملة والأفكار المطلوبة</label>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="مثال: نبي مقاطع تبيّن ثبات العطر ولقطات فتح العبوة..."
                        className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(err('description'))} text-xs text-white resize-none leading-relaxed`}
                        required
                      />
                      <FieldError message={err('description')} />
                    </div>

                    <CampaignCoverUpload value={coverUrl} onChange={setCoverUrl} error={err('cover')} />

                    {/* Shared: Category Tree Dropdown */}
                    <CategoryTreePicker
                      value={category}
                      onChange={setCategory}
                      label="تصنيف الحملة (شجرة تصنيفات متفرعة)"
                    />
                    <FieldError message={err('category')} />

                    {/* Shared: Campaign Duration with Quick Chips */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-semibold text-white/90">مدة الحملة ونطاق النشر</label>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-white/50">تحديد سريع:</span>
                        {[
                          { id: 'week', label: 'أسبوع' },
                          { id: 'two_weeks', label: 'أسبوعين' },
                          { id: 'month', label: 'شهر' },
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => setDurationByPreset(chip.id as any)}
                            className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                              durationPreset === chip.id
                                ? 'bg-white text-black font-bold shadow-sm'
                                : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/50">تاريخ البداية</span>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/50">تاريخ النهاية</span>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <FieldError message={err('dates')} />
                    </div>

                    {/* Restyled "أنواع المحتوى المقبول" WITH ICONS & Proper Unselected/Selected State */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-semibold text-white/90">أنواع المحتوى المقبول (اختر نوعاً أو أكثر)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {videoContentOptions.map((opt) => {
                          const isSelected = videoTypes.includes(opt.id);
                          const Icon = opt.icon;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleVideoType(opt.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                  : 'bg-white/[0.03] text-white/60 border-white/[0.1] hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      <FieldError message={err('videoTypes')} />
                    </div>
                  </div>
                )}

                {/* Video Step 2: الشروط */}
                {currentStep === 2 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">2. شروط وتعليمات مقاطع الفيديو</h2>
                    
                    <DosDontsEditor
                      dos={rules}
                      donts={videoDonts}
                      onDosChange={setRules}
                      onDontsChange={setVideoDonts}
                      divider={false}
                    />
                    
                    <FieldError message={err('dos')} />

                    <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.08]">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-white/80">إلزام الصانع بوضع رابط المتجر في البايو</span>
                        <input
                          type="checkbox"
                          checked={requireBioLink}
                          onChange={(e) => setRequireBioLink(e.target.checked)}
                          className="rounded border-white/20 bg-white/10 text-white"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-white/80">إلزام الصانع باستخدام الصوت المعتمد</span>
                        <input
                          type="checkbox"
                          checked={requireSound}
                          onChange={(e) => setRequireSound(e.target.checked)}
                          className="rounded border-white/20 bg-white/10 text-white"
                        />
                      </label>
                    </div>

                    <ReferenceLinksEditor value={referenceLinks} onChange={setReferenceLinks} />
                  </div>
                )}

                {/* Video Step 3: الميزانية والإعدادات */}
                {currentStep === 3 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">3. ميزانية الحملة والمنصات</h2>

                    <PlatformPicker value={selectedPlatforms} onChange={setSelectedPlatforms} error={err('platforms')} />

                    {/* Unified Budget Component (Min 1,000 SAR) */}
                    <UnifiedBudgetInput
                      value={videoBudget}
                      onChange={setVideoBudget}
                      min={1000}
                      label="إجمالي ميزانية الحملة (الحد الأدنى 1,000 ﷼)"
                      campaignType="video"
                    />
                    <FieldError message={err('budget')} />

                    {/* Rate per 1K Views */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-medium text-white/80">معدل العائد لكل 1,000 مشاهدة (CPM)</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          step="0.5"
                          value={ratePer1k}
                          onChange={(e) => setRatePer1k(Number(e.target.value))}
                          className={`w-full h-11 pr-4 pl-12 rounded-xl bg-white/[0.05] border ${fieldBorder(err('rate'))} text-sm text-white font-mono font-bold`}
                        />
                        <RiyalSymbol className="absolute left-3.5 w-3.5 h-3.5 text-white/80" />
                      </div>
                      <FieldError message={err('rate')} />
                    </div>

                    {/* Access: مفتوحة / بطلب */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-medium text-white/80">طريقة الانضمام للحملة</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setAccess('open')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            access === 'open'
                              ? 'bg-white/[0.1] border-white text-white font-bold'
                              : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                          }`}
                        >
                          <span className="text-xs block">مفتوحة للجميع</span>
                          <span className="text-[10px] text-white/50">أي صانع يرفع رابطه مباشرة</span>
                        </div>
                        <div
                          onClick={() => setAccess('application')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            access === 'application'
                              ? 'bg-white/[0.1] border-white text-white font-bold'
                              : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                          }`}
                        >
                          <span className="text-xs block flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>بطلب وموافقة مسبقة</span>
                          </span>
                          <span className="text-[10px] text-white/50">تراجع ملف الصانع قبل مشاركته</span>
                        </div>
                      </div>
                    </div>

                    {/* سؤال للمتقدمين: يظهر بس لما تكون الحملة بطلب وموافقة */}
                    {access === 'application' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-white/80">سؤال للمتقدمين</label>
                        <input
                          type="text"
                          maxLength={150}
                          value={screeningQuestion}
                          onChange={(e) => setScreeningQuestion(e.target.value)}
                          placeholder="مثال: عندك تجربة سابقة في مراجعة العطور؟"
                          className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('screeningQuestion'))} text-xs text-white`}
                        />
                        <span className="text-[10px] text-white/45">يجاوب عليه صانع المحتوى لما يقدّم على الحملة</span>
                        <FieldError message={err('screeningQuestion')} />
                      </div>
                    )}
                  </div>
                )}

                {/* Video Step 4: صانع المحتوى المطلوب */}
                {currentStep === 4 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">4. مواصفات صانع المحتوى المطلوب</h2>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-white/80">نوع الصانع المستهدف</label>
                      <div className="flex flex-wrap gap-2">
                        {['Clipper', 'UGC', 'مونتير', 'مؤثر'].map((ct) => (
                          <button
                            key={ct}
                            type="button"
                            onClick={() => {
                              setCreatorTypes(prev => prev.includes(ct) ? prev.filter(x => x !== ct) : [...prev, ct]);
                            }}
                            className={`py-1.5 px-3.5 rounded-full text-xs font-medium border transition-all ${
                              creatorTypes.includes(ct)
                                ? 'bg-white text-black border-white font-bold'
                                : 'bg-white/[0.03] text-white/70 border-white/[0.1]'
                            }`}
                          >
                            {ct}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-white/80">معايير إضافية للصناع</label>
                      <textarea
                        rows={3}
                        value={creatorDescription}
                        onChange={(e) => setCreatorDescription(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Video Step 5: الملخص */}
                {currentStep === 5 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-white" />
                      <h2 className="text-lg font-bold text-white font-heading">5. مراجعة وإطلاق حملة المقاطع</h2>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-white/60">العنوان:</span>
                        <span className="font-bold text-white">{name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-white/60">إجمالي الميزانية:</span>
                        <span className="font-mono font-bold text-white">{videoBudget.toLocaleString()} <RiyalSymbol /></span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-white/60">المعدل:</span>
                        <span className="font-mono font-bold text-white">{ratePer1k} <RiyalSymbol /> / 1K</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunch}
                      className="mt-2 w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>اشحن وأطلق الحملة الآن</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* =====================================================================
                CASE B: DESIGN CAMPAIGN STEPS
                a) الطلب, b) المواصفات, c) الميزانية والتسليم, d) الملخص
                ===================================================================== */}
            {chosenType === 'design' && (
              <>
                {/* Design Step 1: الطلب */}
                {currentStep === 1 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">1. تفاصيل طلب التصميم</h2>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/80">عنوان حملة التصميم</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: بوستات عرض الجمعة البيضاء"
                        className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border ${fieldBorder(err('name'))} text-xs text-white`}
                        required
                      />
                      <FieldError message={err('name')} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/80">فكرة التصميم والهدف التسويقي</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="اشرح الفكرة والجو العام المطلوب للتصاميم..."
                        className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(err('description'))} text-xs text-white resize-none leading-relaxed`}
                        required
                      />
                      <FieldError message={err('description')} />
                    </div>

                    <CampaignCoverUpload value={coverUrl} onChange={setCoverUrl} error={err('cover')} />

                    {/* Exact text/copy to appear on the design */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/90">النص والعبارات المطلوبة في التصميم (Exact Copy)</label>
                      <textarea
                        rows={2}
                        value={exactCopy}
                        onChange={(e) => setExactCopy(e.target.value)}
                        placeholder="اكتب الجمل والكلمات ونسبة الخصم التي يجب أن تظهر بدقة داخل التصميم..."
                        className={`w-full p-3 rounded-xl bg-white/[0.05] border ${fieldBorder(err('exactCopy'))} text-xs text-white resize-none font-sans`}
                        required
                      />
                      <FieldError message={err('exactCopy')} />
                    </div>

                    {/* Category Tree Picker */}
                    <CategoryTreePicker
                      value={category}
                      onChange={setCategory}
                      label="تصنيف الحملة (شجرة تصنيفات متفرعة)"
                    />
                    <FieldError message={err('category')} />

                    {/* Duration with "آخر موعد للتسليم" Label */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/90">فترة الاستقبال وموعد التسليم</label>
                        <span className="text-[11px] text-amber-300 font-medium">آخر موعد للتسليم</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-white/50">تحديد سريع:</span>
                        {[
                          { id: 'week', label: 'أسبوع' },
                          { id: 'two_weeks', label: 'أسبوعين' },
                          { id: 'month', label: 'شهر' },
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => setDurationByPreset(chip.id as any)}
                            className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                              durationPreset === chip.id
                                ? 'bg-white text-black font-bold shadow-sm'
                                : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/50">تاريخ بدء الاستقبال</span>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/50">آخر موعد للتسليم (الموعد النهائي)</span>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <FieldError message={err('dates')} />
                    </div>

                    {/* Do's and Don'ts */}
                    <DosDontsEditor
                      dos={designDos}
                      donts={designDonts}
                      onDosChange={setDesignDos}
                      onDontsChange={setDesignDonts}
                    />
                    <FieldError message={err('dos')} />
                  </div>
                )}

                {/* Design Step 2: المواصفات */}
                {currentStep === 2 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">2. مواصفات التصميم وهوية البراند</h2>

                    {/* Sizes Multi-select chips with small shape icons */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/90">المقاسات المطلوبة (اختر المقاسات المستهدفة)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {designSizeOptions.map((opt) => {
                          const isSel = selectedSizes.includes(opt.id);
                          const Icon = opt.icon;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => toggleSize(opt.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                                isSel
                                  ? 'bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.35)]'
                                  : 'bg-white/[0.03] text-white/70 border-white/[0.1] hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <Icon className="w-4 h-4 shrink-0" />
                                {isSel && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <span className="text-xs font-bold leading-tight">{opt.label}</span>
                              <span className={`text-[10px] ${isSel ? 'text-black/60 font-medium' : 'text-white/40'}`}>
                                {opt.ratio}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Carousel Slides Input if Carousel is selected */}
                      {selectedSizes.includes('كاروسيل') && (
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-between mt-1">
                          <span className="text-xs text-white">عدد شرائح الكاروسيل المطلوبة:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={2}
                              max={10}
                              value={carouselSlides}
                              onChange={(e) => setCarouselSlides(Math.max(2, Number(e.target.value)))}
                              className="w-16 h-8 text-center rounded-lg bg-black/40 border border-white/20 text-xs font-mono font-bold text-white"
                            />
                            <span className="text-xs text-white/60">شرائح</span>
                          </div>
                        </div>
                      )}

                      {/* Custom Size Inputs if Custom is selected */}
                      {selectedSizes.includes('مقاس مخصص') && (
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-between gap-3 mt-1">
                          <span className="text-xs text-white">الأبعاد المخصصة (بالبكسل):</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(Number(e.target.value))}
                              placeholder="العرض"
                              className="w-20 h-8 text-center rounded-lg bg-black/40 border border-white/20 text-xs font-mono text-white"
                            />
                            <span className="text-xs text-white/40">×</span>
                            <input
                              type="number"
                              value={customHeight}
                              onChange={(e) => setCustomHeight(Number(e.target.value))}
                              placeholder="الارتفاع"
                              className="w-20 h-8 text-center rounded-lg bg-black/40 border border-white/20 text-xs font-mono text-white"
                            />
                          </div>
                        </div>
                      )}
                      <FieldError message={err('sizes')} />
                    </div>

                    {/* Required Delivery Formats (Multi-select) */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-semibold text-white/90">صيغ التسليم الإلزامية من المصمم</label>
                      <div className="flex flex-wrap gap-2">
                        {designFormatOptions.map((fmt) => {
                          const isSel = selectedFormats.includes(fmt);
                          return (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => toggleFormat(fmt)}
                              className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                                isSel
                                  ? 'bg-white text-black border-white font-bold shadow-sm'
                                  : 'bg-white/[0.03] text-white/60 border-white/[0.1] hover:text-white hover:bg-white/[0.06]'
                              }`}
                            >
                              <span>{fmt}</span>
                            </button>
                          );
                        })}
                      </div>
                      <FieldError message={err('formats')} />
                    </div>

                    {/* Brand Kit: Colors + Swatches + Fonts */}
                    <div className="flex flex-col gap-3 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-semibold text-white/90">ألوان وهوية البراند (Brand Kit)</label>
                      
                      {/* Color Swatch Picker */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {brandColors.map((col) => (
                          <div key={col} className="relative group">
                            <div
                              className="w-8 h-8 rounded-full border border-white/30 shadow-sm flex items-center justify-center cursor-pointer"
                              style={{ backgroundColor: col }}
                            />
                            <button
                              type="button"
                              onClick={() => removeBrandColor(col)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center gap-1.5 mr-2">
                          <input
                            type="color"
                            value={newColorInput}
                            onChange={(e) => setNewColorInput(e.target.value)}
                            className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={addBrandColor}
                            className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/20 text-xs text-white"
                          >
                            + إضافة لون
                          </button>
                        </div>
                      </div>

                      {/* Brand Fonts */}
                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-xs text-white/70">خطوط البراند الرسمية</label>
                        <input
                          type="text"
                          value={brandFonts}
                          onChange={(e) => setBrandFonts(e.target.value)}
                          placeholder="مثال: Alexandria, Readex Pro"
                          className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Toggle: التسليم مجموعة واحدة */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.1] flex items-center justify-between cursor-pointer">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">التسليم مجموعة واحدة (Bundle)</span>
                        <span className="text-[10px] text-white/50">
                          يرسل المصمم سلسلة التصاميم أو الكاروسيل كاملة كعمل واحد يُقبل أو يُرفض معاً
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isBundle}
                        onChange={(e) => setIsBundle(e.target.checked)}
                        className="rounded border-white/20 bg-white/10 text-white"
                      />
                    </div>

                    <ReferenceLinksEditor value={referenceLinks} onChange={setReferenceLinks} />
                  </div>
                )}

                {/* Design Step 3: الميزانية والتسليم */}
                {currentStep === 3 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-white font-heading">3. ميزانية التصميم وحصص الاستلام</h2>

                    {/* Price per design input (Unified budget component with min 300) */}
                    <UnifiedBudgetInput
                      value={pricePerDesign}
                      onChange={setPricePerDesign}
                      min={300}
                      label="سعر التصميم المقبول الواحد (الحد الأدنى 300 ﷼)"
                      campaignType="design"
                    />
                    <FieldError message={err('price')} />

                    {/* Number of designs needed (Stepper) */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/90">عدد التصاميم المطلوب قبولها</label>
                        <span className="text-xs font-mono font-bold text-white">{designsNeeded} تصاميم</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setDesignsNeeded(p => Math.max(1, p - 1))}
                          className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-lg font-bold text-white flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex-1 h-10 rounded-xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-sm font-bold text-white font-mono">
                          {designsNeeded} تصاميم
                        </div>
                        <button
                          type="button"
                          onClick={() => setDesignsNeeded(p => p + 1)}
                          className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-lg font-bold text-white flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total Budget Calculated Live */}
                    <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.14] flex items-center justify-between">
                      <span className="text-xs text-white/70">إجمالي الميزانية المحسوبة تلقائياً:</span>
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-xs text-white/50">{pricePerDesign} <RiyalSymbol /> × {designsNeeded} =</span>
                        <span className="text-xl font-black text-white">{totalDesignBudget.toLocaleString()}</span>
                        <RiyalSymbol className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Revision Rounds Allowed: 0 / 1 / 2 */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                      <label className="text-xs font-semibold text-white/90">جولات التعديل المسموح بطلبها من المصمم</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 0, label: 'بدون تعديلات (قبول/رفض فوري)' },
                          { val: 1, label: 'جولة تعديل واحدة (1)' },
                          { val: 2, label: 'جولتان تعديل (2)' },
                        ].map((r) => (
                          <button
                            key={r.val}
                            type="button"
                            onClick={() => setRevisionRounds(r.val)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              revisionRounds === r.val
                                ? 'bg-white text-black border-white font-bold shadow-sm'
                                : 'bg-white/[0.03] text-white/60 border-white/[0.1] hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-bold block">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fixed Rule Info Line */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.1] flex items-center gap-2.5 text-xs text-white/80">
                      <Info className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>قاعدة ثابتة: كل مصمم يرسل تصميماً واحداً فقط في هذه الحملة لضمان تنوع الأفكار.</span>
                    </div>
                  </div>
                )}

                {/* Design Step 4: الملخص */}
                {currentStep === 4 && (
                  <div className="p-6 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-white" />
                      <h2 className="text-lg font-bold text-white font-heading">4. ملخص ومراجعة حملة التصميم</h2>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-white/60">العنوان:</span>
                        <span className="font-bold text-white">{name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-white/60">سعر كل تصميم:</span>
                        <span className="font-mono font-bold text-white">{pricePerDesign} <RiyalSymbol /></span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-white/60">العدد المطلوب:</span>
                        <span className="font-mono font-bold text-white">{designsNeeded} تصاميم</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.06]">
                        <span className="text-white/60">إجمالي الميزانية:</span>
                        <span className="font-mono font-bold text-emerald-400">{totalDesignBudget.toLocaleString()} <RiyalSymbol /></span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-white/60">جولات التعديل:</span>
                        <span className="text-white font-bold">{revisionRounds} جولة</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunch}
                      className="mt-2 w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>اشحن وأطلق حملة التصميم الآن</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(currentStep - 1)}
                  className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  رجوع
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModelStep(true)}
                  className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  تغيير النموذج
                </button>
              )}

              <div className="flex items-center gap-2">
                {currentStep < (chosenType === 'design' ? 4 : 5) && (
                  <button
                    type="button"
                    onClick={() => goToStep(currentStep + 1)}
                    className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_16px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>متابعة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Left: LIVE "ملخص الحملة" Glass Panel that updates as you type! (O4 specification) */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white/70">معاينة بطاقة الحملة في صفحة اكتشف:</span>
              <span className="text-[10px] text-emerald-400">مباشر وحي</span>
            </div>

            {/* Live Card (Design vs Video Card) */}
            <CampaignCard campaign={liveCampaignPreview} />

            {/* Live Details Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2 text-[11px] text-[#A3A3A3]">
              <div className="flex items-center justify-between">
                <span>نوع الحملة:</span>
                <span className="text-white font-bold">
                  {chosenType === 'design' ? 'حملة تصميم جرافيك' : 'حملة مقاطع وفيديوهات'}
                </span>
              </div>
              {chosenType === 'design' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>قيمة التصميم الواحد:</span>
                    <span className="font-mono text-white font-bold">{pricePerDesign} <RiyalSymbol /></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الحصص المتاحة:</span>
                    <span className="font-mono text-white font-bold">{designsNeeded} مقاعد</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <span>المشاهدات المتوقعة:</span>
                  <span className="font-mono text-white font-bold">
                    {Math.round((videoBudget / (ratePer1k || 1)) * 1000).toLocaleString()} مشاهدة
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaignView;