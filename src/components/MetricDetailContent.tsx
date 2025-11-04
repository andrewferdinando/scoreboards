'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EditableCell } from './EditableCell';
import { Metric, MetricValue } from '@/types/database';

interface MetricDetailContentProps {
  metric: Metric;
  values: MetricValue[];
}

export function MetricDetailContent({ metric, values }: MetricDetailContentProps) {
  const router = useRouter();
  const [showYTD, setShowYTD] = useState(true);
  
  // Get available years (2023 to current year - automatically includes new year on Jan 1st)
  const currentYear = new Date().getFullYear();
  
  // Available years for selection (2023 to current year)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let year = 2023; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }, [currentYear]);
  
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
    { num: 1, short: 'Jan' },
    { num: 2, short: 'Feb' },
    { num: 3, short: 'March' },
    { num: 4, short: 'April' },
    { num: 5, short: 'May' },
    { num: 6, short: 'June' },
    { num: 7, short: 'July' },
    { num: 8, short: 'August' },
    { num: 9, short: 'Sept' },
    { num: 10, short: 'Oct' },
    { num: 11, short: 'Nov' },
    { num: 12, short: 'Dec' },
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

  // Get all years from data, sorted descending, filtered by selected years
  const years = useMemo(() => {
    return Object.keys(valuesByYear)
      .map(Number)
      .filter(year => selectedYears.includes(year))
      .sort((a, b) => b - a);
  }, [valuesByYear, selectedYears]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Scoreboards
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{metric.name}</h1>
            
            {/* Year Multi-Select Dropdown */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Years</label>
                <div className="relative">
                  <select
                    multiple
                    value={selectedYears.map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                      setSelectedYears(selected);
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]"
                    size={Math.min(availableYears.length, 4)}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-gray-400">Hold Ctrl/Cmd to multi-select</span>
              </div>
              
              {/* YTD Toggle - Always visible */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">YTD</span>
                <button
                  onClick={() => setShowYTD(!showYTD)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    showYTD ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      showYTD ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700"></th>
                {months.map((month) => (
                  <th
                    key={month.num}
                    className="text-center p-4 font-semibold text-gray-700 min-w-[80px]"
                  >
                    {month.short}
                  </th>
                ))}
                {showYTD && (
                  <th className="text-center p-4 font-semibold text-gray-700 min-w-[80px]">
                    YTD
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {years.length === 0 ? (
                <tr>
                  <td colSpan={showYTD ? 14 : 13} className="p-12 text-center text-gray-400">
                    No data yet. Click on a cell to add a value.
                  </td>
                </tr>
              ) : (
                years.map((year, yearIndex) => {
                  const ytdValue = calculateYTD(year);
                  return (
                    <tr
                      key={year}
                      className={`border-b border-gray-200 ${yearIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-4 text-gray-900 font-semibold">{year}</td>
                      {months.map((month) => {
                        const value = valuesByYear[year]?.[month.num] || null;
                        return (
                          <td
                            key={month.num}
                            className="border-b border-gray-200"
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
                        <td className="p-4 text-center text-gray-900 font-semibold border-l-2 border-gray-300">
                          {ytdValue > 0 ? ytdValue.toLocaleString() : '-'}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Graph and AI Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold mb-4">Trend</h2>
            {graphData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data to display
              </div>
            ) : (
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Axes */}
                  <line
                    x1="40"
                    y1="180"
                    x2="760"
                    y2="180"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <line
                    x1="40"
                    y1="180"
                    x2="40"
                    y2="20"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  
                  {/* Graph line */}
                  {graphData.length > 1 && (
                    <polyline
                      points={graphData
                        .map((d, i) => {
                          const x = 40 + (i / (graphData.length - 1)) * 720;
                          const y = 180 - ((d.value - minValue) / valueRange) * 160;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3"
                    />
                  )}
                  
                  {/* Data points */}
                  {graphData.map((d, i) => {
                    const x = 40 + (i / Math.max(graphData.length - 1, 1)) * 720;
                    const y = 180 - ((d.value - minValue) / valueRange) * 160;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#0284c7"
                      />
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">AI Insight</h2>
            <div className="min-h-[200px] text-gray-400 text-sm">
              <p>AI insights will appear here based on your metric data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

