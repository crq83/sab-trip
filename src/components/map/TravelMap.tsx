'use client';

import { useEffect, useRef } from 'react';
import { Post } from '@/types';
import { itinerary } from '../../../data/itinerary';

interface Props {
  posts: Post[];
}

export default function TravelMap({ posts }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');

      // Fix default marker icons (broken by webpack)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [55, -148],
        zoom: 4,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Itinerary stop markers (dimmed)
      itinerary.forEach((stop) => {
        const color = stop.trip === 'alaska' ? '#2d5016' : '#0ea5e9';
        const icon = L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;opacity:0.7;"></div>`,
          className: '',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([stop.lat, stop.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:160px"><strong>${stop.icon || ''} ${stop.title}</strong><br><small style="color:#666">${stop.location}</small></div>`
          );
      });

      // Post markers
      const geolocatedPosts = posts.filter((p) => p.lat && p.lng);
      geolocatedPosts.forEach((post) => {
        const coverMedia = post.media?.find((m) => m.media_type === 'image');
        const hasVideo = post.media?.some((m) => m.media_type === 'video');

        let iconHtml: string;
        if (coverMedia) {
          iconHtml = `<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:3px solid #d97706;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><img src="${coverMedia.r2_url}" style="width:100%;height:100%;object-fit:cover"/></div>`;
        } else if (hasVideo) {
          iconHtml = `<div style="width:40px;height:40px;border-radius:50%;background:#7c3aed;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="color:white;font-size:18px">▶</span></div>`;
        } else {
          iconHtml = `<div style="width:40px;height:40px;border-radius:50%;background:#d97706;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="color:white;font-size:16px">📝</span></div>`;
        }

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const date = new Date(post.post_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const popupContent = `
          <div style="font-family:system-ui;min-width:180px;max-width:220px">
            ${coverMedia ? `<img src="${coverMedia.r2_url}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px"/>` : ''}
            <strong style="display:block;margin-bottom:2px">${post.title}</strong>
            <small style="color:#888">${date}${post.location_name ? ` · ${post.location_name}` : ''}</small>
            <br><a href="/blog/${post.slug}" style="color:#2d5016;font-size:12px;margin-top:4px;display:inline-block">Read more →</a>
          </div>
        `;

        L.marker([post.lat!, post.lng!], { icon })
          .addTo(map)
          .bindPopup(popupContent);
      });

      // Fit bounds to all markers if we have geolocated posts
      if (geolocatedPosts.length > 0) {
        const allCoords: [number, number][] = [
          ...geolocatedPosts.map((p) => [p.lat!, p.lng!] as [number, number]),
          ...itinerary.map((s) => [s.lat, s.lng] as [number, number]),
        ];
        map.fitBounds(allCoords, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [posts]);

  return <div ref={mapRef} className="w-full h-full" />;
}
