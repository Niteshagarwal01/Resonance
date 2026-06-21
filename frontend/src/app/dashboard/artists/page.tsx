"use client";

import { Mic2, Star, TrendingUp, Check } from "lucide-react";

export default function ArtistsPage() {
  const artists = [
    { name: "The Weeknd", followers: "34M", image: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", following: true },
    { name: "Taylor Swift", followers: "89M", image: "https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg", following: true },
    { name: "Kendrick Lamar", followers: "21M", image: "https://i.ytimg.com/vi/tvTRZJ-4EyI/hqdefault.jpg", following: false },
    { name: "Dua Lipa", followers: "45M", image: "https://i.ytimg.com/vi/oygrmJFKYZY/hqdefault.jpg", following: true },
    { name: "Drake", followers: "67M", image: "https://i.ytimg.com/vi/uxpDa-c-4Mc/hqdefault.jpg", following: false },
    { name: "Billie Eilish", followers: "52M", image: "https://i.ytimg.com/vi/cWGE9GiRV3Q/hqdefault.jpg", following: true },
  ];

  return (
    <div className="p-8 pb-32">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
          Artists <Mic2 className="text-pink-500" size={40} />
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          The creators behind the resonance. Track your favorites and discover rising talent.
        </p>
      </div>

      {/* Following Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
            <Star className="text-[#FFB703]" size={24} fill="currentColor" /> Your Roster
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {artists.map((artist) => (
            <div key={artist.name} className="flex flex-col items-center group cursor-pointer">
              <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 shadow-md group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    View Profile
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-[#1A1A1A] text-center w-full truncate">{artist.name}</h3>
              <p className="text-sm text-gray-500">{artist.followers} Followers</p>
              
              <button className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold border ${artist.following ? 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200' : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'} transition-colors`}>
                {artist.following ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
