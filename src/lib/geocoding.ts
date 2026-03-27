// Geocode a place name via Nominatim (OpenStreetMap, free, no API key needed).
export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'sab-trip-travel-blog/1.0' },
    });
    if (!res.ok) return null;
    const results = await res.json();
    const result = results[0];
    if (!result) {
      console.log(`[geo] No geocode result for: "${query}"`);
      return null;
    }
    // Reject low-importance results — spurious word matches score ~0.10;
    // real settlements (even small ones like Girdwood, AK) score > 0.15.
    const importance = parseFloat(result.importance ?? '0');
    if (importance < 0.13) {
      console.log(`[geo] Rejected low-importance result for "${query}": ${result.display_name} (importance=${importance})`);
      return null;
    }
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    console.log(`[geo] "${query}" → ${lat}, ${lng} (importance=${importance})`);
    return { lat, lng };
  } catch (err) {
    console.warn('[geo] Nominatim error:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
