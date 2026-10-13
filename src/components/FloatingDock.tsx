import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PlatformIcon from './PlatformIcon';
import { SocialPlatform } from '../types';
import {
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Search
} from 'lucide-react';

export const FloatingDock: React.FC = () => {
  const {
    typeFilter,
    setTypeFilter,
    platformFilter,
    setPlatformFilter,
    categoryFilter,
    setCategoryFilter,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useApp();

  const [aiPrompt, setAiPrompt] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'sort' | 'category' | null>(null);

  const platforms: SocialPlatform[] = ['tiktok', 'instagram', 'youtube', 'snapchat', 'x'];

  const aiSuggestions = [
    'وريني حملات سناب بأعلى سعر',
    'حملات كليبنغ بدون وجه',
    'حملات عطور بميزانيات مفتوحة',
    'حملات بدون متطلبات تقديم معقدة',
  ];

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const lower = aiPrompt.toLowerCase();
    if (lower.includes('سناب') || lower.includes('snap')) {
      setPlatformFilter('snapchat');
      setSortOption('highest_cpm');
    } else if (lower.includes('كليب') || lower.includes('clipping')) {
      setTypeFilter('clipping');
    } else if (lower.includes('عطور') || lower.includes('عطر')) {
      setCategoryFilter('عطور فاخرة');
    } else if (lower.includes('أعلى') || lower.includes('سعر')) {
      setSortOption('highest_cpm');
    }

    setSearchQuery(aiPrompt);
    showToast(`تم تطبيق البحث الذكي: "${aiPrompt}"`);
    setAiPrompt('');
  };

  const handleTabSuggestion = () => {
    const suggestion = aiSuggestions[0];
    setAiPrompt(suggestion);
  };

  const resetFilters = () => {
    setTypeFilter('all');
    setPlatformFilter('all');
    setCategoryFilter('all');
    setSortOption('popular');
    setSearchQuery('');
    setAiPrompt('');
    showToast('تمت إعادة ضبط جميع الفلاتر');
  };

  return (
    <div className="fixed bottom-22 md:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4 pointer-events-auto">
      {/* Container with premium glassmorphism, white border & shadow */}
      <div className="rounded-[26px] bg-page/85 backdrop-blur-3xl border border-white/[0.18] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_24px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col gap-2.5">
        {/* Top: AI Natural Language Search Field */}
        <form onSubmit={handleAiSubmit} className="relative flex items-center w-full">
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50">
            <Search className="w-4 h-4 text-white/80 animate-pulse" />
          </div>

          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && !aiPrompt) {
                e.preventDefault();
                handleTabSuggestion();
              }
            }}
            placeholder="اسألني… مثلاً: وريني حملات سناب بأعلى سعر"
            className="w-full h-10 pr-10 pl-24 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:shadow-[0_0_16px_rgba(255,255,255,0.08)] transition-all text-right font-medium"
          />

          {/* Tab Key Hint / Submit button */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {!aiPrompt ? (
              <button
                type="button"
                onClick={handleTabSuggestion}
                className="px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.14] text-[10px] text-white/60 font-mono hover:bg-white/[0.15] hover:text-white transition-colors"
                title="اضغط Tab لإكمال المقترح"
              >
                Tab ⇥
              </button>
            ) : (
              <button
                type="submit"
                className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all"
              >
                بحث
              </button>
            )}
          </div>
        </form>

        {/* Bottom: Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.06] text-xs">
          {/* Segmented Control: الكل | Clipping | UGC */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.1]">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTypeFilter('clipping')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'clipping'
                  ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Clipping
            </button>
            <button
              onClick={() => setTypeFilter('ugc')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'ugc'
                  ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              UGC
            </button>
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-1.5">
            {/* Sort Toggle */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all ${
                  sortOption !== 'popular'
                    ? 'bg-white/[0.12] border-white/30 text-white'
                    : 'bg-white/[0.04] border-white/[0.1] text-white/70 hover:text-white'
                }`}
              >
                <ArrowUpDown className="w-3 h-3 text-white/60" />
                <span>
                  {sortOption === 'highest_cpm'
                    ? 'أعلى عائد'
                    : sortOption === 'budget_left'
                    ? 'الميزانية المتبقية'
                    : 'ترتيب'}
                </span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>

              {activeDropdown === 'sort' && (
                <div className="absolute bottom-10 right-0 w-36 rounded-xl bg-surface border border-white/[0.16] p-1.5 shadow-2xl z-50 text-right backdrop-blur-2xl">
                  <button
                    onClick={() => {
                      setSortOption('popular');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-right px-2 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white rounded-lg"
                  >
                    الأكثر رواجاً
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('highest_cpm');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-right px-2 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white rounded-lg"
                  >
                    أعلى سعر / 1K
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('budget_left');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-right px-2 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white rounded-lg"
                  >
                    الميزانية المتبقية
                  </button>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all ${
                  categoryFilter !== 'all'
                    ? 'bg-white/[0.12] border-white/30 text-white'
                    : 'bg-white/[0.04] border-white/[0.1] text-white/70 hover:text-white'
                }`}
              >
                <Tag className="w-3 h-3 text-white/60" />
                <span>{categoryFilter === 'all' ? 'التصنيف' : categoryFilter}</span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>

              {activeDropdown === 'category' && (
                <div className="absolute bottom-10 right-0 w-40 rounded-xl bg-surface border border-white/[0.16] p-1.5 shadow-2xl z-50 text-right backdrop-blur-2xl">
                  {['all', 'عطور فاخرة', 'مقاهي ومشروبات', 'تطبيقات وتوصيل', 'ألعاب ورياضات إلكترونية', 'أزياء ورجالية', 'بودكاست وإعلام'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-right px-2 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white rounded-lg truncate"
                    >
                      {cat === 'all' ? 'جميع التصنيفات' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Toggles */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
              {platforms.map((p) => {
                const isActive = platformFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(isActive ? 'all' : p)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white text-black shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.1]'
                    }`}
                    title={p}
                  >
                    <PlatformIcon platform={p} size={11} />
                  </button>
                );
              })}
            </div>

            {/* Clear / Reset button */}
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1"
              title="إعادة ضبط الفلاتر"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingDock;
