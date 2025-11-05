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
    
    if (!brands || brands.length === 0) {
      // No brands found - return empty state (could be super admin with no brands or no access)
      return <ScoreboardContent brands={[]} allMetricValues={{}} />;
    }

    // Get metrics for each brand
    const brandsWithMetrics = await Promise.all(
      brands.map(async (brand) => {
        try {
          const metrics = await getBrandMetricsWithLatestValues(brand.id);
          return {
            ...brand,
            metrics,
          };
        } catch (err) {
          console.error(`Error fetching metrics for brand ${brand.id}:`, err);
          return {
            ...brand,
            metrics: [],
          };
        }
      })
    );

    // Get all metric values for years 2023-2025 (or current year if > 2025)
    let allMetricValues = {};
    try {
      allMetricValues = await getAllMetricValuesForYears();
    } catch (err) {
      console.error('Error fetching metric values:', err);
    }

    return <ScoreboardContent brands={brandsWithMetrics} allMetricValues={allMetricValues} />;
  } catch (error) {
    console.error('Error loading scoreboard data:', error);
    // Return empty state on error
    return <ScoreboardContent brands={[]} allMetricValues={{}} />;
  }
}
