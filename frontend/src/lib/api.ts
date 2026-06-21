export const API_BASE = "http://localhost:8000/api";

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
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Search API Error:", err);
    return [];
  }
};

export const getRadioQueue = async (seedId: string): Promise<Track[]> => {
  if (!seedId) return [];
  try {
    const res = await fetch(`${API_BASE}/radio?seed_id=${encodeURIComponent(seedId)}`);
    if (!res.ok) throw new Error("Radio failed");
    const data = await res.json();
    return data.queue || [];
  } catch (err) {
    console.error("Radio API Error:", err);
    return [];
  }
};
