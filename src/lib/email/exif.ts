import ExifReader from 'exifreader';

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
      const gpsLat = (tags.gps as Record<string, unknown>).Latitude;
      const gpsLng = (tags.gps as Record<string, unknown>).Longitude;
      if (typeof gpsLat === 'number') lat = gpsLat;
      if (typeof gpsLng === 'number') lng = gpsLng;
    }

    const exifTags = tags.exif as Record<string, { description?: string }> | undefined;
    if (exifTags?.DateTimeOriginal?.description) {
      const raw = exifTags.DateTimeOriginal.description;
      // EXIF format: "2026:04:10 14:32:00" → parse manually
      const match = raw.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        takenAt = new Date(
          `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`
        );
      }
    }

    return { lat, lng, takenAt };
  } catch {
    return { lat: null, lng: null, takenAt: null };
  }
}
