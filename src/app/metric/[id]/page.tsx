import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getMetric } from '@/lib/queries';
import { MetricValue } from '@/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MetricPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MetricPage({ params }: MetricPageProps) {
  const { id } = await params;
  const metricData = await getMetric(id);

  if (!metricData) {
    notFound();
  }

  const { values, ...metric } = metricData;

  // Group values by year for better organization
  const valuesByYear = values.reduce((acc: Record<number, MetricValue[]>, value: MetricValue) => {
    if (!acc[value.year]) {
      acc[value.year] = [];
    }
    acc[value.year].push(value);
    return acc;
  }, {} as Record<number, MetricValue[]>);

  // Sort years descending
  const years = Object.keys(valuesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Calculate stats
  const allValues = values.map((v: MetricValue) => Number(v.value));
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : null;
  const avgValue = allValues.length > 0 
    ? allValues.reduce((a: number, b: number) => a + b, 0) / allValues.length 
    : null;

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
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2">{metric.name}</h1>
              {metric.data_source && (
                <Badge variant="primary" className="mb-2">
                  {metric.data_source}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {values.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-gray-500 mb-2">Latest Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {Number(values[0]?.value).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {values[0]?.month && values[0]?.year
                  ? `${new Date(values[0].year, values[0].month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : ''}
              </p>
            </Card>

            {maxValue !== null && (
              <Card className="p-6">
                <p className="text-sm text-gray-500 mb-2">Maximum</p>
                <p className="text-3xl font-bold text-gray-900">
                  {maxValue.toLocaleString()}
                </p>
              </Card>
            )}

            {avgValue !== null && (
              <Card className="p-6">
                <p className="text-sm text-gray-500 mb-2">Average</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(avgValue).toLocaleString()}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Values by Year */}
        {values.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-2">No data points yet</p>
            <p className="text-sm text-gray-400">
              Add metric values to start tracking
            </p>
          </Card>
        ) : (
          <div className="space-section">
            {years.map((year) => {
              const yearValues = valuesByYear[year].sort((a, b) => b.month - a.month);
              
              return (
                <Card key={year} className="p-6 lg:p-8">
                  <h2 className="text-2xl font-semibold mb-6">{year}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {yearValues.map((value) => {
                      const monthName = new Date(year, value.month - 1).toLocaleDateString('en-US', { month: 'short' });
                      
                      return (
                        <div
                          key={value.id}
                          className="p-4 rounded-xl bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {monthName}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {Number(value.value).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

