// standard Google Polyline encoder.
export const encodeGeoPointsPolyline = (points: { plat: number; plon: number }[]) => {
  let lastLat = 0;
  let lastLng = 0;
  let encoded = '';

  const encodeValue = (value: number) => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    let result = '';

    while (v >= 0x20) {
      result += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }

    result += String.fromCharCode(v + 63);
    return result;
  };

  for (const { plat, plon } of points) {
    const lat = Math.round(plat * 1e5);
    const lng = Math.round(plon * 1e5);

    const dLat = lat - lastLat;
    const dLng = lng - lastLng;

    lastLat = lat;
    lastLng = lng;

    encoded += encodeValue(dLat);
    encoded += encodeValue(dLng);
  }
  return encoded;
};
