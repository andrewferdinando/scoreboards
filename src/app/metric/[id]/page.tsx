import { getMetric, getUserBrands } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { MetricDetailContent } from '@/components/MetricDetailContent';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface MetricPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MetricPage({ params }: MetricPageProps) {
  // Check authentication
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  
  // Fetch brands and metric data in parallel
  const [brands, metricData] = await Promise.all([
    getUserBrands(),
    getMetric(id),
  ]);

  if (!metricData) {
    notFound();
  }

  const { values, ...metric } = metricData;

  return <MetricDetailContent metric={metric} values={values} brands={brands} />;
}
