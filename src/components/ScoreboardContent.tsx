'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddMetricForm } from '@/components/forms/AddMetricForm';
import { EditMetricForm } from '@/components/forms/EditMetricForm';
import { EditableCell } from '@/components/EditableCell';
import { UserMenu } from './UserMenu';
import { Dropdown } from './ui/Dropdown';
import { ImportanceIndicator } from './ImportanceIndicator';
import { ToastContainer, type ToastType } from './ui/Toast';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { getSelectedBrandId, setSelectedBrandId } from '@/lib/brandSelection';
import { getAvailableYears, getDefaultYear } from '@/lib/years';
import type { Brand, Metric, Importance } from '@/types/database';

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

// Sortable row component for drag-and-drop
function SortableRow({ 
  metric, 
  isFirstInGroup, 
  months, 
  filteredMetricValues, 
  selectedYear,
  onValueSaved,
  onImportanceUpdate,
  onDeleteClick,
}: {
  metric: MetricWithValues;
  isFirstInGroup: boolean;
  months: Array<{ num: number; short: string }>;
  filteredMetricValues: Record<string, Record<number, Record<number, number>>>;
  selectedYear: number;
  onValueSaved: (metricId: string, year: number, month: number, value: number | null) => void;
  onImportanceUpdate: (metricId: string, importance: Importance) => Promise<void>;
  onDeleteClick: (metric: Metric) => void;
  onEditClick: (metric: Metric) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: metric.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border-grid">
      <td className="table-cell text-center w-6 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <div className="flex items-center justify-center text-neutral-400 hover:text-neutral-600 py-2 touch-none">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-8h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
          </svg>
        </div>
      </td>
      <td className="table-cell">
        {isFirstInGroup ? (
          <div className="flex items-start gap-2">
            <div className="flex-1">
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditClick(metric);
              }}
              className="text-neutral-400 hover:text-primary-600 transition-colors p-1 mt-0.5 flex-shrink-0"
              aria-label="Edit metric"
              title="Edit metric"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-body-sm text-neutral-500">
            {metric.data_source || '-'}
          </div>
        )}
      </td>
      <td className="table-cell text-center">
        <div className="flex items-center justify-center">
          <ImportanceIndicator
            importance={(metric.importance || 'green') as Importance}
            onUpdate={(newImportance) => onImportanceUpdate(metric.id, newImportance)}
          />
        </div>
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
              onSave={onValueSaved}
            />
          </td>
        );
      })}
      <td className="table-cell text-center">
        <button
          onClick={() => onDeleteClick(metric)}
          className="text-neutral-400 hover:text-error-600 transition-colors p-1"
          aria-label="Delete metric"
          title="Delete metric"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

export function ScoreboardContent({ brands: initialBrands, allMetricValues: initialMetricValues }: ScoreboardContentProps) {
  const [showAddMetricForm, setShowAddMetricForm] = useState(false);
  const [metricValues, setMetricValues] = useState(initialMetricValues);
  const brands = initialBrands;
  
  // Get available years dynamically
  const availableYears = useMemo(() => getAvailableYears({ startYear: 2023, yearsAhead: 1 }), []);
  const defaultYear = useMemo(() => getDefaultYear(availableYears), [availableYears]);
  
  // Initialize selectedYear with default, but allow it to be overridden
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== 'undefined') {
      // Could check localStorage or URL params here if needed in the future
      return defaultYear;
    }
    return defaultYear;
  });
  
  // Sync selectedYear if defaultYear changes (e.g., on Jan 1st when new year becomes available)
  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(defaultYear);
    }
  }, [availableYears, defaultYear, selectedYear]);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);
  const [deleteConfirmMetric, setDeleteConfirmMetric] = useState<Metric | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMetric, setEditMetric] = useState<Metric | null>(null);
  
  // Track metrics state to allow removal after deletion
  const [metricsState, setMetricsState] = useState(brands);
  
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
  const handleBrandChange = useCallback((brandId: string | null) => {
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
  }, [brands, selectedBrandId]);
  
  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.name,
  }));
  
  const yearOptions = useMemo(() => availableYears.map(year => ({
    value: year,
    label: year.toString(),
  })), [availableYears]);
  

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
  
  // Sync metricsState with brands prop changes
  useEffect(() => {
    setMetricsState(brands);
  }, [brands]);

  // Get all metrics for the selected brand (or all brands if none selected)
  // Memoize this to prevent recalculation on every render
  const allMetrics = useMemo(() => {
    if (selectedBrandId) {
      const brand = metricsState.find(b => b.id === selectedBrandId);
      return brand ? brand.metrics.map(metric => ({ ...metric, brand_name: brand.name })) : [];
    }
    // If no brand selected, show all metrics from all brands
    return metricsState.flatMap(brand => 
      brand.metrics.map(metric => ({ ...metric, brand_name: brand.name }))
    );
  }, [metricsState, selectedBrandId]);

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

  // Group metrics by name for display (maintain grouping but respect sort_order within groups)
  const groupedMetrics = useMemo(() => {
    const grouped: Record<string, typeof allMetrics> = {};
    allMetrics.forEach(metric => {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    });
    // Sort each group by sort_order
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const aOrder = a.sort_order ?? 999999;
        const bOrder = b.sort_order ?? 999999;
        return aOrder - bOrder;
      });
    });
    return grouped;
  }, [allMetrics]);

  // Toast helper
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    })
  );

  // Handle drag end to reorder metrics
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedBrandId) return;

    const oldIndex = allMetrics.findIndex((m) => m.id === active.id);
    const newIndex = allMetrics.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(allMetrics, oldIndex, newIndex);
    const orderedMetricIds = newOrder.map((m) => m.id);

    // Optimistically update local state
    if (selectedBrandId) {
      setMetricsState(prev => prev.map(brand => {
        if (brand.id !== selectedBrandId) return brand;
        // Update metrics in the correct order, maintaining all metric properties
        const brandMetricIds = new Set(newOrder.filter(m => m.brand_id === selectedBrandId).map(m => m.id));
        return {
          ...brand,
          metrics: brand.metrics
            .filter(m => brandMetricIds.has(m.id))
            .sort((a, b) => {
              const aIndex = newOrder.findIndex(m => m.id === a.id);
              const bIndex = newOrder.findIndex(m => m.id === b.id);
              return aIndex - bIndex;
            }),
        };
      }));
    }

    // Persist to server
    try {
      const response = await fetch('/api/metrics/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_id: selectedBrandId,
          ordered_metric_ids: orderedMetricIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update metric order');
      }

      showToast('Metric order updated successfully', 'success');
    } catch (error) {
      console.error('Error updating metric order:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update metric order', 'error');
      // Revert on error - reload the page to get correct order
      window.location.reload();
    }
  }, [allMetrics, selectedBrandId, showToast]);

  // Handle importance update
  const handleImportanceUpdate = useCallback(async (metricId: string, importance: Importance) => {
    try {
      const response = await fetch(`/api/metrics/${metricId}/importance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importance }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update importance');
      }

      // Update local state
      setMetricsState(prev => prev.map(brand => ({
        ...brand,
        metrics: brand.metrics.map(metric =>
          metric.id === metricId ? { ...metric, importance } : metric
        ),
      })));

      showToast('Importance updated successfully', 'success');
    } catch (error) {
      console.error('Error updating importance:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update importance', 'error');
      throw error; // Re-throw so ImportanceIndicator can handle it
    }
  }, [showToast]);

  // Handle metric deletion
  const handleDeleteMetric = useCallback(async (metricId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/metrics/${metricId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete metric');
      }

      // Remove metric from local state
      setMetricsState(prev => prev.map(brand => ({
        ...brand,
        metrics: brand.metrics.filter(metric => metric.id !== metricId),
      })));

      // Remove metric values from local state
      setMetricValues(prev => {
        const newValues = { ...prev };
        delete newValues[metricId];
        return newValues;
      });

      showToast('Metric deleted successfully', 'success');
      setDeleteConfirmMetric(null);
    } catch (error) {
      console.error('Error deleting metric:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete metric', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [showToast]);

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
                  onChange={(value) => handleBrandChange(value as string)}
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell table-cell-header text-center" style={{ minWidth: '30px', width: '30px' }}></th>
                      <th className="table-cell table-cell-header text-left" style={{ minWidth: '150px', width: '150px' }}>Metric</th>
                      <th className="table-cell table-cell-header text-center" style={{ minWidth: '30px', width: '30px' }}></th>
                      {months.map((month) => (
                        <th
                          key={month.num}
                          className="table-cell table-cell-header text-center"
                          style={{ minWidth: '60px', width: '60px' }}
                        >
                          {month.short}
                        </th>
                      ))}
                      <th className="table-cell table-cell-header text-center" style={{ minWidth: '50px', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <SortableContext
                    items={allMetrics.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody>
                      {Object.entries(groupedMetrics).map(([metricName, metricsGroup]) => (
                        <React.Fragment key={metricName}>
                          {metricsGroup.map((metric, metricIndex) => {
                            const isFirstInGroup = metricIndex === 0;
                            return (
                              <SortableRow
                                key={metric.id}
                                metric={metric}
                                isFirstInGroup={isFirstInGroup}
                                months={months}
                                filteredMetricValues={filteredMetricValues}
                                selectedYear={selectedYear}
                                onValueSaved={handleValueSaved}
                                onImportanceUpdate={handleImportanceUpdate}
                                onDeleteClick={setDeleteConfirmMetric}
                                onEditClick={setEditMetric}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
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

      {/* Edit Metric Modal */}
      {editMetric && (
        <EditMetricForm
          metric={editMetric}
          onSuccess={() => {
            // Refresh data after successful edit
            window.location.reload();
          }}
          onClose={() => setEditMetric(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMetric && (
        <Modal
          isOpen={true}
          onClose={() => !isDeleting && setDeleteConfirmMetric(null)}
          title="Delete metric?"
          className="max-w-md"
          footer={
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmMetric(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteMetric(deleteConfirmMetric.id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete metric'}
              </Button>
            </div>
          }
        >
          <p className="text-body text-neutral-700">
            This will delete this metric and all of its values for this brand. This cannot be undone.
          </p>
        </Modal>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
