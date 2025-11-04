'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export function ScoreboardContent({ brands, allMetricValues }: ScoreboardContentProps) {
  const router = useRouter();
  const [showAddMetricForm, setShowAddMetricForm] = useState(false);

  const handleMetricAdded = () => {
    router.refresh();
  };

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

  const currentYear = new Date().getFullYear();

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
            <button
              onClick={() => setShowAddMetricForm(true)}
              className="btn-secondary border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium"
            >
              Add Metric
            </button>
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
                      <td className="p-4 text-gray-900 font-medium">{metric.name}</td>
                      <td className="p-4 text-gray-600 text-sm">{metric.data_source || '-'}</td>
                      {months.map((month) => {
                        const value = allMetricValues[metric.id]?.[currentYear]?.[month.num] || null;
                        return (
                          <td
                            key={month.num}
                            className="border-b border-gray-200"
                          >
                            <EditableCell
                              metricId={metric.id}
                              year={currentYear}
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
