/**
 * Infer IANA timezone from lat/lng.
 * Covers the two destinations on this trip: Alaska and Hawaii.
 */
export function timezoneFromLocation(lat: number | null, lng: number | null): string {
  if (lat !== null && lng !== null) {
    // Hawaii: roughly 18–24°N, 154–162°W
    if (lat >= 18 && lat <= 24 && lng >= -162 && lng <= -154) {
      return 'Pacific/Honolulu';
    }
  }
  // Default to Alaska (Anchorage covers mainland AK and handles AKST/AKDT automatically)
  return 'America/Anchorage';
}

/**
 * Interpret a timezone-naive ISO string (e.g. "2026-04-13T01:00:00" from EXIF)
 * as local time in the given IANA timezone and return the correct UTC Date.
 *
 * EXIF DateTimeOriginal has no timezone — it's the camera's local clock.
 * Treating it as UTC (what JS does by default) gives wrong results when
 * the camera is in a non-UTC timezone.
 */
export function parseLocalInTimezone(localIso: string, timezone: string): Date {
  // Step 1: treat as UTC naively to get an approximate epoch
  const naive = new Date(localIso + 'Z');

  // Step 2: find what the clock shows in the target timezone at that epoch
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  }).formatToParts(naive);

  const p: Record<string, string> = {};
  for (const { type, value } of parts) p[type] = value;

  const tzDate = new Date(Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    p.hour === '24' ? 0 : +p.hour,
    +p.minute,
    +p.second,
  ));

  // Step 3: offset = difference between naive UTC and tz-formatted version
  //         applying it converts the naive UTC into true UTC
  return new Date(naive.getTime() + (naive.getTime() - tzDate.getTime()));
}
