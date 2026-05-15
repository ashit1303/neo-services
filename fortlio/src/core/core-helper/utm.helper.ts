const extractUTMParams = (url: URL) => {
  try {
    const parsedUrl = new URL(url);

    const getKeys = (key: string) => parsedUrl.searchParams.get(key) || null;

    return {
      utm_source: getKeys('utm_source'),
      utm_medium: getKeys('utm_medium'),
      utm_campaign: getKeys('utm_campaign'),
      utm_content: getKeys('utm_content'),
      utm_creative: getKeys('utm_creative'),
      utm_term: getKeys('utm_term'),
      utm_match: getKeys('utm_match'),
      utm_id: getKeys('utm_id'),
      utm_city: getKeys('utm_city'),
      gclid: getKeys('gclid'),
      fbclid: getKeys('fbclid'),
      gbraid: getKeys('gbraid'),
      utm_platform: getKeys('utm_platform'),
      utm_placement: getKeys('utm_placement'),
      utm_adgroup: getKeys('utm_adgroup'),
    };
  } catch (err: any) {
    console.error('Invalid URL:', err?.message || err, url);
    return null;
  }
};

module.exports = { extractUTMParams };
