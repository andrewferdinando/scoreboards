'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AddMetricForm } from '@/components/forms/AddMetricForm';
import { EditableCell } from '@/components/EditableCell';
import type { Brand, Metric } from '@/types/database';

interface MetricWithValues extends Metric {
  values?: Array<{ year: number; month: number; value: number }>;
}

interface BrandWithMetrics extends Brand {
  metrics: MetricWithValues[];
}

interface ScoreboardContentProps {
  brands: BrandWithMetrics[];
  allMetricValues: Record<string, Record<number, Record<number, number>>>;
}

export function ScoreboardContent({ brands: initialBrands, allMetricValues: initialMetricValues }: ScoreboardContentProps) {
  const [showAddMetricForm, setShowAddMetricForm] = useState(false);
  const [metricValues, setMetricValues] = useState(initialMetricValues);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const brands = initialBrands;
  
  // Available years for selection (2023 to current year, at least up to 2025)
  const availableYears = [2023, 2024, 2025];
  if (currentYear > 2025) {
    for (let year = 2026; year <= currentYear; year++) {
      availableYears.push(year);
    }
  }
  
  // Filter metric values for the selected year
  const filteredMetricValues = useMemo(() => {
    const filtered: Record<string, Record<number, Record<number, number>>> = {};
    Object.keys(metricValues).forEach(metricId => {
      if (metricValues[metricId][selectedYear]) {
        filtered[metricId] = {
          [selectedYear]: metricValues[metricId][selectedYear]
        };
      }
    });
    return filtered;
  }, [metricValues, selectedYear]);

  const handleMetricAdded = () => {
    // Force a full page reload to ensure fresh data is fetched
    // The form shows a success message before this is called
    window.location.reload();
  };

  const handleValueSaved = useCallback((metricId: string, year: number, month: number, value: number | null) => {
    // Update local state immediately (spreadsheet-like experience)
    setMetricValues(prev => {
      const newValues = { ...prev };
      if (!newValues[metricId]) {
        newValues[metricId] = {};
      }
      if (!newValues[metricId][year]) {
        newValues[metricId][year] = {};
      }
      if (value === null) {
        // Remove the value if it's null
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [month]: _, ...rest } = newValues[metricId][year];
        newValues[metricId][year] = rest;
        // Clean up empty year object
        if (Object.keys(newValues[metricId][year]).length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [year]: __, ...restYear } = newValues[metricId];
          newValues[metricId] = restYear;
        }
        // Clean up empty metric object
        if (Object.keys(newValues[metricId]).length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [metricId]: ___, ...restMetric } = newValues;
          return restMetric;
        }
      } else {
        newValues[metricId][year][month] = value;
      }
      return newValues;
    });
  }, []);

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

  // Get all metrics across all brands for the scoreboard
  const allMetrics = brands.flatMap(brand => 
    brand.metrics.map(metric => ({ ...metric, brand_name: brand.name }))
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom section">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Scoreboard</h1>
            <div className="flex items-center gap-4">
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                  Year:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setShowAddMetricForm(true)}
                className="btn-secondary border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                Add Metric
              </button>
            </div>
          </div>

          {/* Table */}
          {allMetrics.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500 mb-4">No metrics found.</p>
              <button
                onClick={() => setShowAddMetricForm(true)}
                className="btn-primary"
              >
                Add Your First Metric
              </button>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Metric</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Data Source</th>
                    {months.map((month) => (
                      <th
                        key={month.num}
                        className="text-center p-4 font-semibold text-gray-700 min-w-[80px]"
                      >
                        {month.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allMetrics.map((metric, metricIndex) => (
                    <tr
                      key={metric.id}
                      className={`border-b border-gray-200 ${metricIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-4">
                        <Link 
                          href={`/metric/${metric.id}`}
                          className="text-gray-900 font-medium hover:text-primary-600 hover:underline transition-colors"
                        >
                          {metric.name}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{metric.data_source || '-'}</td>
                      {months.map((month) => {
                        const value = filteredMetricValues[metric.id]?.[selectedYear]?.[month.num] || null;
                        return (
                          <td
                            key={month.num}
                            className="border-b border-gray-200"
                          >
                            <EditableCell
                              metricId={metric.id}
                              year={selectedYear}
                              month={month.num}
                              value={value}
                              onSave={handleValueSaved}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Empty rows for adding more metrics */}
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <tr
                      key={`empty-${rowIndex}`}
                      className={`border-b border-gray-200 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-4 text-gray-400">-</td>
                      <td className="p-4 text-gray-400">-</td>
                      {months.map((month) => (
                        <td key={month.num} className="p-4 text-center text-gray-300">-</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddMetricForm && (
        <AddMetricForm
          brands={brands}
          onSuccess={handleMetricAdded}
          onClose={() => setShowAddMetricForm(false)}
        />
      )}
    </>
  );
}
