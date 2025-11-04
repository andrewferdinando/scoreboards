import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getUserBrands, getBrandMetricsWithLatestValues } from '@/lib/queries';
import Link from 'next/link';

export default async function ScoreboardPage() {
  const brands = await getUserBrands();

  // Get metrics for each brand
  const brandsWithMetrics = await Promise.all(
    brands.map(async (brand) => {
      const metrics = await getBrandMetricsWithLatestValues(brand.id);
      return {
        ...brand,
        metrics,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4">Scoreboards</h1>
          <p className="text-lg text-gray-600">
            Track and manage metrics across your brands
          </p>
        </div>

        {/* Brands Grid */}
        {brandsWithMetrics.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No brands found.</p>
            <p className="text-sm text-gray-400">
              Create a brand in your database to get started.
            </p>
          </Card>
        ) : (
          <div className="space-section">
            {brandsWithMetrics.map((brand) => (
              <Card key={brand.id} className="p-6 lg:p-8" hover>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="mb-2">{brand.name}</h2>
                    <p className="text-sm text-gray-500">
                      {brand.metrics.length} {brand.metrics.length === 1 ? 'metric' : 'metrics'}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                {brand.metrics.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <p className="text-sm">No metrics yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brand.metrics.map((metric) => (
                      <Link
                        key={metric.id}
                        href={`/metric/${metric.id}`}
                        className="block"
                      >
                        <Card className="p-5 hover transition-all duration-200" hover>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {metric.name}
                            </h3>
                            {metric.data_source && (
                              <Badge variant="primary" className="text-xs">
                                {metric.data_source}
                              </Badge>
                            )}
                          </div>
                          
                          {metric.latestValue !== null ? (
                            <div>
                              <div className="text-3xl font-bold text-gray-900 mb-1">
                                {typeof metric.latestValue === 'number' 
                                  ? metric.latestValue.toLocaleString()
                                  : metric.latestValue}
                              </div>
                              <p className="text-xs text-gray-500">
                                {metric.latestMonth && metric.latestYear
                                  ? `${new Date(metric.latestYear, metric.latestMonth - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                                  : 'Latest value'}
                              </p>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No data yet
                            </div>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
