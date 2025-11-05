import { getUserBrands, getBrandMetricsWithLatestValues, getAllMetricValuesForYears } from '@/lib/queries';
import { ScoreboardContent } from '@/components/ScoreboardContent';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ScoreboardPage() {
  // Check authentication
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  try {
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

    // Get all metric values for years 2023-2025 (or current year if > 2025)
    const allMetricValues = await getAllMetricValuesForYears();

    return <ScoreboardContent brands={brandsWithMetrics} allMetricValues={allMetricValues} />;
  } catch (error) {
    console.error('Error loading scoreboard data:', error);
    // Return empty state on error
    return <ScoreboardContent brands={[]} allMetricValues={{}} />;
  }
}
