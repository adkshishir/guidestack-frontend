'use client';

import { Footer } from '@/common/footer';
import MegaMenu from '@/common/mega-menu';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MegaMenu logo='W' companyName='WealthAlgor' />
      {children}
      <Footer />
    </>
  );
}
