export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const timeout = 30000;
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
  duration?: string | null;
  thumbnail?: string;
  isMagic?: boolean;
}

export const searchMusic = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
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
    const res = await fetchWithTimeout(`${API_BASE}/search/artists?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
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

export const getArtistProfile = async (artistId: string): Promise<any> => {
  if (!artistId) return null;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/artist/${encodeURIComponent(artistId)}`);
    if (!res.ok) throw new Error("Artist Profile failed");
    return await res.json();
  } catch (err) {
    console.error("Artist Profile API Error:", err);
    return null;
  }
};

export const getHomeFeed = async (seedIds: string): Promise<Track[]> => {
  if (!seedIds) return [];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/home?seed_ids=${encodeURIComponent(seedIds)}`);
    if (!res.ok) throw new Error("Home feed failed");
    const data = await res.json();
    return data.tracks || [];
  } catch (err) {
    console.error("Home API Error:", err);
    return [];
  }
};

export const getCharts = async (country: string = "ZZ"): Promise<Track[]> => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/charts?country=${country}`);
    if (!res.ok) throw new Error("Charts failed");
    const data = await res.json();
    return data.tracks || [];
  } catch (err) {
    console.error("Charts API Error:", err);
    return [];
  }
};

export const getMoods = async (): Promise<any> => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/moods`);
    if (!res.ok) throw new Error("Moods failed");
    return await res.json();
  } catch (err) {
    console.error("Moods API Error:", err);
    return null;
  }
};

export interface HomeShelf {
  title: string;
  items: Track[];
}

export const getHomeShelves = async (): Promise<HomeShelf[]> => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/home/shelves`);
    if (!res.ok) throw new Error("Home shelves failed");
    const data = await res.json();
    return data.shelves || [];
  } catch (err) {
    console.error("Home Shelves API Error:", err);
    return [];
  }
};

export const getAlbum = async (albumId: string): Promise<any> => {
  if (!albumId) return null;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/album/${encodeURIComponent(albumId)}`);
    if (!res.ok) throw new Error("Album fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Album API Error:", err);
    return null;
  }
};

export const getPlaylist = async (playlistId: string): Promise<any> => {
  if (!playlistId) return null;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/playlist/${encodeURIComponent(playlistId)}`);
    if (!res.ok) throw new Error("Playlist fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Playlist API Error:", err);
    return null;
  }
};
