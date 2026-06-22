// Get current year for evergreen searches
const currentYear = new Date().getFullYear();

// Spotify-style category cards with rich gradients
export const CATEGORIES = [
  { name: "Hip-Hop", query: "hip hop hits", gradient: "from-orange-500 to-amber-600", emoji: "🎤" },
  { name: "Pop", query: `pop songs ${currentYear}`, gradient: "from-pink-500 to-rose-400", emoji: "🌸" },
  { name: "Indie", query: "indie alternative music", gradient: "from-emerald-500 to-teal-400", emoji: "🎸" },
  { name: "Electronic", query: "electronic dance music", gradient: "from-blue-500 to-cyan-400", emoji: "🎛️" },
  { name: "R&B", query: "rnb soul music", gradient: "from-indigo-500 to-violet-500", emoji: "🎶" },
  { name: "Rock", query: "rock music best", gradient: "from-red-600 to-orange-500", emoji: "🤘" },
  { name: "Classical", query: "classical piano music", gradient: "from-slate-600 to-gray-500", emoji: "🎹" },
  { name: "Jazz", query: "jazz lounge music", gradient: "from-amber-600 to-yellow-500", emoji: "🎷" },
  { name: "Workout", query: "workout motivation music", gradient: "from-lime-500 to-emerald-500", emoji: "💪" },
  { name: "Chill", query: "lofi chill beats study", gradient: "from-sky-400 to-blue-500", emoji: "😌" },
  { name: "Desi", query: "bollywood hindi hits", gradient: "from-orange-400 to-pink-500", emoji: "🪘" },
  { name: "Party", query: "party hits dance", gradient: "from-fuchsia-500 to-purple-500", emoji: "🎉" },
];

export const TRENDING_QUERIES = [
  "AP Dhillon latest", `Aditya Rikhari ${currentYear}`, "King hindi songs",
  "Bollywood top hits", "The Weeknd hits", "Drake best songs",
];
