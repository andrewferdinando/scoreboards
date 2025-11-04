import { getMetric } from '@/lib/queries';
import { MetricValue } from '@/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MetricDetailContent } from '@/components/MetricDetailContent';

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

  return <MetricDetailContent metric={metric} values={values} />;
}
