import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart2, Calendar } from 'lucide-react';

export default function EvolutionChart({ dataset, derivWord, singleWord }) {
  const [granularity, setGranularity] = useState('years'); // 'years' | 'months' | 'weeks'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Prepare chart data based on granularity
  const chartData = useMemo(() => {
    if (!dataset) return [];

    if (granularity === 'years') {
      return Object.entries(dataset.years || {}).map(([key, val]) => ({
        label: key,
        value: val,
        rawKey: key
      }));
    }

    if (granularity === 'months') {
      // Group or display recent months (e.g. last 36 months for clear visualization)
      const entries = Object.entries(dataset.months || {});
      const sliced = entries.slice(-36);
      return sliced.map(([key, val]) => {
        const [y, m] = key.split('-');
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
        const monthShort = dateObj.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        return {
          label: monthShort,
          value: val,
          rawKey: key,
          fullLabel: `${dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
        };
      });
    }

    if (granularity === 'weeks') {
      // Last 40 recorded weeks
      const entries = Object.entries(dataset.weeks || {});
      const sliced = entries.slice(-40);
      return sliced.map(([key, val]) => ({
        label: key.replace('-', ' '),
        value: val,
        rawKey: key,
        fullLabel: `Semaine ${key}`
      }));
    }

    return [];
  }, [dataset, granularity]);

  const maxVal = useMemo(() => {
    if (!chartData.length) return 1;
    return Math.max(...chartData.map(d => d.value), 1);
  }, [chartData]);

  // Compute SVG coordinates
  const width = 850;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const points = useMemo(() => {
    if (!chartData.length) return [];
    return chartData.map((d, i) => {
      const x = paddingX + (i / Math.max(chartData.length - 1, 1)) * plotWidth;
      const y = height - paddingY - (d.value / maxVal) * plotHeight;
      return { ...d, x, y, isPeak: d.value === maxVal };
    });
  }, [chartData, maxVal, plotWidth, plotHeight, width, height, paddingX, paddingY]);

  // Generate smooth SVG curve path (Cardinal / Bezier spline)
  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }, '');
  }, [points]);

  // Area under curve path for gradient fill
  const areaD = useMemo(() => {
    if (!pathD || points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = height - paddingY;
    return `${pathD} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;
  }, [pathD, points, height, paddingY]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <TrendingUp size={20} color="var(--hero-red-sub)" />
          <div>
            <h3 className="chart-title">Courbe d'Évolution de la {derivWord}</h3>
            <span className="chart-subtitle">Fréquence et intensité des occurrences dans le temps</span>
          </div>
        </div>

        {/* Granularity Toggle */}
        <div className="chart-toggle-group">
          <button 
            className={`chart-toggle-btn ${granularity === 'years' ? 'active' : ''}`}
            onClick={() => { setGranularity('years'); setHoveredPoint(null); }}
          >
            Par Année
          </button>
          <button 
            className={`chart-toggle-btn ${granularity === 'months' ? 'active' : ''}`}
            onClick={() => { setGranularity('months'); setHoveredPoint(null); }}
          >
            Par Mois
          </button>
          <button 
            className={`chart-toggle-btn ${granularity === 'weeks' ? 'active' : ''}`}
            onClick={() => { setGranularity('weeks'); setHoveredPoint(null); }}
          >
            Par Semaine
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="chart-svg-wrap">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="chart-svg"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Red Glow Area Gradient */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>

            {/* Grid Line Pattern */}
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* Background Reference Grid Lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - paddingY - ratio * plotHeight;
            const val = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="var(--border-card)" 
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text 
                  x={paddingX - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="11" 
                  fill="var(--text-dim)"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && (
            <path d={areaD} fill="url(#chartGradient)" />
          )}

          {/* Smooth Red Stroke Curve */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="url(#lineGlow)" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Peaks */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint && hoveredPoint.rawKey === pt.rawKey;
            return (
              <g key={i}>
                {/* Peak Highlight Circle */}
                {pt.isPeak && (
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="9" 
                    fill="rgba(239, 68, 68, 0.3)" 
                    className="peak-pulse"
                  />
                )}

                {/* Point Dot */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={pt.isPeak || isHovered ? "5.5" : "3.5"} 
                  fill={pt.isPeak ? "#ef4444" : "var(--bg-surface)"} 
                  stroke={pt.isPeak ? "#ffffff" : "#dc2626"} 
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                />

                {/* Invisible Hover Hitbox */}
                <rect 
                  x={pt.x - 14} 
                  y={0} 
                  width={28} 
                  height={height} 
                  fill="transparent" 
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(pt)}
                />

                {/* X-Axis Labels (Filtered to prevent crowding) */}
                {(granularity === 'years' || i % Math.ceil(points.length / 8) === 0 || i === points.length - 1) && (
                  <text 
                    x={pt.x} 
                    y={height - 8} 
                    textAnchor="middle" 
                    fontSize="11" 
                    fontWeight="700"
                    fill={isHovered ? "var(--text-main)" : "var(--text-muted)"}
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hover Vertical Guide Line */}
          {hoveredPoint && (
            <line 
              x1={hoveredPoint.x} 
              y1={paddingY} 
              x2={hoveredPoint.x} 
              y2={height - paddingY} 
              stroke="#ef4444" 
              strokeWidth="1.5" 
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`
            }}
          >
            <div className="tooltip-title">
              {hoveredPoint.fullLabel || hoveredPoint.label}
            </div>
            <div className="tooltip-value">
              <strong>{hoveredPoint.value}</strong> {singleWord}{hoveredPoint.value > 1 ? 's' : ''}
            </div>
            {hoveredPoint.isPeak && (
              <span className="tooltip-peak-tag">Pic Record</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
