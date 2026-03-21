'use client';

import { AdUnit } from './ad-unit';

interface MultiplexAdProps {
  /**
   * Optional container classname for styling/spacing
   */
  containerClassName?: string;
}

/**
 * MultiplexAd component for displaying Google AdSense multiplex (autorelaxed) ads.
 * These ads are optimized for in-feed and in-content placements with high CPC potential.
 *
 * Slot: 7277593169 (multiplex/autorelaxed format)
 * Format: autorelaxed - self-adjusting responsive format
 */
export function MultiplexAd({ containerClassName = 'my-8' }: MultiplexAdProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      <AdUnit
        slot='7277593169'
        format='autorelaxed'
        responsive
        style={{ display: 'block'}}
      />
    </div>
  );
}
