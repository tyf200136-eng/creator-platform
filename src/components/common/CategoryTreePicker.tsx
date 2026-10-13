import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  Gamepad2,
  Music,
  Tv,
  Trophy,
  Cpu,
  Coins,
  Briefcase,
  Compass,
  HeartPulse,
  GraduationCap,
  UserCheck,
  ShoppingBag,
  PartyPopper,
  Palette,
  X,
  Tag
} from 'lucide-react';

export interface CategoryNode {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subCategories: string[];
}

export const CATEGORY_TREE_DATA: CategoryNode[] = [
  {
    id: 'entertainment',
    name: 'ترفيه',
    icon: Tv,
    subCategories: ['كوميديا ومقالب', 'مسلسلات وسينما', 'بودكاست ترفيهي', 'أنيمي وفانتيزي'],
  },
  {
    id: 'music',
    name: 'موسيقى',
    icon: Music,
    subCategories: ['شيلات وأهازيج', 'عزف وآلات موسيقية', 'إنتاج ومؤثرات صوتية'],
  },
  {
    id: 'gaming',
    name: 'ألعاب',
    icon: Gamepad2,
    subCategories: ['رياضات إلكترونية', 'ألعاب شوتر وFPS', 'فيفا وكرة قدم', 'مراجعات وتجارب ألعاب'],
  },
  {
    id: 'sports',
    name: 'رياضة',
    icon: Trophy,
    subCategories: ['دوري روشن السعودي', 'تمارين ولياقة بدنية', 'رياضات قتالية', 'بادل وتنس'],
  },
  {
    id: 'tech',
    name: 'تقنية',
    icon: Cpu,
    subCategories: ['هواتف ذكية وملحقات', 'ذكاء اصطناعي وتطبيقات', 'حواسيب وتجميعات', 'أجهزة ذكية ومنزلية'],
  },
  {
    id: 'finance',
    name: 'مال واستثمار',
    icon: Coins,
    subCategories: ['تداول وسوق الأسهم السعودي', 'عقارات وتطوير عقاري', 'ثقافة مالية واستثمار شخصي', 'تقنيات مالية Fintech'],
  },
  {
    id: 'business',
    name: 'أعمال',
    icon: Briefcase,
    subCategories: ['تجارة إلكترونية ومتاجر', 'ريادة أعمال وشركات ناشئة', 'تسويق وصناعة محتوى', 'استيراد وسلاسل إمداد'],
  },
  {
    id: 'lifestyle',
    name: 'لايف ستايل',
    icon: Compass,
    subCategories: ['فلوقات ويوميات', 'سفر وسياحة داخلية/خارجية', 'تجارب ومغامرات', 'ديكور وترتيب منزل'],
  },
  {
    id: 'health',
    name: 'صحة ولياقة',
    icon: HeartPulse,
    subCategories: ['تغذية وأنظمة غذائية', 'كمال أجسام وبناء عضلات', 'صحة نفسية وجودة حياة', 'يوجا واستشفاء'],
  },
  {
    id: 'education',
    name: 'تعليم',
    icon: GraduationCap,
    subCategories: ['تعلم لغات', 'مهارات رقمية وبرمجة', 'تطوير ذات وإنتاجية', 'إرشاد جامعي ومهني'],
  },
  {
    id: 'personal_brand',
    name: 'براند شخصي',
    icon: UserCheck,
    subCategories: ['صناع محتوى مستقلين', 'مستشارون وخبراء', 'متحدثون ملهمون'],
  },
  {
    id: 'consumer_products',
    name: 'منتجات استهلاكية',
    icon: ShoppingBag,
    subCategories: [
      'عطور فاخرة',
      'أزياء وعبايات',
      'تجميل وعناية شخصية',
      'مطاعم ومقاهي',
      'إلكترونيات استهلاكية',
    ],
  },
  {
    id: 'events',
    name: 'فعاليات',
    icon: PartyPopper,
    subCategories: ['مواسم ومهرجانات وطنية', 'معارض ومؤتمرات', 'حفلات وتجمعات'],
  },
  {
    id: 'art_design',
    name: 'فن وتصميم',
    icon: Palette,
    subCategories: ['تصميم جرافيك وهوية بصرية', 'رسم وفنون تشكيلية', 'تصوير سينمائي ومونتاج', 'خط عربي وزخرفة'],
  },
];

interface CategoryTreePickerProps {
  value: string;
  onChange: (category: string) => void;
  label?: string;
  placeholder?: string;
}

export const CategoryTreePicker: React.FC<CategoryTreePickerProps> = ({
  value,
  onChange,
  label = 'التصنيف',
  placeholder = 'اختر تصنيفاً من القائمة أو ابحث...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORY_TREE_DATA;

    return CATEGORY_TREE_DATA.map(cat => {
      const catMatches = cat.name.toLowerCase().includes(q);
      const matchingSubs = cat.subCategories.filter(sub =>
        sub.toLowerCase().includes(q)
      );

      if (catMatches || matchingSubs.length > 0) {
        return {
          ...cat,
          subCategories: matchingSubs.length > 0 ? matchingSubs : cat.subCategories,
          forceExpand: true,
        };
      }
      return null;
    }).filter(Boolean) as (CategoryNode & { forceExpand?: boolean })[];
  }, [search]);

  // Auto-expand all matching categories when searching
  useEffect(() => {
    if (search.trim()) {
      setExpandedNodes(CATEGORY_TREE_DATA.map(c => c.id));
    }
  }, [search]);

  const selectItem = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative flex flex-col gap-1.5 w-full text-right" ref={dropdownRef}>
      {label && <label className="text-xs font-semibold text-white/80">{label}</label>}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] hover:border-white/30 text-xs text-white flex items-center justify-between transition-all cursor-pointer shadow-sm focus:outline-none focus:border-white"
      >
        <div className="flex items-center gap-2 truncate">
          <Tag className="w-3.5 h-3.5 text-white/60 shrink-0" />
          <span className={value ? 'text-white font-medium' : 'text-white/40'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Modal/Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 left-0 z-50 rounded-2xl bg-surface border border-white/[0.18] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_25px_rgba(255,255,255,0.06)] flex flex-col gap-2 max-h-[380px] overflow-hidden animate-in fade-in duration-150">
          {/* Search Input Box */}
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في التصنيفات (عطور، ألعاب، بودكاست...)"
              className="w-full h-9 pr-9 pl-8 rounded-lg bg-white/[0.06] border border-white/[0.12] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
              autoFocus
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tree Categories List */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-1 pr-1 pl-1 scrollbar-thin">
            {filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/40">
                لا توجد نتائج مطابقة للبحث
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isExpanded = expandedNodes.includes(cat.id);
                const Icon = cat.icon;
                const isCategorySelected = value === cat.name;

                return (
                  <div key={cat.id} className="shrink-0 flex flex-col rounded-xl bg-white/[0.02]">
                    {/* Parent Node */}
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-all ${
                        isCategorySelected ? 'bg-white/10 text-white font-bold' : 'text-white/85'
                      }`}
                      onClick={() => selectItem(cat.name)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/80 shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold truncate">{cat.name}</span>
                      </div>

                      {/* Expand Chevron */}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(cat.id, e)}
                        className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="عرض الفئات الفرعية"
                      >
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-white' : ''}`} />
                      </button>
                    </div>

                    {/* Sub-categories (Collapsible Tree Branch) */}
                    {isExpanded && (
                      <div className="mr-6 my-1 border-r border-white/[0.1] pr-3 flex flex-col gap-1">
                        {cat.subCategories.map((sub) => {
                          const subFullVal = `${cat.name} · ${sub}`;
                          const isSubSelected = value === subFullVal || value === sub;

                          return (
                            <div
                              key={sub}
                              onClick={() => selectItem(subFullVal)}
                              className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                                isSubSelected
                                  ? 'bg-white text-black font-bold shadow-sm'
                                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                              }`}
                            >
                              <span>{sub}</span>
                              {isSubSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTreePicker;
