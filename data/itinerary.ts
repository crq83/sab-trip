export interface ItineraryStop {
  date: string; // "2026-04-08"
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  trip: 'alaska' | 'hawaii';
  icon?: string; // emoji
}

// Edit this file to update your itinerary — no code changes needed elsewhere.
export const itinerary: ItineraryStop[] = [
  {
    date: '2026-04-08',
    title: 'Day 1 – Boston → Anchorage → Sheep Mountain Lodge',
    description:
      'Fly BOS → ANC, then drive the Glenn Highway north to Sheep Mountain Lodge. A remote backcountry lodge at the base of the Talkeetna Mountains.',
    location: 'Sheep Mountain Lodge, AK',
    lat: 61.784,
    lng: -147.649,
    trip: 'alaska',
    icon: '✈️',
  },
  {
    date: '2026-04-09',
    title: 'Day 2 – Drive to Valdez',
    description:
      'Drive south through the Chugach Mountains via the Richardson Highway to Valdez — the "Little Switzerland of Alaska."',
    location: 'Valdez, AK',
    lat: 61.131,
    lng: -146.348,
    trip: 'alaska',
    icon: '🚗',
  },
  {
    date: '2026-04-09',
    title: 'Days 2–5 – Valdez',
    description:
      "Base camp in Valdez through April 12. World-class backcountry skiing, the Valdez Glacier, Prince William Sound views. One of Alaska's most spectacular mountain towns.",
    location: 'Valdez, AK',
    lat: 61.131,
    lng: -146.348,
    trip: 'alaska',
    icon: '🏔️',
  },
  {
    date: '2026-04-12',
    title: 'Day 5 – Ferry Valdez → Cordova → Whittier (overnight)',
    description:
      'Board the Alaska Marine Highway ferry in Valdez. Overnight voyage through Prince William Sound with a stop in Cordova. Arrive Whittier on the morning of the 13th.',
    location: 'Cordova, AK (ferry stop)',
    lat: 60.543,
    lng: -145.757,
    trip: 'alaska',
    icon: '⛴️',
  },
  {
    date: '2026-04-13',
    title: 'Day 6 – Whittier → Girdwood (Alyeska)',
    description:
      'Arrive in Whittier, drive through the Anton Anderson Memorial Tunnel to Girdwood. Check in at the base of Alyeska Resort.',
    location: 'Girdwood, AK',
    lat: 60.96,
    lng: -149.161,
    trip: 'alaska',
    icon: '🎿',
  },
  {
    date: '2026-04-13',
    title: 'Days 6–10 – Girdwood & Alyeska (Mike arrives Apr 14)',
    description:
      "Skiing at Alyeska, one of Alaska's premier ski resorts. Mike joins on the 14th. Exploring Girdwood valley and Turnagain Arm.",
    location: 'Girdwood, AK',
    lat: 60.96,
    lng: -149.161,
    trip: 'alaska',
    icon: '⛷️',
  },
  {
    date: '2026-04-17',
    title: 'Days 10–15 – Seward or Talkeetna',
    description:
      'TBD — either Seward (Kenai Fjords National Park, Exit Glacier, sea kayaking) or Talkeetna (views of Denali, flightseeing, small-town charm). Until April 22.',
    location: 'Seward or Talkeetna, AK',
    lat: 60.104,
    lng: -149.443,
    trip: 'alaska',
    icon: '🦅',
  },
  {
    date: '2026-04-22',
    title: 'Day 15 – Fly Anchorage → Honolulu',
    description: 'Fly ANC → HNL. Trading glacier ice for Pacific surf.',
    location: 'Honolulu, HI',
    lat: 21.307,
    lng: -157.858,
    trip: 'hawaii',
    icon: '✈️',
  },
  {
    date: '2026-04-22',
    title: 'Days 15–17 – Honolulu, Oʻahu',
    description:
      'Two nights in Honolulu. Waikiki, Diamond Head, North Shore, fresh poke.',
    location: 'Honolulu, HI',
    lat: 21.307,
    lng: -157.858,
    trip: 'hawaii',
    icon: '🌺',
  },
  {
    date: '2026-04-24',
    title: 'Day 17 – Fly to Kauaʻi',
    description:
      'Fly HNL → LIH. The Garden Isle awaits — the oldest and wildest of the main Hawaiian islands.',
    location: "Līhuʻe, Kauaʻi, HI",
    lat: 21.978,
    lng: -159.371,
    trip: 'hawaii',
    icon: '✈️',
  },
  {
    date: '2026-04-24',
    title: "Days 17–25 – Kauaʻi",
    description:
      "Exploring Kauaʻi through May 2. Na Pali Coast, Waimea Canyon, Hanalei Bay, Poʻipū Beach. Hiking, snorkeling, sunsets.",
    location: "Kauaʻi, HI",
    lat: 22.096,
    lng: -159.526,
    trip: 'hawaii',
    icon: '🌊',
  },
  {
    date: '2026-05-02',
    title: 'Day 25 – Fly Home to Boston',
    description: "LIH → BOS. End of the adventure.",
    location: 'Boston, MA',
    lat: 42.361,
    lng: -71.057,
    trip: 'hawaii',
    icon: '🏠',
  },
];
