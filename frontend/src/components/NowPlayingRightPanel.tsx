import { useState, useEffect } from "react";
import { ListPlus, Sparkles, Music2, Play, Mic2, ExternalLink, Disc3, ChevronRight } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";
import { SongActions } from "@/components/SongActions";
import { getRadioQueue, Track } from "@/lib/api";
import Link from "next/link";

type ActiveTab = "up-next" | "artist" | "about";

interface NowPlayingRightPanelProps {
  currentTrack: Track;
  upNext: Track[];
  toggleMagicShuffle: () => void;
  onClose?: () => void;
}

export function NowPlayingRightPanel({ currentTrack, upNext, toggleMagicShuffle, onClose }: NowPlayingRightPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("up-next");
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [radioLoading, setRadioLoading] = useState(false);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [artistLoading, setArtistLoading] = useState(false);

  // Fetch related tracks and artist profile for "Artist" tab
  useEffect(() => {
    if (!currentTrack) return;
    setRadioLoading(true);
    getRadioQueue(currentTrack.id)
      .then(tracks => setRadioTracks(tracks.slice(0, 10)))
      .catch(() => {})
      .finally(() => setRadioLoading(false));

    // Fetch real-time artist data
    const fetchArtist = async () => {
      try {
        setArtistLoading(true);
        const name = currentTrack.artist?.split(",")[0]?.trim();
        if (!name) return;
        const api = await import('@/lib/api');
        const results = await api.searchArtists(name);
        if (results && results.length > 0) {
          const artistId = results[0].id;
          const profile = await api.getArtistProfile(artistId);
          setArtistProfile({ ...profile, image: results[0].image });
        }
      } catch (err) {
        console.error("Failed to load artist profile:", err);
      } finally {
        setArtistLoading(false);
      }
    };
    fetchArtist();
  }, [currentTrack?.id]);

  const artistName = currentTrack.artist?.split(",")[0]?.trim() || "Unknown Artist";

  return (
    <div className="relative z-10 w-full md:w-[45%] lg:w-[40%] h-full flex flex-col bg-white/40 backdrop-blur-3xl">
      {/* Tabs Header */}
      <div className="flex px-6 pt-10 pb-4 shrink-0 gap-6 border-b border-gray-200">
        {(["up-next", "artist", "about"] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab
                ? "text-[#1A1A1A]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "about" ? "About" : tab === "up-next" ? "Up Next" : "Artist"}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB703] rounded-t-full shadow-[0_0_10px_#FFB703]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        {/* Up Next Tab */}
        {activeTab === "up-next" && (
          <div>
            {upNext.length === 0 ? (
              <div className="text-center py-20">
                <ListPlus size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Nothing else in your queue.</p>
                <button onClick={toggleMagicShuffle} className="mt-6 px-6 py-2.5 rounded-full bg-white border border-gray-200 hover:border-[#FFB703] shadow-sm hover:text-[#FFB703] transition-all text-sm font-bold flex items-center gap-2 mx-auto">
                  <Sparkles size={16}/> Auto-play Magic Mix
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 pl-2">Playing Next</p>
                {upNext.map((track, idx) => (
                  <div key={`${track.id}-${idx}`} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {track.thumbnail ? (
                        <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />
                      ) : (
                        <Music2 className="text-gray-300 m-auto mt-3" size={24}/>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={16} fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] text-[15px] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                      <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                    </div>
                    {(track as any).isMagic && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] bg-[#FFB703] px-2 py-1 rounded-md shrink-0 shadow-sm">Magic</span>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <SongActions track={track} size="sm" hideQueueButton={true} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artist Discovery Tab */}
        {activeTab === "artist" && (
          <div className="space-y-8">
            <div className="flex items-center gap-5 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FFB703]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB703] to-pink-500 flex items-center justify-center shrink-0 shadow-lg overflow-hidden relative">
                {artistProfile?.image ? (
                   <Image src={artistProfile.image} alt={artistName} fill className="object-cover" unoptimized />
                ) : (
                   <Mic2 size={32} className="text-white relative z-10" />
                )}
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Main Artist</p>
                <p className="text-2xl font-black text-[#1A1A1A]">{artistName}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-bold text-gray-500">
                  {artistLoading ? (
                    <div className="flex gap-2 items-center"><div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"/> Loading stats...</div>
                  ) : artistProfile ? (
                    <>
                      {artistProfile.subscribers && <span className="bg-gray-100 px-2 py-1 rounded-md">{artistProfile.subscribers}</span>}
                      {artistProfile.views && <span className="bg-gray-100 px-2 py-1 rounded-md">{artistProfile.views}</span>}
                    </>
                  ) : (
                    <a
                      href={`https://music.youtube.com/search?q=${encodeURIComponent(artistName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#FFB703] transition-colors"
                    >
                      <ExternalLink size={14} /> Open in YouTube Music
                    </a>
                  )}
                </div>
              </div>
            </div>

            {artistProfile?.id ? (
              <div className="flex justify-center mt-8">
                <Link
                  href={`/dashboard/artist/${artistProfile.id}`}
                  onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                  className="group flex items-center justify-between w-full p-4 bg-white hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white border border-gray-100 rounded-2xl transition-all shadow-sm hover:shadow-lg"
                >
                  <div>
                    <p className="font-black text-lg">View Full Profile</p>
                    <p className="text-sm font-semibold opacity-60">Albums, EPs, Singles & more</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 pl-2">Radio Queue</p>
                {radioLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {radioTracks.map((track, idx) => (
                      <div key={`${track.id}-${idx}`} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          {track.thumbnail && <Image src={track.thumbnail} alt={track.title} fill className="object-cover" unoptimized />}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={16} fill="white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1A1A1A] text-[15px] truncate group-hover:text-[#FFB703] transition-colors">{track.title}</p>
                          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <SongActions track={track} size="sm" hideQueueButton={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Disc3 size={16} /> Track Details
              </p>
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Title</p>
                  <p className="font-black text-[#1A1A1A] text-xl">{currentTrack.title}</p>
                </div>
                {currentTrack.album && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Album</p>
                    <p className="font-bold text-gray-700 text-lg">{currentTrack.album}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Artist</p>
                  <p className="font-bold text-gray-700 text-lg">{currentTrack.artist}</p>
                </div>
                {currentTrack.duration && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Duration</p>
                    <p className="font-bold text-gray-700 text-lg">{currentTrack.duration}</p>
                  </div>
                )}
              </div>
            </div>

            <a
              href={`https://music.youtube.com/watch?v=${currentTrack.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-6 bg-gradient-to-br from-[#FF0000]/5 to-white border border-[#FF0000]/10 rounded-[2rem] hover:from-[#FF0000]/10 hover:shadow-md transition-all cursor-pointer shadow-sm"
            >
              <div>
                <p className="text-[#1A1A1A] font-black text-lg mb-1">YouTube Music</p>
                <p className="text-gray-500 text-sm font-medium">Watch the official video or lyrics</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FF0000]/10 group-hover:bg-[#FF0000]/20 flex items-center justify-center transition-colors">
                <ExternalLink size={20} className="text-[#FF0000]" />
              </div>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
