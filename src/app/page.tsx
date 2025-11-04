import { getUserBrands, getBrandMetricsWithLatestValues, getAllMetricValuesForYear } from '@/lib/queries';
import { ScoreboardContent } from '@/components/ScoreboardContent';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ScoreboardPage() {
  const brands = await getUserBrands();
  const currentYear = new Date().getFullYear();

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

  // Get all metric values for the current year
  const allMetricValues = await getAllMetricValuesForYear(currentYear);

  return <ScoreboardContent brands={brandsWithMetrics} allMetricValues={allMetricValues} />;
}
