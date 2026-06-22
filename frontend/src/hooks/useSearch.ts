import { useState, useEffect } from "react";
import { searchMusic, searchArtists, Track } from "@/lib/api";

export type SearchTab = "songs" | "artists" | "releases";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("songs");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryTracks, setCategoryTracks] = useState<Track[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults(null);
      setArtistResults([]);
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const [musicData, artists] = await Promise.all([
          searchMusic(debouncedQuery),
          searchArtists(debouncedQuery),
        ]);
        setSearchResults(musicData);
        setArtistResults(artists);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [debouncedQuery]);

  const browseCategory = async (cat: { name: string, query: string }) => {
    setCategoryName(cat.name);
    setCategoryLoading(true);
    setCategoryTracks([]);
    setQuery("");
    try {
      const results = await searchMusic(cat.query);
      if (results && results.songs) {
        setCategoryTracks(results.songs);
      } else {
        setCategoryTracks([]);
      }
    } finally {
      setCategoryLoading(false);
    }
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    activeTab,
    setActiveTab,
    searchResults,
    artistResults,
    loading,
    categoryTracks,
    categoryName,
    setCategoryName,
    categoryLoading,
    browseCategory
  };
}
