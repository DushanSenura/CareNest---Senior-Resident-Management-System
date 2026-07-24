'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import novaCoreLogo from '@/assets/NovaCore Tech Logo.png';

export function AppFooter() {
  const pathname = usePathname();
  const hasSidebar = pathname !== '/' && pathname !== '/login';

  return (
    <footer className={`border-t border-black/10 bg-ink px-5 py-4 text-white ${hasSidebar ? 'lg:ml-64' : ''}`}>
      <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-2.5">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden">
          <Image
            src={novaCoreLogo}
            alt="NovaCore Techs company logo"
            className="h-full w-full object-cover"
            style={{ transform: 'scale(1.8) translateY(2%)' }}
          />
        </span>
        <p className="text-center text-xs font-medium text-white/65">
          Copyright © 2026 NovaCore Techs
        </p>
      </div>
    </footer>
  );
}
