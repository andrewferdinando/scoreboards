'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AddMetricForm } from '@/components/forms/AddMetricForm';
import { EditableCell } from '@/components/EditableCell';
import { UserMenu } from './UserMenu';
import { Dropdown } from './ui/Dropdown';
import { getSelectedBrandId, setSelectedBrandId } from '@/lib/brandSelection';
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
  
  // Brand selection state - initialize from localStorage or default to first brand
  const [selectedBrandId, setSelectedBrandIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = getSelectedBrandId();
      if (saved && brands.some(b => b.id === saved)) {
        return saved;
      }
    }
    return brands && brands.length > 0 ? brands[0].id : null;
  });

  // Update localStorage when brand selection changes
  const setSelectedBrandId = useCallback((brandId: string | null) => {
    setSelectedBrandIdState(brandId);
    setSelectedBrandId(brandId);
  }, []);

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = getSelectedBrandId();
    if (saved && brands.some(b => b.id === saved)) {
      setSelectedBrandIdState(saved);
    } else if (brands.length > 0 && !selectedBrandId) {
      const firstBrandId = brands[0].id;
      setSelectedBrandIdState(firstBrandId);
      setSelectedBrandId(firstBrandId);
    }
  }, [brands]);
  
  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.name,
  }));
  
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
    { num: 1, short: 'JAN' },
    { num: 2, short: 'FEB' },
    { num: 3, short: 'MAR' },
    { num: 4, short: 'APR' },
    { num: 5, short: 'MAY' },
    { num: 6, short: 'JUN' },
    { num: 7, short: 'JUL' },
    { num: 8, short: 'AUG' },
    { num: 9, short: 'SEP' },
    { num: 10, short: 'OCT' },
    { num: 11, short: 'NOV' },
    { num: 12, short: 'DEC' },
  ];
  
  // Get all metrics for the selected brand (or all brands if none selected)
  // Memoize this to prevent recalculation on every render
  const allMetrics = useMemo(() => {
    if (selectedBrandId) {
      const brand = brands.find(b => b.id === selectedBrandId);
      return brand ? brand.metrics.map(metric => ({ ...metric, brand_name: brand.name })) : [];
    }
    // If no brand selected, show all metrics from all brands
    return brands.flatMap(brand => 
      brand.metrics.map(metric => ({ ...metric, brand_name: brand.name }))
    );
  }, [brands, selectedBrandId]);

  // Filter metric values by selected brand AND selected year
  const filteredMetricValues = useMemo(() => {
    // First filter by brand (if selected)
    let brandFiltered = metricValues;
    if (selectedBrandId) {
      // Get all metric IDs for the selected brand
      const selectedBrandMetricIds = new Set(
        allMetrics.map(metric => metric.id)
      );
      
      // Filter metricValues to only include values for metrics in the selected brand
      brandFiltered = {};
      Object.keys(metricValues).forEach(metricId => {
        if (selectedBrandMetricIds.has(metricId)) {
          brandFiltered[metricId] = metricValues[metricId];
        }
      });
    }
    
    // Then filter by selected year
    const filtered: Record<string, Record<number, Record<number, number>>> = {};
    Object.keys(brandFiltered).forEach(metricId => {
      if (brandFiltered[metricId][selectedYear]) {
        filtered[metricId] = {
          [selectedYear]: brandFiltered[metricId][selectedYear]
        };
      }
    });
    return filtered;
  }, [metricValues, selectedBrandId, selectedYear, allMetrics]);

  // Group metrics by name for display
  const groupedMetrics = useMemo(() => {
    const grouped: Record<string, typeof allMetrics> = {};
    allMetrics.forEach(metric => {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    });
    return grouped;
  }, [allMetrics]);

  return (
    <>
      <div className="min-h-screen bg-bg-base">
        {/* Top Header Bar */}
        <div className="border-b border-border-default bg-white">
          <div className="container-custom">
            <div className="flex items-center justify-between h-16">
              {/* Brand Selector Dropdown */}
              {brands.length > 0 ? (
                <Dropdown
                  value={selectedBrandId || ''}
                  options={brandOptions}
                  onChange={(value) => setSelectedBrandId(value as string)}
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
              <span>Home</span>
              <span className="mx-2">/</span>
              <span className="text-neutral-700">Scoreboard</span>
            </nav>
          </div>
          
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-h1 font-bold text-neutral-900">Scoreboard</h1>
            <div className="flex items-center gap-4">
              {/* Year Selector Dropdown */}
              <Dropdown
                value={selectedYear}
                options={yearOptions}
                onChange={(value) => setSelectedYear(Number(value))}
                placeholder="Select year"
              />
              
              {/* Add Button */}
              <button
                onClick={() => setShowAddMetricForm(true)}
                className="button-primary"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Table */}
          {allMetrics.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-neutral-500 mb-4">No metrics found.</p>
              <button
                onClick={() => setShowAddMetricForm(true)}
                className="button-primary"
              >
                Add Your First Metric
              </button>
            </div>
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-cell table-cell-header text-left" style={{ minWidth: '150px', width: '150px' }}>Metric</th>
                    {months.map((month) => (
                      <th
                        key={month.num}
                        className="table-cell table-cell-header text-center"
                        style={{ minWidth: '60px', width: '60px' }}
                      >
                        {month.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedMetrics).map(([metricName, metricsGroup]) => (
                    <React.Fragment key={metricName}>
                      {metricsGroup.map((metric, metricIndex) => {
                        const isFirstInGroup = metricIndex === 0;
                        return (
                          <tr
                            key={metric.id}
                            className="border-b border-border-grid"
                          >
                            <td className="table-cell">
                              {isFirstInGroup ? (
                                <div>
                                  <Link 
                                    href={`/metric/${metric.id}`}
                                    className="text-neutral-900 font-semibold text-body hover:text-primary-600 transition-colors block"
                                  >
                                    {metric.name}
                                  </Link>
                                  {metric.data_source && (
                                    <div className="text-body-sm text-neutral-500 mt-1">
                                      {metric.data_source}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-body-sm text-neutral-500">
                                  {metric.data_source || '-'}
                                </div>
                              )}
                            </td>
                            {months.map((month) => {
                              const value = filteredMetricValues[metric.id]?.[selectedYear]?.[month.num] || null;
                              return (
                                <td
                                  key={month.num}
                                  className="table-cell table-cell-numeric"
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
                        );
                      })}
                    </React.Fragment>
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
