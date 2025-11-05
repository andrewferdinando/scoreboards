'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EditableCell } from './EditableCell';
import { UserMenu } from './UserMenu';
import { MultiSelect } from './ui/MultiSelect';
import { Dropdown } from './ui/Dropdown';
import { getSelectedBrandId, setSelectedBrandId } from '@/lib/brandSelection';
import { Metric, MetricValue } from '@/types/database';

interface MetricDetailContentProps {
  metric: Metric;
  values: MetricValue[];
  brands?: Array<{ id: string; name: string }>;
}

export function MetricDetailContent({ metric, values, brands = [] }: MetricDetailContentProps) {
  const router = useRouter();
  const [showYTD, setShowYTD] = useState(false);
  
  // Brand selection state - initialize from localStorage, metric's brand_id, or first brand
  const [selectedBrandId, setSelectedBrandIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = getSelectedBrandId();
      if (saved && brands.some(b => b.id === saved)) {
        return saved;
      }
    }
    return metric.brand_id || (brands.length > 0 ? brands[0].id : null);
  });

  // Update localStorage when brand selection changes
  const handleBrandChange = useCallback((brandId: string | null) => {
    setSelectedBrandIdState(brandId);
    setSelectedBrandId(brandId);
  }, []);

  // Sync with localStorage and metric's brand_id on mount
  useEffect(() => {
    const saved = getSelectedBrandId();
    if (saved && brands.some(b => b.id === saved)) {
      setSelectedBrandIdState(saved);
    } else if (metric.brand_id) {
      setSelectedBrandIdState(metric.brand_id);
      setSelectedBrandId(metric.brand_id);
    } else if (brands.length > 0 && !selectedBrandId) {
      const firstBrandId = brands[0].id;
      setSelectedBrandIdState(firstBrandId);
      setSelectedBrandId(firstBrandId);
    }
  }, [metric.brand_id, brands, selectedBrandId]);
  
  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.name,
  }));
  
  // Get available years (2023 to current year - automatically includes new year on Jan 1st)
  const currentYear = new Date().getFullYear();
  
  // Available years for selection (2023, 2024, 2025, and current year if > 2025)
  const availableYears = useMemo(() => {
    const years = [2023, 2024, 2025];
    if (currentYear > 2025) {
      for (let year = 2026; year <= currentYear; year++) {
        years.push(year);
      }
    }
    return years;
  }, [currentYear]);

  const yearOptions = availableYears.map(year => ({
    value: year,
    label: year.toString(),
  }));
  
  // Selected years state (default to all available years)
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  
  // Initialize and update selected years when available years change
  useEffect(() => {
    setSelectedYears(prev => {
      // Initialize with all available years if empty
      if (prev.length === 0) {
        return availableYears;
      }
      // If new year was added, include it in selection
      const newYear = availableYears.find(year => !prev.includes(year));
      if (newYear) {
        return [...prev, newYear];
      }
      // Filter out years that are no longer available
      return prev.filter(year => availableYears.includes(year));
    });
  }, [availableYears]);

  const handleValueSaved = () => {
    router.refresh();
  };

  const months = [
    { num: 1, short: 'Jan', full: 'January' },
    { num: 2, short: 'Feb', full: 'February' },
    { num: 3, short: 'Mar', full: 'March' },
    { num: 4, short: 'Apr', full: 'April' },
    { num: 5, short: 'May', full: 'May' },
    { num: 6, short: 'Jun', full: 'June' },
    { num: 7, short: 'Jul', full: 'July' },
    { num: 8, short: 'Aug', full: 'August' },
    { num: 9, short: 'Sep', full: 'September' },
    { num: 10, short: 'Oct', full: 'October' },
    { num: 11, short: 'Nov', full: 'November' },
    { num: 12, short: 'Dec', full: 'December' },
  ];

  // Group values by year
  const valuesByYear = useMemo(() => {
    const grouped: Record<number, Record<number, number>> = {};
    values.forEach((value) => {
      if (!grouped[value.year]) {
        grouped[value.year] = {};
      }
      grouped[value.year][value.month] = Number(value.value);
    });
    return grouped;
  }, [values]);

  // Get all years from data, sorted ascending, filtered by selected years
  const years = useMemo(() => {
    return Object.keys(valuesByYear)
      .map(Number)
      .filter(year => selectedYears.includes(year))
      .sort((a, b) => a - b); // Sort ascending for table display
  }, [valuesByYear, selectedYears]);
  
  // Format number with space separator
  const formatNumber = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Calculate YTD for each year
  const calculateYTD = (year: number): number => {
    let sum = 0;
    const yearData = valuesByYear[year] || {};
    for (let month = 1; month <= 12; month++) {
      if (yearData[month]) {
        sum += yearData[month];
      }
    }
    return sum;
  };

  // Prepare graph data (all values sorted by date)
  const graphData = useMemo(() => {
    return values
      .map((v) => ({
        date: new Date(v.year, v.month - 1),
        value: Number(v.value),
        year: v.year,
        month: v.month,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [values]);

  // Calculate graph dimensions
  const maxValue = graphData.length > 0 ? Math.max(...graphData.map((d) => d.value)) : 0;
  const minValue = graphData.length > 0 ? Math.min(...graphData.map((d) => d.value)) : 0;
  const valueRange = maxValue - minValue || 1;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Top Header Bar */}
        <div className="border-b border-border-default bg-white">
          <div className="container-custom">
            <div className="flex items-center justify-between h-16">
              {/* Brand Selector Dropdown */}
              {brands.length > 0 ? (
                <Dropdown
                  value={selectedBrandId || metric.brand_id || brands[0]?.id || ''}
                  options={brandOptions}
                  onChange={(value) => {
                    const newBrandId = value as string;
                    handleBrandChange(newBrandId);
                    // If changing brands, navigate back to scoreboard filtered by that brand
                    // The current metric belongs to metric.brand_id, so switching brands
                    // should take you back to the scoreboard for that brand
                    if (newBrandId !== metric.brand_id) {
                      router.push(`/?brand=${newBrandId}`);
                    }
                  }}
                  placeholder="Select brand"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 text-body font-medium text-neutral-500">
                  <span>No brands available</span>
                </div>
              )}
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
      
      <div className="container-custom section">
        {/* Breadcrumb */}
        <div className="mb-2">
          <nav className="text-body-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/" className="hover:text-neutral-700 transition-colors">Scoreboard</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">{metric.name}</span>
          </nav>
        </div>
        
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-h1 font-bold text-neutral-900">{metric.name}</h1>
          
          <div className="flex items-center gap-4">
            {/* Year Multi-Select Dropdown */}
            <MultiSelect
              value={selectedYears}
              options={yearOptions}
              onChange={(values) => setSelectedYears(values.map(v => Number(v)))}
              placeholder="Select years"
            />
            
            {/* YTD Toggle - Always visible */}
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-neutral-700 font-medium">Year to date</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={showYTD}
                  onChange={(e) => setShowYTD(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Table - Years as rows, months as columns */}
        <div className="card overflow-x-auto mb-8 p-0">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell table-cell-header text-left" style={{ minWidth: '80px', width: '80px' }}></th>
                {months.map((month) => (
                  <th
                    key={month.num}
                    className="table-cell table-cell-header text-center"
                    style={{ minWidth: '60px', width: '60px' }}
                  >
                    {month.short}
                  </th>
                ))}
                {showYTD && (
                  <th className="table-cell table-cell-header text-center" style={{ minWidth: '80px', width: '80px' }}>
                    YTD
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {years.length === 0 ? (
                <tr>
                  <td colSpan={months.length + (showYTD ? 2 : 1)} className="table-cell text-center text-neutral-400 p-12">
                    No data yet. Click on a cell to add a value.
                  </td>
                </tr>
              ) : (
                <>
                  {years.map((year) => {
                    const ytdValue = calculateYTD(year);
                    return (
                      <tr key={year} className="border-b border-border-grid">
                        <td className="table-cell text-left font-semibold text-neutral-700">
                          {year}
                        </td>
                        {months.map((month) => {
                          const value = valuesByYear[year]?.[month.num] || null;
                          return (
                            <td
                              key={`${year}-${month.num}`}
                              className="table-cell table-cell-numeric"
                            >
                              <EditableCell
                                metricId={metric.id}
                                year={year}
                                month={month.num}
                                value={value}
                                onSave={handleValueSaved}
                              />
                            </td>
                          );
                        })}
                        {showYTD && (
                          <td className="table-cell table-cell-numeric font-semibold text-neutral-700 border-l-2 border-border-strong">
                            {ytdValue > 0 ? formatNumber(ytdValue) : '—'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Graph and AI Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Container */}
          <div className="lg:col-span-2 chart-container">
            <h2 className="chart-title">Trend</h2>
            {graphData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-neutral-400 text-body">
                No data to display
              </div>
            ) : (
              <div className="relative">
                <div className="h-64">
                  <svg className="w-full h-full" viewBox="0 0 800 220" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const y = 20 + (i * 40);
                      return (
                        <line
                          key={i}
                          x1="60"
                          y1={y}
                          x2="760"
                          y2={y}
                          stroke="var(--color-border-grid)"
                          strokeWidth="1"
                        />
                      );
                    })}
                    
                    {/* X-axis */}
                    <line
                      x1="60"
                      y1="180"
                      x2="760"
                      y2="180"
                      stroke="var(--color-border-default)"
                      strokeWidth="2"
                    />
                    
                    {/* Y-axis */}
                    <line
                      x1="60"
                      y1="180"
                      x2="60"
                      y2="20"
                      stroke="var(--color-border-default)"
                      strokeWidth="2"
                    />
                    
                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const y = 20 + (i * 40);
                      const value = maxValue - (i / 4) * valueRange;
                      const labelValue = formatNumber(Math.round(value));
                      return (
                        <text
                          key={i}
                          x="55"
                          y={y + 4}
                          textAnchor="end"
                          fontSize="12"
                          fill="var(--color-neutral-600)"
                          fontFamily="var(--font-mono)"
                        >
                          {labelValue}
                        </text>
                      );
                    })}
                    
                    {/* Year lines */}
                    {years.map((year) => {
                      const yearData = months.map(month => {
                        const value = valuesByYear[year]?.[month.num];
                        return value ? { month: month.num, value } : null;
                      }).filter(Boolean) as Array<{ month: number; value: number }>;
                      
                      if (yearData.length === 0) return null;
                      
                      const yearColor = year === 2023 ? 'var(--color-neutral-400)' :
                                       year === 2024 ? 'var(--color-primary-600)' :
                                       'var(--color-info-500)';
                      
                      return (
                        <g key={year}>
                          <polyline
                            points={yearData
                              .map((d, i) => {
                                const x = 60 + (i / 11) * 700;
                                const y = 180 - ((d.value - minValue) / valueRange) * 160;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke={yearColor}
                            strokeWidth="2"
                          />
                          {yearData.map((d, i) => {
                            const x = 60 + (i / 11) * 700;
                            const y = 180 - ((d.value - minValue) / valueRange) * 160;
                            return (
                              <circle
                                key={`${year}-${d.month}`}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={yearColor}
                              />
                            );
                          })}
                        </g>
                      );
                    })}
                    
                    {/* Month labels - positioned below the X-axis line */}
                    {months.map((month, i) => {
                      const x = 60 + (i / 11) * 700;
                      return (
                        <text
                          key={month.num}
                          x={x}
                          y="205"
                          textAnchor="middle"
                          fontSize="12"
                          fill="var(--color-neutral-600)"
                          fontFamily="var(--font-sans)"
                        >
                          {month.short}
                        </text>
                      );
                    })}
                  </svg>
                </div>
                
                {/* Legend - positioned inside the chart container with proper padding */}
                <div className="chart-legend">
                  {years.map((year) => {
                    const yearColor = year === 2023 ? 'var(--color-neutral-400)' :
                                     year === 2024 ? 'var(--color-primary-600)' :
                                     'var(--color-info-500)';
                    return (
                      <div key={year} className="chart-legend-item">
                        <div
                          className="chart-legend-color"
                          style={{ backgroundColor: yearColor }}
                        />
                        <span>{year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI Insight Panel */}
          <div className="card p-6">
            <h2 className="text-h4 font-semibold text-neutral-900 mb-4">AI Insight</h2>
            <div className="text-body text-neutral-700 leading-relaxed">
              <p>Traffic has increased significantly this year compared to previous years, with a consistent upward trend in recent months.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

