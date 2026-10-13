import React, { useState, useRef, useMemo, useEffect } from 'react';
import RiyalSymbol from '../RiyalSymbol';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  CreditCard,
  Maximize2,
  Flag
} from 'lucide-react';

export interface ChartEvent {
  title: string;
  description: string;
  type: 'campaign' | 'fund' | 'milestone';
}

export interface AnalyticsPoint {
  id: string;
  label: string; // e.g. "1 أكتوبر"
  fullDate: string; // e.g. "السبت، 1 أكتوبر 2026"
  value: number; // primary metric
  previousValue?: number; // comparison period
  secondaryValue?: number; // secondary metric (e.g. spend)
  event?: ChartEvent;
}

interface InteractiveAnalyticsChartProps {
  points: AnalyticsPoint[];
  primaryLabel: string;
  isCurrency?: boolean;
  valueUnit?: string;
  isCumulative?: boolean;
  showComparison?: boolean;
  secondaryLabel?: string;
  secondaryIsCurrency?: boolean;
  hasSecondarySeries?: boolean;
  isLoading?: boolean;
  onResetZoom?: () => void;
  emptyStateTitle?: string;
  emptyStateAction?: () => void;
}

export const InteractiveAnalyticsChart: React.FC<InteractiveAnalyticsChartProps> = ({
  points,
  primaryLabel,
  isCurrency = false,
  valueUnit = '',
  isCumulative = false,
  showComparison = false,
  secondaryLabel = 'الإنفاق التراكمي',
  secondaryIsCurrency = true,
  hasSecondarySeries = false,
  isLoading = false,
  emptyStateTitle = 'لا توجد بيانات مطابقة للفلاتر المحددة',
  emptyStateAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom range state (slice indices [start, end])
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);
  const [dragSelection, setDragSelection] = useState<{ startX: number; currentX: number } | null>(null);

  // Hover scrubber state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Active points based on zoom range
  const activePoints = useMemo(() => {
    if (!zoomRange || zoomRange[0] >= zoomRange[1]) return points;
    return points.slice(zoomRange[0], zoomRange[1] + 1);
  }, [points, zoomRange]);

  // Reset zoom when full dataset changes
  useEffect(() => {
    setZoomRange(null);
    setHoverIndex(null);
  }, [points.length]);

  // Coordinate calculations
  const width = 1000;
  const height = 270;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartInnerWidth = width - paddingX * 2;
  const chartInnerHeight = height - paddingTop - paddingBottom;

  // Primary Min/Max
  const { minVal, maxVal } = useMemo(() => {
    if (activePoints.length === 0) return { minVal: 0, maxVal: 100 };
    const vals = activePoints.map((p) => p.value);
    if (showComparison) {
      activePoints.forEach((p) => {
        if (p.previousValue !== undefined) vals.push(p.previousValue);
      });
    }
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return {
      minVal: isCumulative ? 0 : Math.max(0, Math.floor(min * 0.85)),
      maxVal: max === 0 ? 100 : Math.ceil(max * 1.15),
    };
  }, [activePoints, showComparison, isCumulative]);

  // Secondary Min/Max (e.g. for Brand Cumulative Spend)
  const { secondaryMaxVal } = useMemo(() => {
    if (!hasSecondarySeries || activePoints.length === 0) return { secondaryMaxVal: 100 };
    const vals = activePoints.map((p) => p.secondaryValue || 0);
    const max = Math.max(...vals, 100);
    return { secondaryMaxVal: Math.ceil(max * 1.15) };
  }, [hasSecondarySeries, activePoints]);

  // RTL X calculation: Oldest index 0 is on the RIGHT (width - paddingX), Newest is on the LEFT (paddingX)
  const getX = (index: number, total: number) => {
    if (total <= 1) return width / 2;
    // In RTL: index 0 (oldest) -> right, index total-1 (newest) -> left
    const ratio = index / (total - 1);
    return (width - paddingX) - ratio * chartInnerWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    const ratio = (val - minVal) / range;
    return paddingTop + chartInnerHeight - ratio * chartInnerHeight;
  };

  const getSecondaryY = (val: number) => {
    const range = secondaryMaxVal || 1;
    const ratio = val / range;
    return paddingTop + chartInnerHeight - ratio * chartInnerHeight;
  };

  // Generate SVG Path using smooth cubic bezier curves
  const generateBezierPath = (
    pts: AnalyticsPoint[],
    valExtractor: (p: AnalyticsPoint) => number,
    yCalculator: (v: number) => number
  ) => {
    if (pts.length === 0) return '';
    const coords = pts.map((p, i) => ({
      x: getX(i, pts.length),
      y: yCalculator(valExtractor(p)),
    }));

    if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`;

    let path = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = i > 0 ? coords[i - 1] : coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = i < coords.length - 2 ? coords[i + 2] : p2;

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  // Primary Path & Area
  const primaryLinePath = useMemo(() => {
    return generateBezierPath(activePoints, (p) => p.value, getY);
  }, [activePoints, minVal, maxVal]);

  const primaryAreaPath = useMemo(() => {
    if (!primaryLinePath || activePoints.length === 0) return '';
    const firstX = getX(0, activePoints.length);
    const lastX = getX(activePoints.length - 1, activePoints.length);
    const bottomY = paddingTop + chartInnerHeight;
    return `${primaryLinePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [primaryLinePath, activePoints]);

  // Comparison Path (faint dashed line)
  const comparisonLinePath = useMemo(() => {
    if (!showComparison) return '';
    return generateBezierPath(activePoints, (p) => p.previousValue ?? p.value * 0.88, getY);
  }, [activePoints, showComparison, minVal, maxVal]);

  // Secondary Path (thin gray line for cumulative spend)
  const secondaryLinePath = useMemo(() => {
    if (!hasSecondarySeries) return '';
    return generateBezierPath(activePoints, (p) => p.secondaryValue ?? 0, getSecondaryY);
  }, [activePoints, hasSecondarySeries, secondaryMaxVal]);

  // Scrub handler: mouse moves across the SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activePoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    // Handle drag-to-zoom
    if (dragSelection) {
      setDragSelection((prev) => (prev ? { ...prev, currentX: svgX } : null));
      return;
    }

    // Find nearest point index based on RTL mapping
    // svgX is between paddingX and width - paddingX
    const clampedX = Math.max(paddingX, Math.min(width - paddingX, svgX));
    const rightEdge = width - paddingX;
    const distanceFrac = (rightEdge - clampedX) / chartInnerWidth;
    const nearestIndex = Math.round(distanceFrac * (activePoints.length - 1));
    setHoverIndex(Math.max(0, Math.min(activePoints.length - 1, nearestIndex)));
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;
    setDragSelection({ startX: svgX, currentX: svgX });
  };

  const handleMouseUp = () => {
    if (dragSelection && activePoints.length > 3) {
      const { startX, currentX } = dragSelection;
      const diff = Math.abs(currentX - startX);
      if (diff > 40) {
        // Calculate range in indices
        const x1 = Math.min(startX, currentX);
        const x2 = Math.max(startX, currentX);

        const rightEdge = width - paddingX;
        const i2 = Math.round(((rightEdge - x1) / chartInnerWidth) * (activePoints.length - 1));
        const i1 = Math.round(((rightEdge - x2) / chartInnerWidth) * (activePoints.length - 1));

        const newStart = Math.max(0, Math.min(i1, i2));
        const newEnd = Math.min(activePoints.length - 1, Math.max(i1, i2));

        if (newEnd - newStart >= 2) {
          // If we were already zoomed, map back to original indices
          const baseOffset = zoomRange ? zoomRange[0] : 0;
          setZoomRange([baseOffset + newStart, baseOffset + newEnd]);
        }
      }
    }
    setDragSelection(null);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setDragSelection(null);
  };

  const resetZoom = () => {
    setZoomRange(null);
    setHoverIndex(null);
  };

  // Hovered Point Data
  const hoveredPoint = hoverIndex !== null ? activePoints[hoverIndex] : null;
  const hoveredX = hoverIndex !== null ? getX(hoverIndex, activePoints.length) : 0;
  const hoveredY = hoveredPoint ? getY(hoveredPoint.value) : 0;
  const hoveredSecondaryY = hoveredPoint && hasSecondarySeries ? getSecondaryY(hoveredPoint.secondaryValue || 0) : 0;

  // Change vs previous day calculation
  const dayChangePercent = useMemo(() => {
    if (!hoveredPoint || hoverIndex === null) return null;
    if (hoverIndex === 0) return 0;
    const prev = activePoints[hoverIndex - 1].value;
    if (prev === 0) return 0;
    return (((hoveredPoint.value - prev) / prev) * 100);
  }, [hoveredPoint, hoverIndex, activePoints]);

  // Empty state handling
  if (points.length === 0) {
    return (
      <div className="relative w-full h-72 rounded-[24px] bg-white/[0.02] border border-white/[0.08] flex flex-col items-center justify-center gap-3 p-6 text-center select-none">
        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/50">
          <Layers className="w-6 h-6" />
        </div>
        <span className="text-sm font-semibold text-white/90">{emptyStateTitle}</span>
        <span className="text-xs text-white/50">جرب تعديل أو إعادة تفعيل منصات التواصل في شريط الفلاتر</span>
        {emptyStateAction && (
          <button
            onClick={emptyStateAction}
            className="mt-2 py-2 px-5 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_14px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* Zoom indicator banner / reset zoom button */}
      {zoomRange && (
        <div className="absolute top-2 left-3 z-30 flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.2] text-[11px] font-mono font-medium text-white/90 flex items-center gap-1.5 shadow-sm">
            <Maximize2 className="w-3 h-3 text-white" />
            <span>نطاق مكبّر ({activePoints.length} يوم)</span>
          </div>
          <button
            onClick={resetZoom}
            className="py-1 px-3 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_14px_rgba(255,255,255,0.5)] hover:bg-neutral-100 transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة الضبط</span>
          </button>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        {/* Skeleton Shimmer Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>جاري تحديث التحليلات...</span>
            </div>
          </div>
        )}

        <svg
          className="w-full h-full cursor-crosshair overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Primary Area Gradient */}
            <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.22" />
              <stop offset="60%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.05" />
              <stop offset="100%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0" />
            </linearGradient>

            {/* Vertical Spotlight Beam Gradient */}
            <linearGradient id="scrubSpotlightBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.4" />
              <stop offset="40%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.12" />
              <stop offset="100%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.01" />
            </linearGradient>

            {/* Selection Drag Gradient */}
            <linearGradient id="dragSelectionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.25" />
              <stop offset="100%" style={{ stopColor: 'var(--color-white)' }} stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Grid Lines (Horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + chartInnerHeight * pct;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="2 3"
                />
              </g>
            );
          })}

          {/* Drag Selection Box */}
          {dragSelection && (
            <rect
              x={Math.min(dragSelection.startX, dragSelection.currentX)}
              y={paddingTop}
              width={Math.abs(dragSelection.currentX - dragSelection.startX)}
              height={chartInnerHeight}
              fill="url(#dragSelectionGrad)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
              strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}

          {/* Primary Filled Area */}
          <path d={primaryAreaPath} fill="url(#primaryAreaGrad)" pointerEvents="none" />

          {/* Comparison Series (Faint Dashed Line) */}
          {showComparison && comparisonLinePath && (
            <path
              d={comparisonLinePath}
              fill="none"
              stroke="rgba(255,255,255,0.38)"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              pointerEvents="none"
            />
          )}

          {/* Secondary Series (Thin Gray Line for Owner Cumulative Spend) */}
          {hasSecondarySeries && secondaryLinePath && (
            <path
              d={secondaryLinePath}
              fill="none"
              stroke="#A3A3A3"
              strokeWidth="1.8"
              strokeDasharray="3 3"
              pointerEvents="none"
              className="drop-shadow-[0_0_6px_rgba(200,200,200,0.3)]"
            />
          )}

          {/* Primary Solid Glowing Line */}
          <path
          d={primaryLinePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
          className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]"
        />

          {/* Event Markers on the Line (Small Ring Dots with Sparkle) */}
          {activePoints.map((pt, idx) => {
            if (!pt.event) return null;
            const ptX = getX(idx, activePoints.length);
            const ptY = getY(pt.value);

            return (
              <g key={pt.id} className="cursor-pointer group/event">
                {/* Ping Ring */}
              <circle
                cx={ptX}
                cy={ptY}
                r={5}
                fill="currentColor"
                stroke="var(--color-black)"
                strokeWidth="2"
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
              />
                {/* Solid Ring */}
                <circle
                  cx={ptX}
                  cy={ptY}
                  r={5}
                  fill="#FFFFFF"
                  stroke="#0A0A0A"
                  strokeWidth="2"
                  className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                />
              </g>
            );
          })}

          {/* Hover Scrubber: Vertical Spotlight Beam & Snapped Dots */}
          {hoveredPoint && (
            <g pointerEvents="none">
              {/* Vertical Spotlight Beam */}
              <rect
                x={hoveredX - 14}
                y={paddingTop}
                width={28}
                height={chartInnerHeight}
                fill="url(#scrubSpotlightBeam)"
              />
              <line
                x1={hoveredX}
                y1={paddingTop}
                x2={hoveredX}
                y2={paddingTop + chartInnerHeight}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Snapped Dot on Secondary Line (if present) */}
              {hasSecondarySeries && (
                <circle
                  cx={hoveredX}
                  cy={hoveredSecondaryY}
                  r={4.5}
                  fill="#A3A3A3"
                  stroke="#0A0A0A"
                  strokeWidth="2"
                  className="shadow-sm"
                />
              )}

              {/* Snapped Dot on Primary Line */}
              <circle
                cx={hoveredX}
                cy={hoveredY}
                r={7}
                fill="#FFFFFF"
                stroke="#0A0A0A"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
              />
            </g>
          )}
        </svg>

        {/* Floating Glass Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-50 pointer-events-none transition-transform duration-75 text-right"
            style={{
              left: `${(hoveredX / width) * 100}%`,
              top: `${Math.max(10, Math.min(height - 130, hoveredY - 30))}px`,
              transform: `translate(${hoveredX > width * 0.75 ? '-100%' : hoveredX < width * 0.25 ? '0%' : '-50%'}, -100%)`,
            }}
          >
            <div className="p-3 rounded-[20px] bg-surface/95 backdrop-blur-2xl border border-white/[0.18] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.1)] min-w-[190px] flex flex-col gap-2">
              {/* Tooltip Header: Date */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Calendar className="w-3 h-3 text-white/60" />
                  <span>{hoveredPoint.fullDate}</span>
                </div>
                {hoveredPoint.event && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[9px] font-bold">
                    حدث
                  </span>
                )}
              </div>

              {/* Primary Value */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/50">{primaryLabel}</span>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-1 text-base font-black text-white font-mono">
                    <span>{hoveredPoint.value.toLocaleString()}</span>
                    {isCurrency && <RiyalSymbol className="w-3 h-3 text-white inline-block" />}
                    {valueUnit && <span className="text-xs font-normal text-white/60">{valueUnit}</span>}
                  </div>

                  {/* Day-over-day change badge */}
                  {dayChangePercent !== null && (
                    <div
                      className={`flex items-center gap-0.5 text-[10px] font-mono font-bold ${
                        dayChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {dayChangePercent >= 0 ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      <span>{Math.abs(dayChangePercent).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Period Value (if active) */}
              {showComparison && hoveredPoint.previousValue !== undefined && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06] text-white/60">
                  <span className="text-[10px]">الفترة السابقة:</span>
                  <div className="flex items-baseline gap-0.5 font-mono text-white/80">
                    <span>{hoveredPoint.previousValue.toLocaleString()}</span>
                    {isCurrency && <RiyalSymbol className="w-2.5 h-2.5 text-white/60" />}
                  </div>
                </div>
              )}

              {/* Secondary Series (Spend) Value */}
              {hasSecondarySeries && hoveredPoint.secondaryValue !== undefined && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
                  <span className="text-[10px] text-muted">{secondaryLabel}:</span>
                  <div className="flex items-baseline gap-1 font-mono font-bold text-white/90">
                    <span>{hoveredPoint.secondaryValue.toLocaleString()}</span>
                    {secondaryIsCurrency && <RiyalSymbol className="w-2.5 h-2.5 text-white/80" />}
                  </div>
                </div>
              )}

              {/* Event Marker Card Details */}
              {hoveredPoint.event && (
                <div className="mt-1 p-2 rounded-xl bg-white/[0.06] border border-white/[0.14] flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                    <Flag className="w-3 h-3 text-amber-300" />
                    <span>{hoveredPoint.event.title}</span>
                  </div>
                  <span className="text-[10px] text-white/70 leading-relaxed">
                    {hoveredPoint.event.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* X Axis Date Labels (RTL: Oldest on right, Today on left) */}
      <div className="flex items-center justify-between text-[11px] text-white/40 font-mono px-3 pt-2 border-t border-white/[0.08]">
        {/* Sample 6 to 8 readable labels across points */}
        {activePoints
          .filter((_, idx, arr) => {
            const step = Math.max(1, Math.floor(arr.length / 6));
            return idx % step === 0 || idx === arr.length - 1;
          })
          .map((pt) => (
            <span key={pt.id} className="hover:text-white transition-colors">
              {pt.label}
            </span>
          ))}
      </div>
    </div>
  );
};

export default InteractiveAnalyticsChart;
