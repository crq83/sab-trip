import ExifReader from 'exifreader';
import { timezoneFromLocation, parseLocalInTimezone } from '@/lib/timezone';

export interface ExifResult {
  lat: number | null;
  lng: number | null;
  takenAt: Date | null;
}

export function extractExif(buffer: Buffer): ExifResult {
  try {
    const tags = ExifReader.load(buffer, { expanded: true });

    let lat: number | null = null;
    let lng: number | null = null;
    let takenAt: Date | null = null;

    if (tags.gps) {
      console.log('[exif] GPS group present:', JSON.stringify(tags.gps));
    } else {
      console.log('[exif] No GPS group — likely stripped by email client');
    }

    if (tags.gps) {
      const gpsLat = (tags.gps as Record<string, unknown>).Latitude;
      const gpsLng = (tags.gps as Record<string, unknown>).Longitude;

      if (typeof gpsLat === 'number' && typeof gpsLng === 'number') {
        lat = gpsLat;
        lng = gpsLng;
        console.log(`[exif] GPS decimal: ${lat}, ${lng}`);
      } else {
        const rawLat = (tags.gps as Record<string, { description?: string }>)['GPS Latitude'];
        const rawLng = (tags.gps as Record<string, { description?: string }>)['GPS Longitude'];
        const latRef = (tags.gps as Record<string, { description?: string }>)['GPS Latitude Ref'];
        const lngRef = (tags.gps as Record<string, { description?: string }>)['GPS Longitude Ref'];

        if (rawLat?.description && rawLng?.description) {
          const parsedLat = parseDms(rawLat.description);
          const parsedLng = parseDms(rawLng.description);
          if (parsedLat !== null && parsedLng !== null) {
            lat = latRef?.description === 'S' ? -parsedLat : parsedLat;
            lng = lngRef?.description === 'W' ? -parsedLng : parsedLng;
            console.log(`[exif] GPS DMS fallback: ${lat}, ${lng}`);
          }
        } else {
          console.log('[exif] GPS group exists but coordinates not parseable');
        }
      }
    }

    const exifTags = tags.exif as Record<string, { description?: string }> | undefined;
    if (exifTags?.DateTimeOriginal?.description) {
      const raw = exifTags.DateTimeOriginal.description;
      // EXIF format: "2026:04:10 14:32:00" — local time, no timezone
      const match = raw.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        const localIso = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
        // Interpret local time in the timezone inferred from GPS coordinates
        const timezone = timezoneFromLocation(lat, lng);
        takenAt = parseLocalInTimezone(localIso, timezone);
      }
    }

    return { lat, lng, takenAt };
  } catch (err) {
    console.log('[exif] Parse error:', err instanceof Error ? err.message : String(err));
    return { lat: null, lng: null, takenAt: null };
  }
}

function parseDms(dms: string): number | null {
  const match = dms.match(/(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1]) + parseFloat(match[2]) / 60 + parseFloat(match[3]) / 3600;
}
