import { createClient } from "@/utils/supabase/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: string | null;
  thumbnail?: string;
  isMagic?: boolean;
}

export interface HomeShelf {
  title: string;
  items: Track[];
}

const supabase = createClient();

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {
      ...options.headers,
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
    };

    const timeout = 30000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      console.error(`Fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  async searchMusic(query: string): Promise<Track[]> {
    if (!query) return [];
    const data = await this.request<any>(`/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    return data.results || [];
  }

  async searchArtists(query: string): Promise<any[]> {
    if (!query) return [];
    const data = await this.request<any>(`/search/artists?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    return data.results || [];
  }

  async getArtist(id: string): Promise<any> {
    if (!id) return null;
    return await this.request<any>(`/artist/${encodeURIComponent(id)}`, { cache: 'no-store' });
  }

  async getArtistProfile(artistId: string): Promise<any> {
    if (!artistId) return null;
    return await this.request<any>(`/artist/${encodeURIComponent(artistId)}`);
  }

  async getRadioQueue(seedId: string): Promise<Track[]> {
    if (!seedId) return [];
    const data = await this.request<any>(`/radio?seed_id=${encodeURIComponent(seedId)}`);
    return data.queue || [];
  }

  async getHomeMixes(): Promise<Track[]> {
    const data = await this.request<any>(`/home`);
    return data.tracks || [];
  }

  async getCharts(country: string = "ZZ"): Promise<Track[]> {
    const data = await this.request<any>(`/charts?country=${country}`);
    return data.tracks || [];
  }

  async getMoods(): Promise<any> {
    return await this.request<any>(`/moods`);
  }

  async getHomeShelves(): Promise<HomeShelf[]> {
    const data = await this.request<any>(`/home/shelves`);
    return data.shelves || [];
  }

  async getAlbum(albumId: string): Promise<any> {
    if (!albumId) return null;
    return await this.request<any>(`/album/${encodeURIComponent(albumId)}`);
  }

  async getPlaylist(playlistId: string): Promise<any> {
    if (!playlistId) return null;
    return await this.request<any>(`/playlist/${encodeURIComponent(playlistId)}`);
  }
}

const api = new ApiClient();

// Export the functions to maintain backwards compatibility with existing imports
export const searchMusic = (q: string) => api.searchMusic(q);
export const searchArtists = (q: string) => api.searchArtists(q);
export const getArtist = (id: string) => api.getArtist(id);
export const getArtistProfile = (id: string) => api.getArtistProfile(id);
export const getRadioQueue = (id: string) => api.getRadioQueue(id);
export const getCharts = (country?: string) => api.getCharts(country);
export const getMoods = () => api.getMoods();
export const getHomeShelves = () => api.getHomeShelves();
export const getAlbum = (id: string) => api.getAlbum(id);
export const getPlaylist = (id: string) => api.getPlaylist(id);
