import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <Card className="p-12 text-center max-w-md">
        <h1 className="text-display font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-body-lg text-neutral-600 mb-8">Page not found</p>
        <Link href="/">
          <Button variant="primary">Return to Scoreboards</Button>
        </Link>
      </Card>
    </div>
  );
}

