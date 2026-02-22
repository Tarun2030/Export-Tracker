'use client';

import { Badge } from '@/components/ui/badge';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 lg:px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
      <h2 className="text-sm font-medium text-slate-600 hidden sm:block">
        Export Business Management
      </h2>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs hidden sm:inline-flex">
          Demo Mode
        </Badge>
      </div>
    </header>
  );
}
