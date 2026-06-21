export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const timeout = 15000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  thumbnail?: string;
  length?: string; // radio endpoint sometimes returns length instead of duration
}

export const searchMusic = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Search API Error:", err);
    return [];
  }
};

export const searchArtists = async (query: string): Promise<any[]> => {
  if (!query) return [];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/search/artists?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Artist Search failed");
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Artist Search API Error:", err);
    return [];
  }
};

export const getRadioQueue = async (seedId: string): Promise<Track[]> => {
  if (!seedId) return [];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/radio?seed_id=${encodeURIComponent(seedId)}`);
    if (!res.ok) throw new Error("Radio failed");
    const data = await res.json();
    return data.queue || [];
  } catch (err) {
    console.error("Radio API Error:", err);
    return [];
  }
};
