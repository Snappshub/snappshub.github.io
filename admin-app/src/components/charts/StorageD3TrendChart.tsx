import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface StorageTrendPoint {
  day: number;
  dateStr: string;
  date: Date;
  usageMb: number;
  deltaMb: number;
}

interface StorageD3TrendChartProps {
  currentTotalMb: number;
}

export const StorageD3TrendChart: React.FC<StorageD3TrendChartProps> = ({ currentTotalMb }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<StorageTrendPoint | null>(null);

  // Generate 30-day historical data ending at currentTotalMb
  const trendData: StorageTrendPoint[] = React.useMemo(() => {
    const points: StorageTrendPoint[] = [];
    const baseUsage = Math.max(5000, currentTotalMb - 2100);
    const now = new Date('2026-10-29T12:00:00Z');

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      // Simulating realistic incremental growth curve with minor variance
      const progress = (30 - i) / 30;
      const smoothGain = Math.round((currentTotalMb - baseUsage) * Math.pow(progress, 1.15));
      const jitter = i === 0 ? 0 : Math.round((Math.sin(i * 1.5) * 45));
      const usage = Math.min(currentTotalMb, baseUsage + smoothGain + jitter);
      const prevUsage = points.length > 0 ? points[points.length - 1].usageMb : baseUsage;
      const delta = Math.max(0, usage - prevUsage);

      points.push({
        day: 30 - i,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: d,
        usageMb: usage,
        deltaMb: delta
      });
    }

    // Ensure last point exactly matches current total
    if (points.length > 0) {
      points[points.length - 1].usageMb = currentTotalMb;
    }

    return points;
  }, [currentTotalMb]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || trendData.length === 0) return;

    const width = containerRef.current.clientWidth || 500;
    const height = 220;
    const margin = { top: 20, right: 25, bottom: 30, left: 55 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(trendData, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yMin = d3.min(trendData, (d) => d.usageMb) || 4000;
    const yMax = d3.max(trendData, (d) => d.usageMb) || currentTotalMb;
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - 400), yMax + 300])
      .range([height - margin.bottom, margin.top]);

    // Defs for gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'storage-trend-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.28);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    // Subtle horizontal grid lines
    const yAxisTicks = yScale.ticks(4);
    svg
      .append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yAxisTicks)
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3,3');

    // Area generator
    const area = d3
      .area<StorageTrendPoint>()
      .x((d) => xScale(d.date))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.usageMb))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(trendData)
      .attr('fill', 'url(#storage-trend-gradient)')
      .attr('d', area);

    // Line generator
    const line = d3
      .line<StorageTrendPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.usageMb))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(trendData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Bottom Time Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d: any) => d3.timeFormat('%b %d')(d))
      .tickSize(0)
      .tickPadding(8);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call((g) => g.select('.domain').attr('stroke', '#e2e8f0'))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif');

    // Left Y Axis (GB / MB)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d: any) => {
        const mb = Number(d);
        return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
      })
      .tickSize(0)
      .tickPadding(8);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Interactive Hover Line & Overlay
    const focusGroup = svg.append('g').style('display', 'none');

    const focusLine = focusGroup
      .append('line')
      .attr('stroke', '#047857')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    const focusDot = focusGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    const bisect = d3.bisector<StorageTrendPoint, Date>((d) => d.date).left;

    svg
      .append('rect')
      .attr('class', 'overlay')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'transparent')
      .on('mouseover', () => focusGroup.style('display', null))
      .on('mouseout', () => {
        focusGroup.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [xm] = d3.pointer(event);
        const x0 = xScale.invert(xm);
        const i = bisect(trendData, x0, 1);
        const d0 = trendData[i - 1];
        const d1 = trendData[i];
        const d = !d1 ? d0 : x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;

        focusLine.attr('x1', xScale(d.date)).attr('x2', xScale(d.date));
        focusDot.attr('cx', xScale(d.date)).attr('cy', yScale(d.usageMb));
        setHoveredPoint(d);
      });
  }, [trendData, currentTotalMb]);

  const startVal = trendData[0]?.usageMb || 1;
  const endVal = trendData[trendData.length - 1]?.usageMb || currentTotalMb;
  const netGrowthMb = Math.max(0, endVal - startVal);
  const netGrowthPercent = ((netGrowthMb / startVal) * 100).toFixed(1);

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 tracking-wider block">
            D3 Consumption Analytics
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
            30-Day Storage Consumption Growth
          </h4>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">30D Growth</span>
            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +{netGrowthPercent}% (+{(netGrowthMb / 1024).toFixed(2)} GB)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-xl border border-slate-100">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Floating Tooltip Indicator */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md p-2 rounded-xl text-xs space-y-0.5 pointer-events-none">
            <div className="font-semibold text-slate-800">{hoveredPoint.dateStr}</div>
            <div className="font-mono font-bold text-emerald-700">
              {hoveredPoint.usageMb >= 1024
                ? `${(hoveredPoint.usageMb / 1024).toFixed(2)} GB`
                : `${hoveredPoint.usageMb} MB`}
            </div>
            {hoveredPoint.deltaMb > 0 && (
              <div className="text-[10px] text-slate-500 font-mono">
                +{hoveredPoint.deltaMb} MB added
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
