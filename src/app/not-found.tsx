import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="p-12 text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Link href="/" className="btn-primary">
          Return to Scoreboards
        </Link>
      </Card>
    </div>
  );
}

