"use client";

import { motion } from "framer-motion";

export function TimelineSection() {
  const bgColors = ["#f87171", "#3b82f6", "#ef4444", "#22c55e", "#d946ef", "#FFB703"];
  const eras = [
    { year: "1995", name: "MP3 format goes public", desc: "Audio file compression enables seamless distribution of music over the internet for the first time." },
    { year: "1999", name: "Napster launches", desc: "The first peer-to-peer file sharing network for MP3 files launches. Attracted over 80 million users, fundamentally reshaping how people accessed music." },
    { year: "2000", name: "LimeWire launches", desc: "Peer-to-peer file-sharing platform becomes a major tool for the illegal download and distribution of pirated music." },
    { year: "2001", name: "iPod & iTunes", desc: "Apple releases the first iPod. \"1,000 songs in your pocket\". iTunes launches to organize digital music." },
    { year: "2001", name: "Napster shutdown", desc: "Forced to shut down after losing landmark copyright infringement lawsuit brought by the RIAA – the first major shutdown over music piracy." },
    { year: "2003", name: "iTunes Store launches", desc: "One of the first successful legal digital music marketplaces, achieving one million downloads in just three days." },
    { year: "2005", name: "Pandora & YouTube", desc: "Pandora launches as a subscription-based internet radio. YouTube allows easy video uploads and sharing." },
    { year: "2007", name: "Streams count for Billboard", desc: "Music streams begin to count towards the Billboard Hot 100 for the first time. The legitimacy of streaming is recognized." },
    { year: "2008", name: "Spotify & App Store", desc: "Spotify launches in select European countries with a freemium model. iPhone App Store brings portable streaming." },
    { year: "2010", name: "LimeWire shuttered", desc: "A critical turning point as the music industry moves away from the piracy era towards legal on-demand streaming services." },
    { year: "2011", name: "Spotify launches in US", desc: "Brings legal, on-demand music streaming to the world’s largest music market, accelerating global shifts to subscription models." },
    { year: "2015", name: "Apple & YouTube Music", desc: "Apple Music and YouTube Music launch. Spotify introduces 'Discover Weekly' algorithm, reshaping music discovery." },
    { year: "2016", name: "Streaming hits $3.9B", desc: "Streaming becomes the dominant form of music consumption and the biggest revenue source for the recorded music industry in the US." },
    { year: "2021", name: "Industry Reaches $25.9B", desc: "Global recorded music industry revenue surpasses the previous peak achieved during the CD era." },
    { year: "2025", name: "Global Revenue tops $30B", desc: "A revenue breakthrough underlining streaming’s crucial role in global music industry growth with streaming accounting for 67%." },
    { year: "2026", name: "Resonance", desc: "The next evolution. An open-source, limitless community music platform." },
  ];

  return (
    <section id="timeline" className="relative pb-40 pt-32" style={{ background: "#0D0D0D", color: "white", overflow: "hidden" }}>
      {/* Timeline Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20 md:mb-40 relative z-20 text-center md:text-left">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(4rem, 11vw, 8rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
            The Evolution<br/>of <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #FFB703 0%, #ff5e62 100%)", backgroundClip: "text" }}>Music.</span>
          </h2>
          <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: "rgba(255,255,255,0.5)", marginTop: 24, maxWidth: 600, fontWeight: 500, lineHeight: 1.5 }}>
            From the public release of the MP3 to the dawn of open-source algorithms, explore the pivotal eras that paved the way for Resonance.
          </p>
        </motion.div>
      </div>

      {/* Central Line */}
      <div className="absolute top-0 bottom-0 left-[24px] md:left-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 z-0" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {eras.map((era, i) => {
          const isEven = i % 2 === 0;
          const color = bgColors[i % bgColors.length];
          return (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ margin: "-15%", once: true }}
              className={`relative flex items-center w-full py-8 md:py-20 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}
            >
              {/* Center Dot */}
              <motion.div variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1 } }}
                className="absolute left-[24px] md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full z-20 border-4 border-[#0D0D0D]"
                style={{ background: color, boxShadow: `0 0 20px ${color}, 0 0 40px ${color}` }}
              />

              {/* Empty Space for the other side */}
              <div className="hidden md:block md:w-1/2" />

              {/* Content */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } } }}
                className={`w-full md:w-1/2 pl-12 md:pl-0 flex flex-col relative ${isEven ? 'md:pr-16 md:items-end' : 'md:pl-16 md:items-start'}`}
              >
                {/* Background Huge Year */}
                <div style={{ fontSize: "clamp(6rem, 15vw, 15rem)", fontWeight: 900, color: "rgba(255,255,255,0.03)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: -1, letterSpacing: "-0.05em", whiteSpace: "nowrap", pointerEvents: "none" }}>{era.year}</div>
                
                {/* Blur Glow behind content */}
                <div style={{ position: "absolute", inset: "-50%", filter: "blur(100px)", background: color, opacity: 0.15, zIndex: -1, pointerEvents: "none" }} />

                {/* Glassmorphic Card */}
                <div 
                  className={`relative w-full p-8 sm:p-10 rounded-3xl transition-transform hover:-translate-y-2 duration-500 text-left ${isEven ? 'md:text-right' : 'md:text-left'}`}
                  style={{ 
                    background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)", 
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 900, color: color, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12, display: "block" }}>{era.year}</span>
                  <h3 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px 0", color: "white", lineHeight: 1.1 }}>{era.name}</h3>
                  <p style={{ fontSize: "clamp(1.1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontWeight: 500 }}>{era.desc}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
