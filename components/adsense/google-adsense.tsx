'use client';

// import Script from 'next/script';

const ADSENSE_CLIENT_ID = 'ca-pub-5060645674260174';

/**
 * GoogleAdSense component — COMMENTED OUT for now.
 * Ads are disabled while we rebuild content quality and re-establish domain trust.
 * Uncomment when ready to re-enable monetization.
 */
export function GoogleAdSense() {
  return null;
  // return (
  //   <Script
  //     id='google-adsense'
  //     async
  //     src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
  //     crossOrigin='anonymous'
  //     strategy='afterInteractive'
  //   />
  // );
}

export { ADSENSE_CLIENT_ID };
