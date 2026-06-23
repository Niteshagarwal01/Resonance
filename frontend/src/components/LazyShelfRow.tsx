"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ShelfRow } from "./ShelfRow";
import { PopularAlbumsRow } from "./PopularAlbumsRow";
import { Loader2 } from "lucide-react";

export function LazyShelfRow({ 
  title, 
  icon, 
  fetchData, 
  type = "tracks" 
}: { 
  title: string, 
  icon?: React.ReactNode, 
  fetchData: () => Promise<any[]>, 
  type?: "tracks" | "albums" | "playlists" 
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const triggerFetch = useCallback(async () => {
    if (hasFetched) return;
    setHasFetched(true);
    try {
      const res = await fetchData();
      setData(res || []);
    } catch (err) {
      console.error("Lazy fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, hasFetched]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        triggerFetch();
      }
    }, { rootMargin: "400px" });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [triggerFetch]);

  if (!hasFetched || loading) {
    return (
      <div ref={ref} className="h-64 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl mb-10 border border-gray-100">
        <Loader2 className="animate-spin text-[#FFB703] mb-2" size={32} />
        <span className="text-gray-400 text-sm font-medium">Loading {title}...</span>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div ref={ref}>
      {type === "tracks" ? (
        <ShelfRow title={title} icon={icon} tracks={data} />
      ) : (
        <PopularAlbumsRow title={title} icon={icon} albums={data} type={type === "playlists" ? "playlist" : "album"} />
      )}
    </div>
  );
}
