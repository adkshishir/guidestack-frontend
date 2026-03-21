'use client';

import { AdUnit } from './ad-unit';

interface SidebarAdProps {
  /**
   * Optional container classname for styling
   */
  containerClassName?: string;
}

/**
 * SidebarAd component for displaying medium rectangle ads in sidebars.
 * 300x250 is a highly clickable and standard sidebar format.
 * Desktop-only placement recommended.
 *
 * Slot: 5504087311 (display format, auto-responsive)
 */
export function SidebarAd({ containerClassName = '' }: SidebarAdProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      <AdUnit
        slot='5504087311'
        format='auto'
        responsive
        className='w-full'
        style={{ display: 'block' }}
      />
    </div>
  );
}
