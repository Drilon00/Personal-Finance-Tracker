'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <p className="text-8xl font-black text-slate-100 select-none">404</p>
          <div className="-mt-4">
            <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => history.back()}>
            Go back
          </Button>
          <Button leftIcon={<Home className="h-4 w-4" />} asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
