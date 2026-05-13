/**
 * Geocode an address using OpenStreetMap Nominatim.
 * Free, no API key. Has rate limit (~1 req/sec) — fine for our use case.
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodeAddress(
  address: string,
  city?: string,
  country: string = "Uruguay",
): Promise<GeocodingResult | null> {
  if (!address) return null;

  const query = [address, city, country].filter(Boolean).join(", ");
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Maintly/1.0 (saas)",
        "Accept-Language": "es",
      },
    });
    if (!res.ok) return null;
    const arr: { lat: string; lon: string; display_name: string }[] = await res.json();
    if (!arr.length) return null;
    return {
      latitude: parseFloat(arr[0].lat),
      longitude: parseFloat(arr[0].lon),
      displayName: arr[0].display_name,
    };
  } catch {
    return null;
  }
}
