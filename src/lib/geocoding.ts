// Geocode a place name via Nominatim (OpenStreetMap, free, no API key needed).
export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'sab-trip-travel-blog/1.0' },
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results[0]) {
      console.log(`[geo] No geocode result for: "${query}"`);
      return null;
    }
    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);
    console.log(`[geo] "${query}" → ${lat}, ${lng}`);
    return { lat, lng };
  } catch (err) {
    console.warn('[geo] Nominatim error:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
