// Evaluate on the local page to summarize HubSpot tracking evidence.
(() => {
  const loaderHost = /(^|\.)hs-scripts\.com$/;
  const analyticsHost = /(^|\.)hs-analytics\.net$/;
  const cookieNames = [
    'hubspotutk',
    '__hstc',
    '__hssc',
    '__hssrc',
    '__hs_opt_out',
    '__hs_do_not_track',
    '__hs_cookie_cat_pref',
  ];

  const loaderElements = Array.from(document.scripts).filter((script) => {
    return script.id === 'hs-script-loader' ||
      (script.src && loaderHost.test(new URL(script.src).hostname));
  });
  const resources = performance.getEntriesByType('resource').map((entry) => new URL(entry.name));
  const visibleCookies = new Set(document.cookie.split(';').map((cookie) => {
    return cookie.split('=', 1)[0].trim();
  }));

  return {
    loaderElements: loaderElements.length,
    loaderResourceEntries: resources.filter((url) => loaderHost.test(url.hostname)).length,
    analyticsResourceEntries: resources.filter((url) => analyticsHost.test(url.hostname)).length,
    trackingPixelResourceEntries: resources.filter((url) => url.pathname.endsWith('/__ptq.gif')).length,
    trackingQueuePresent: typeof window._hsq?.push === 'function',
    consentQueuePresent: typeof window._hsp?.push === 'function',
    visibleHubSpotCookieNames: cookieNames.filter((name) => visibleCookies.has(name)),
  };
})();
