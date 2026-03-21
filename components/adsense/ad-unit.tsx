'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT_ID } from './google-adsense';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  /**
   * The ad slot ID from your AdSense account
   */
  slot: string;
  /**
   * Ad format - pass the exact `data-ad-format` value you want to use.
   * Common values: 'auto', 'fluid', 'rectangle', 'vertical', 'horizontal',
   * or vendor-specific variants like 'autorelaxed'. Use a string to allow
   * future/less-common formats.
   */
  format?: string;
  /**
   * Whether the ad should be responsive
   */
  responsive?: boolean;
  /**
   * Custom class name for styling the container
   */
  className?: string;
  /**
   * Layout for in-feed or in-article ads
   */
  layout?: string;
  /**
   * Layout key for matched content
   */
  layoutKey?: string;
  /**
   * Custom styles for the ad container
   */
  style?: React.CSSProperties;
}

/**
 * AdUnit component for displaying individual Google AdSense ads.
 *
 * Usage:
 * ```tsx
 * // Responsive display ad
 * <AdUnit slot="1234567890" format="auto" responsive />
 *
 * // In-article ad
 * <AdUnit slot="1234567890" format="fluid" layout="in-article" />
 *
 * // Fixed size ad
 * <AdUnit
 *   slot="1234567890"
 *   style={{ display: 'inline-block', width: '300px', height: '250px' }}
 * />
 * ```
 */
/**
 * AdUnit — COMMENTED OUT while ads are disabled.
 * Returns null to render nothing. Uncomment inner code to re-enable.
 */
export function AdUnit({
  slot: _slot,
  format: _format = 'auto',
  responsive: _responsive = true,
  className: _className = '',
  layout: _layout,
  layoutKey: _layoutKey,
  style: _style,
}: AdUnitProps) {
  // Ads disabled — return nothing
  return null;

  // const adRef = useRef<HTMLModElement>(null);
  // const isAdLoaded = useRef(false);
  //
  // useEffect(() => {
  //   const loadAd = () => {
  //     try {
  //       if (typeof window !== 'undefined' && adRef.current) {
  //         const isProcessed =
  //           adRef.current.getAttribute('data-adsbygoogle-status') === 'done';
  //         if (!isProcessed) {
  //           (window.adsbygoogle = window.adsbygoogle || []).push({});
  //           isAdLoaded.current = true;
  //         }
  //       }
  //     } catch (error) {
  //       console.error('AdSense error in AdUnit:', error);
  //     }
  //   };
  //   const timer = setTimeout(loadAd, 300);
  //   return () => { clearTimeout(timer); };
  // }, []);
  //
  // const defaultStyle: React.CSSProperties = {
  //   display: 'block', width: '100%', overflow: 'hidden', ...style,
  // };
  //
  // return (
  //   <div className={`w-full overflow-hidden ${className}`}>
  //     <ins ref={adRef} className='adsbygoogle' style={defaultStyle}
  //       data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={slot}
  //       data-ad-format={format}
  //       {...(format !== 'autorelaxed' && { 'data-full-width-responsive': responsive ? 'true' : 'false' })}
  //       {...(layout && { 'data-ad-layout': layout })}
  //       {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
  //     />
  //   </div>
  // );
}
