import { useState, useMemo, useCallback } from "react";
import _ from "lodash";

// ─── TAG TAXONOMY ───────────────────────────────────────────────────────────
const TAG_CATEGORIES = {
  genre: {
    label: "Genre",
    color: "#8B4513",
    tags: [
      "jazz","soul","funk","rock","indie","electronic","ambient","hip-hop",
      "R&B","folk","country","classical","world","reggae","dub","blues",
      "punk","new wave","disco","house","afrobeat","bossa nova","psychedelic",
      "shoegaze","trip-hop","lo-fi","garage rock","post-punk","Americana",
      "gospel","Latin","highlife","cumbia","krautrock","synth-pop","dream pop",
      "singer-songwriter","ska","tropicalia","exotica","Library music"
    ],
  },
  era: {
    label: "Era",
    color: "#556B2F",
    tags: [
      "1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s",
      "pre-war","timeless","mixed era"
    ],
  },
  energy: {
    label: "Energy & Tempo",
    color: "#4682B4",
    tags: [
      "very low energy","low energy","medium energy","medium-high energy",
      "high energy","downtempo","mid-tempo","uptempo","mixed tempo",
      "slow build","crescendo","steady pulse","languid","propulsive","simmering"
    ],
  },
  timeOfDay: {
    label: "Time of Day",
    color: "#B8860B",
    tags: [
      "early morning","morning","late morning","brunch","midday","afternoon",
      "golden hour","evening","dinner hour","late night","after midnight",
      "all day","weekend morning","weekday afternoon"
    ],
  },
  season: {
    label: "Season & Weather",
    color: "#2E8B57",
    tags: [
      "spring","summer","autumn","winter","rainy day","sunny","overcast",
      "crisp air","humid","snowy","stormy","foggy","first warm day",
      "Indian summer","dead of winter","year-round"
    ],
  },
  room: {
    label: "The Room",
    color: "#8B008B",
    tags: [
      "conversation-friendly","background-friendly","demands attention",
      "intimate gathering","bustling cafe","quiet reading","dinner service",
      "happy hour","late night wind-down","Sunday morning","working/studying",
      "sparse crowd","packed house","date night","solo listening",
      "friends catching up","post-work decompression"
    ],
  },
  vibe: {
    label: "Vibe & Mood",
    color: "#CD5C5C",
    tags: [
      "cozy","wistful","cerebral","sultry","jangly","woozy","sun-drenched",
      "nocturnal","cinematic","funky","pastoral","urbane","breezy",
      "melancholic","euphoric","contemplative","playful","dreamy","gritty",
      "sophisticated","raw","lush","angular","warm","cool","smoky","hazy",
      "buoyant","romantic","irreverent","nostalgic","mysterious","driving",
      "blissed-out","tender","swaggering","meditative","whimsical","spacious",
      "earthy","otherworldly","stoned","caffeinated","tipsy"
    ],
  },
  practical: {
    label: "Practical",
    color: "#708090",
    tags: [
      "instrumental-heavy","vocal-forward","mixed vocals","deep cuts only",
      "some recognizable","mostly recognizable","explicit content","clean",
      "builds energy","steady energy","winds down","journey/arc",
      "great openers","great closers","pairs with coffee","pairs with wine",
      "pairs with cocktails","pairs with food"
    ],
  },
};

// ─── SYNONYM / ASSOCIATION MAP ──────────────────────────────────────────────
// Maps search terms to tags they should match (with weights 0-1)
const SYNONYM_MAP = {
  "chill": [["low energy",1],["downtempo",0.9],["contemplative",0.7],["breezy",0.7],["ambient",0.6],["conversation-friendly",0.5]],
  "mellow": [["low energy",1],["downtempo",0.9],["warm",0.8],["tender",0.7],["languid",0.6]],
  "laid-back": [["low energy",0.9],["breezy",0.8],["conversation-friendly",0.7],["background-friendly",0.6]],
  "relaxing": [["low energy",1],["downtempo",0.9],["contemplative",0.7],["meditative",0.6],["ambient",0.5]],
  "upbeat": [["high energy",1],["uptempo",1],["buoyant",0.8],["euphoric",0.7],["playful",0.6]],
  "energetic": [["high energy",1],["uptempo",0.9],["propulsive",0.8],["driving",0.7]],
  "party": [["high energy",0.9],["uptempo",0.8],["packed house",0.7],["euphoric",0.7],["funky",0.5],["disco",0.5]],
  "sad": [["melancholic",1],["wistful",0.9],["tender",0.7],["contemplative",0.6]],
  "happy": [["buoyant",1],["euphoric",0.8],["playful",0.8],["sunny",0.7],["breezy",0.6]],
  "rainy": [["rainy day",1],["overcast",0.7],["contemplative",0.7],["cozy",0.6],["melancholic",0.5],["hazy",0.5]],
  "sunny": [["sunny",1],["sun-drenched",1],["summer",0.7],["breezy",0.6],["buoyant",0.5]],
  "cold": [["winter",0.9],["crisp air",0.8],["cozy",0.7],["snowy",0.6]],
  "warm": [["warm",1],["cozy",0.8],["summer",0.6],["sun-drenched",0.5],["lush",0.5]],
  "sexy": [["sultry",1],["nocturnal",0.7],["smoky",0.7],["intimate gathering",0.6],["date night",0.6],["R&B",0.4]],
  "romantic": [["romantic",1],["sultry",0.7],["tender",0.7],["date night",0.6],["intimate gathering",0.5]],
  "dark": [["nocturnal",0.9],["gritty",0.8],["mysterious",0.8],["smoky",0.7],["late night",0.6]],
  "bright": [["sunny",0.8],["buoyant",0.8],["jangly",0.7],["breezy",0.6],["morning",0.5]],
  "moody": [["wistful",0.8],["melancholic",0.7],["nocturnal",0.7],["cinematic",0.6],["hazy",0.6],["mysterious",0.6]],
  "funky": [["funky",1],["funk",1],["swaggering",0.7],["propulsive",0.6],["soul",0.5]],
  "groovy": [["funky",0.9],["funk",0.8],["soul",0.7],["swaggering",0.6],["disco",0.5]],
  "dreamy": [["dreamy",1],["hazy",0.8],["spacious",0.7],["shoegaze",0.6],["ambient",0.5],["woozy",0.5]],
  "jazzy": [["jazz",1],["sophisticated",0.7],["smoky",0.6],["urbane",0.5]],
  "folksy": [["folk",1],["Americana",0.8],["pastoral",0.7],["earthy",0.6],["singer-songwriter",0.5]],
  "psychedelic": [["psychedelic",1],["woozy",0.7],["otherworldly",0.6],["spacious",0.5],["stoned",0.5]],
  "coffeeshop": [["pairs with coffee",1],["morning",0.7],["conversation-friendly",0.7],["background-friendly",0.6],["singer-songwriter",0.4]],
  "coffee": [["pairs with coffee",1],["morning",0.8],["conversation-friendly",0.6]],
  "wine": [["pairs with wine",1],["evening",0.7],["sophisticated",0.6],["dinner service",0.5]],
  "cocktails": [["pairs with cocktails",1],["happy hour",0.8],["evening",0.7],["tipsy",0.6]],
  "dinner": [["dinner service",1],["dinner hour",1],["evening",0.7],["conversation-friendly",0.6],["pairs with food",0.8]],
  "brunch": [["brunch",1],["late morning",0.8],["weekend morning",0.7],["buoyant",0.5],["breezy",0.5]],
  "morning": [["morning",1],["early morning",0.7],["late morning",0.7],["pairs with coffee",0.6]],
  "afternoon": [["afternoon",1],["midday",0.7],["conversation-friendly",0.5]],
  "evening": [["evening",1],["golden hour",0.7],["dinner hour",0.6]],
  "night": [["late night",1],["nocturnal",0.9],["after midnight",0.7],["smoky",0.5]],
  "late": [["late night",1],["after midnight",0.8],["nocturnal",0.7]],
  "weekend": [["weekend morning",0.8],["brunch",0.6],["playful",0.4]],
  "tuesday": [["weekday afternoon",0.7],["conversation-friendly",0.5],["medium energy",0.5]],
  "wednesday": [["weekday afternoon",0.7],["conversation-friendly",0.5],["medium energy",0.5]],
  "friday": [["happy hour",0.8],["evening",0.6],["uptempo",0.4],["packed house",0.4]],
  "saturday": [["weekend morning",0.6],["packed house",0.5],["high energy",0.4]],
  "sunday": [["Sunday morning",1],["weekend morning",0.8],["brunch",0.7],["contemplative",0.5],["languid",0.4]],
  "study": [["working/studying",1],["background-friendly",0.9],["instrumental-heavy",0.7],["low energy",0.5]],
  "work": [["working/studying",1],["background-friendly",0.8],["conversation-friendly",0.6]],
  "focus": [["working/studying",0.9],["instrumental-heavy",0.8],["ambient",0.6],["background-friendly",0.7]],
  "reading": [["quiet reading",1],["background-friendly",0.8],["low energy",0.6],["contemplative",0.5]],
  "wintry": [["winter",1],["cozy",0.8],["crisp air",0.7],["snowy",0.6]],
  "autumnal": [["autumn",1],["crisp air",0.7],["warm",0.6],["wistful",0.5],["earthy",0.5]],
  "summery": [["summer",1],["sun-drenched",0.8],["breezy",0.7],["buoyant",0.6]],
  "spring": [["spring",1],["first warm day",0.7],["buoyant",0.6],["breezy",0.5]],
  "trippy": [["psychedelic",1],["woozy",0.8],["otherworldly",0.7],["stoned",0.6],["spacious",0.5]],
  "stoned": [["stoned",1],["woozy",0.8],["psychedelic",0.7],["languid",0.6],["downtempo",0.5]],
  "retro": [["1960s",0.6],["1970s",0.6],["1980s",0.6],["nostalgic",0.8],["vintage",0.5]],
  "vintage": [["1950s",0.5],["1960s",0.6],["1970s",0.5],["nostalgic",0.7]],
  "modern": [["2010s",0.7],["2020s",0.8]],
  "classic": [["mostly recognizable",0.7],["timeless",0.8]],
  "deep": [["deep cuts only",0.9],["cerebral",0.5]],
  "obscure": [["deep cuts only",1]],
  "familiar": [["mostly recognizable",1],["some recognizable",0.7]],
  "quiet": [["very low energy",0.8],["quiet reading",0.7],["sparse crowd",0.6],["contemplative",0.5]],
  "loud": [["high energy",0.8],["packed house",0.6],["demands attention",0.6]],
  "sophisticated": [["sophisticated",1],["urbane",0.8],["jazz",0.5],["cerebral",0.5]],
  "raw": [["raw",1],["gritty",0.8],["punk",0.5],["garage rock",0.5]],
  "smooth": [["sophisticated",0.7],["lush",0.7],["warm",0.6],["bossa nova",0.5],["soul",0.5]],
};

// ─── SAMPLE PLAYLISTS ───────────────────────────────────────────────────────
const INITIAL_PLAYLISTS = [
  {
    id: 1,
    title: "I smoked too much pot and got lost in Joshua Tree",
    curator: "Chip",
    description: "Desert wandering music. Long instrumental passages, reverb for days, the kind of thing that sounds better when the sun is setting behind a rock formation and you're not entirely sure which direction the car is.",
    link: "",
    tracks: 18,
    runtime: "1hr 35min",
    tags: ["psychedelic","rock","ambient","folk","1960s","1970s","2010s","mixed era","low energy","mid-tempo","downtempo","mixed tempo","slow build","afternoon","golden hour","late night","summer","autumn","sunny","overcast","first warm day","background-friendly","solo listening","sparse crowd","contemplative","dreamy","hazy","spacious","stoned","woozy","otherworldly","earthy","pastoral","cinematic","instrumental-heavy","deep cuts only","journey/arc","winds down"],
  },
  {
    id: 2,
    title: "I had a dream last night about Molly Ringwald",
    curator: "Chip",
    description: "80s-adjacent but not the obvious hits. The B-sides and deep cuts from the Brat Pack era. Synths, longing, and the feeling of sitting in Saturday detention.",
    link: "",
    tracks: 22,
    runtime: "1hr 28min",
    tags: ["synth-pop","new wave","dream pop","indie","1980s","1990s","medium energy","mid-tempo","steady pulse","afternoon","evening","golden hour","autumn","winter","overcast","rainy day","conversation-friendly","intimate gathering","friends catching up","nostalgic","dreamy","wistful","cinematic","romantic","warm","whimsical","playful","mixed vocals","some recognizable","deep cuts only","steady energy"],
  },
  {
    id: 3,
    title: "I'm going to go home and watch 50 Shades of Grey",
    curator: "Chip",
    description: "Slow, heavy-lidded, unapologetically seductive. Not background music — this one changes the temperature of the room.",
    link: "",
    tracks: 16,
    runtime: "1hr 12min",
    tags: ["R&B","electronic","trip-hop","soul","2000s","2010s","2020s","low energy","downtempo","simmering","evening","late night","after midnight","winter","autumn","rainy day","intimate gathering","date night","demands attention","sparse crowd","sultry","nocturnal","smoky","mysterious","warm","lush","raw","tender","vocal-forward","some recognizable","deep cuts only","slow build","pairs with wine","pairs with cocktails"],
  },
  {
    id: 4,
    title: "Je veux danser plus tard",
    curator: "Chip",
    description: "French and French-adjacent. Serge and Jane, Air, Francoise Hardy, newer stuff too. The energy builds slowly — you'll want to dance eventually, but not yet.",
    link: "",
    tracks: 20,
    runtime: "1hr 40min",
    tags: ["pop","electronic","chanson","world","bossa nova","synth-pop","1960s","1970s","2000s","2010s","mixed era","medium energy","mid-tempo","slow build","simmering","afternoon","golden hour","evening","spring","summer","sunny","first warm day","conversation-friendly","dinner service","bustling cafe","happy hour","sophisticated","urbane","playful","breezy","romantic","whimsical","warm","buoyant","tipsy","mixed vocals","some recognizable","deep cuts only","builds energy","pairs with wine","pairs with cocktails","pairs with food"],
  },
  {
    id: 5,
    title: "Looking for something easy to cook for dinner in the Piggly Wiggly",
    curator: "Chip",
    description: "Wandering the aisles after work, no plan, no rush. Soft rock, country-soul, the kind of music that plays in your head when you're deciding between rotisserie chicken and pasta.",
    link: "",
    tags: ["Americana","soul","country","folk","singer-songwriter","soft rock","1970s","1990s","2000s","2010s","mixed era","low energy","medium energy","mid-tempo","downtempo","afternoon","evening","golden hour","weekday afternoon","autumn","winter","overcast","crisp air","conversation-friendly","background-friendly","post-work decompression","warm","cozy","wistful","pastoral","earthy","nostalgic","tender","whimsical","irreverent","vocal-forward","mixed vocals","some recognizable","steady energy","pairs with food","pairs with wine"],
    tracks: 19,
    runtime: "1hr 22min",
  },
  {
    id: 6,
    title: "The Only Living Boy in the High Dive",
    curator: "Chip",
    description: "Named for the venue and for Simon & Garfunkel. Solo acoustic leanings, but not coffeehouse cliche. Introspective without being mopey. The kind of thing you'd want to hear alone in a beautiful room.",
    link: "",
    tags: ["folk","singer-songwriter","indie","Americana","classical","1960s","1970s","2000s","2010s","2020s","mixed era","very low energy","low energy","downtempo","languid","early morning","morning","late morning","afternoon","spring","autumn","overcast","rainy day","crisp air","quiet reading","solo listening","sparse crowd","working/studying","contemplative","wistful","tender","pastoral","spacious","warm","cerebral","meditative","earthy","vocal-forward","instrumental-heavy","deep cuts only","some recognizable","steady energy","winds down","pairs with coffee"],
    tracks: 17,
    runtime: "1hr 15min",
  },
  {
    id: 7,
    title: "Pleasant Jangle Happy Hour",
    curator: "Chip",
    description: "Bright, jangly guitars, upbeat but not aggressive. The Byrds meet Real Estate meet Big Star. Perfect for the 4-6pm window when the light is good and the first drinks are being poured.",
    link: "",
    tags: ["indie","rock","garage rock","jangle pop","Americana","1960s","1980s","2000s","2010s","mixed era","medium energy","medium-high energy","mid-tempo","uptempo","steady pulse","afternoon","golden hour","happy hour","evening","spring","summer","first warm day","sunny","bustling cafe","happy hour","friends catching up","packed house","conversation-friendly","jangly","buoyant","breezy","playful","warm","sun-drenched","nostalgic","bright","irreverent","mixed vocals","some recognizable","steady energy","builds energy","pairs with cocktails"],
    tracks: 21,
    runtime: "1hr 30min",
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const allTagSet = new Set();
Object.values(TAG_CATEGORIES).forEach(cat => cat.tags.forEach(t => allTagSet.add(t.toLowerCase())));

function searchPlaylists(playlists, query, activeFilters) {
  if (!query.trim() && activeFilters.length === 0) return playlists;

  const words = query.toLowerCase().split(/[\s,]+/).filter(Boolean);

  return playlists
    .map(pl => {
      const plTags = pl.tags.map(t => t.toLowerCase());
      let score = 0;

      // Score from active filter chips
      activeFilters.forEach(f => {
        if (plTags.includes(f.toLowerCase())) score += 2;
      });

      // Score from search words
      words.forEach(word => {
        // Direct tag match
        plTags.forEach(tag => {
          if (tag === word) score += 2;
          else if (tag.includes(word)) score += 1;
        });

        // Title/description match
        if (pl.title.toLowerCase().includes(word)) score += 1.5;
        if (pl.description.toLowerCase().includes(word)) score += 0.5;

        // Synonym expansion
        if (SYNONYM_MAP[word]) {
          SYNONYM_MAP[word].forEach(([synTag, weight]) => {
            if (plTags.includes(synTag.toLowerCase())) {
              score += weight * 1.5;
            }
          });
        }

        // Partial synonym match
        Object.keys(SYNONYM_MAP).forEach(synKey => {
          if (synKey.includes(word) && synKey !== word) {
            SYNONYM_MAP[synKey].forEach(([synTag, weight]) => {
              if (plTags.includes(synTag.toLowerCase())) {
                score += weight * 0.3;
              }
            });
          }
        });
      });

      return { ...pl, score };
    })
    .filter(pl => pl.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function TagCloud({ tags, activeTags, onToggle, color }) {
  // Vary font sizes to mimic the Cookthink cloud
  const sizes = useMemo(() => {
    const map = {};
    tags.forEach((t, i) => {
      map[t] = 0.75 + Math.random() * 0.55;
    });
    return map;
  }, [tags]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", alignItems: "baseline", padding: "12px 0" }}>
      {tags.map(tag => {
        const active = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            style={{
              background: active ? color : "transparent",
              color: active ? "#fff" : "#4a3728",
              border: "none",
              borderRadius: "3px",
              padding: "2px 6px",
              fontSize: `${sizes[tag]}rem`,
              cursor: "pointer",
              fontFamily: "Georgia, serif",
              opacity: active ? 1 : 0.85,
              transition: "all 0.15s ease",
              fontWeight: active ? 600 : 400,
            }}
            onMouseEnter={e => { if (!active) e.target.style.opacity = 1; e.target.style.textDecoration = "underline"; }}
            onMouseLeave={e => { if (!active) e.target.style.opacity = 0.85; e.target.style.textDecoration = "none"; }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

function PlaylistCard({ playlist, allCategories }) {
  const [expanded, setExpanded] = useState(false);

  // Group the playlist's tags by category
  const tagsByCategory = useMemo(() => {
    const grouped = {};
    const lowerCatTags = {};
    Object.entries(allCategories).forEach(([key, cat]) => {
      lowerCatTags[key] = cat.tags.map(t => t.toLowerCase());
    });

    playlist.tags.forEach(tag => {
      const lTag = tag.toLowerCase();
      for (const [key, lower] of Object.entries(lowerCatTags)) {
        if (lower.includes(lTag)) {
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(tag);
          return;
        }
      }
      if (!grouped["other"]) grouped["other"] = [];
      grouped["other"].push(tag);
    });
    return grouped;
  }, [playlist.tags, allCategories]);

  return (
    <div
      style={{
        background: "#faf7f2",
        border: "1px solid #e0d5c7",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "12px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px 0", fontFamily: "Georgia, serif", color: "#2c1810", fontSize: "1.15rem" }}>
            {playlist.title}
          </h3>
          <div style={{ fontSize: "0.8rem", color: "#8a7565", marginBottom: "8px" }}>
            {playlist.curator} &middot; {playlist.tracks} tracks &middot; {playlist.runtime}
          </div>
          <p style={{ margin: 0, color: "#5a4a3a", fontSize: "0.9rem", lineHeight: 1.5, fontFamily: "Georgia, serif" }}>
            {playlist.description}
          </p>
        </div>
        {playlist.score !== undefined && (
          <div style={{
            background: "#8B4513", color: "#fff", borderRadius: "12px",
            padding: "2px 10px", fontSize: "0.75rem", fontWeight: 600, marginLeft: "12px", flexShrink: 0,
          }}>
            {Math.round(playlist.score * 10) / 10}
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e0d5c7" }}>
          {Object.entries(tagsByCategory).map(([catKey, tags]) => {
            const cat = allCategories[catKey];
            return (
              <div key={catKey} style={{ marginBottom: "8px" }}>
                <span style={{
                  fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em",
                  color: cat ? cat.color : "#708090", fontWeight: 600, marginRight: "8px",
                }}>
                  {cat ? cat.label : "Other"}:
                </span>
                <span style={{ fontSize: "0.8rem", color: "#5a4a3a" }}>
                  {tags.join(", ")}
                </span>
              </div>
            );
          })}
          {playlist.link && (
            <div style={{ marginTop: "12px" }}>
              <a href={playlist.link} target="_blank" rel="noreferrer"
                style={{ color: "#8B4513", fontSize: "0.85rem" }}>
                Open playlist &rarr;
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Categories that can be auto-tagged from Spotify API data
const AUTO_TAGGABLE = new Set(["genre", "era", "energy"]);
// Categories the curator handles manually
const MANUAL_CATEGORIES = ["timeOfDay", "season", "room", "vibe", "practical"];

function CuratorView({ playlists, setPlaylists }) {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({
    title: "", curator: "Chip", description: "", link: "", tracks: "", runtime: "", tags: [],
  });
  const [autoTags, setAutoTags] = useState([]); // Tags that would be auto-assigned
  const [activeCategory, setActiveCategory] = useState("timeOfDay");
  const [suggestTag, setSuggestTag] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [saved, setSaved] = useState(false);

  const toggleTag = useCallback((tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  }, []);

  const handleSuggest = () => {
    if (suggestTag.trim()) {
      setSuggestions(prev => [...prev, suggestTag.trim()]);
      setForm(prev => ({ ...prev, tags: [...prev.tags, suggestTag.trim()] }));
      setSuggestTag("");
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const newPlaylist = {
      ...form,
      id: Date.now(),
      tracks: parseInt(form.tracks) || 0,
      runtime: form.runtime || "Unknown",
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    setForm({ title: "", curator: "Chip", description: "", link: "", tracks: "", runtime: "", tags: [] });
    setAutoTags([]);
    setSuggestions([]);
    setPhase(1);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const goToPhase2 = () => {
    if (!form.title.trim()) return;
    // In the future, this is where we'd call the Spotify API to auto-tag genre/era/energy.
    // For now, we move to phase 2 with all categories available for manual tagging.
    setPhase(2);
    setActiveCategory("timeOfDay");
  };

  const goBackToPhase1 = () => {
    setPhase(1);
  };

  // Which categories to show in phase 2 tagging
  // Auto-taggable ones appear in a separate "review" section; manual ones are the main focus
  const manualCatEntries = Object.entries(TAG_CATEGORIES).filter(([key]) => MANUAL_CATEGORIES.includes(key));
  const autoCatEntries = Object.entries(TAG_CATEGORIES).filter(([key]) => AUTO_TAGGABLE.has(key));

  return (
    <div>
      {/* Phase indicator */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "12px", marginBottom: "24px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          opacity: phase === 1 ? 1 : 0.5,
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: phase === 1 ? "#8B4513" : "#2E8B57",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 600,
          }}>
            {phase > 1 ? "✓" : "1"}
          </div>
          <span style={{
            fontSize: "0.85rem", fontWeight: phase === 1 ? 600 : 400,
            color: "#2c1810", fontFamily: "Georgia, serif",
          }}>
            Playlist Details
          </span>
        </div>
        <div style={{ width: "40px", height: "2px", background: phase >= 2 ? "#8B4513" : "#d5c8b8" }} />
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          opacity: phase === 2 ? 1 : 0.5,
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: phase === 2 ? "#8B4513" : "#d5c8b8",
            color: phase === 2 ? "#fff" : "#8a7565",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 600,
          }}>
            2
          </div>
          <span style={{
            fontSize: "0.85rem", fontWeight: phase === 2 ? 600 : 400,
            color: phase === 2 ? "#2c1810" : "#8a7565", fontFamily: "Georgia, serif",
          }}>
            Tag the Vibe
          </span>
        </div>
      </div>

      {/* ─── PHASE 1: Playlist Details ─── */}
      {phase === 1 && (
        <div>
          <div style={{
            background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px", padding: "24px", marginBottom: "24px",
          }}>
            <h3 style={{ margin: "0 0 4px 0", fontFamily: "Georgia, serif", color: "#2c1810" }}>Tell us about the playlist</h3>
            <p style={{ margin: "0 0 16px 0", color: "#8a7565", fontSize: "0.85rem" }}>
              Basic info first. We'll handle tags in the next step.
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              <input
                type="text" placeholder="Playlist title" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="Description / story behind this playlist — what's the vibe? what inspired it?"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4} style={{ ...inputStyle, resize: "vertical" }}
              />
              <input
                type="text" placeholder="Spotify or Apple Music link"
                value={form.link}
                onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <input
                  type="text" placeholder="Curator name" value={form.curator}
                  onChange={e => setForm(p => ({ ...p, curator: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="# of tracks" value={form.tracks}
                  onChange={e => setForm(p => ({ ...p, tracks: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Runtime (e.g. 1hr 30min)" value={form.runtime}
                  onChange={e => setForm(p => ({ ...p, runtime: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Spotify auto-tag hint */}
          {form.link && form.link.includes("spotify") && (
            <div style={{
              background: "#f0f7f0", border: "1px solid #b8d4b8", borderRadius: "8px",
              padding: "16px 20px", marginBottom: "16px",
              fontSize: "0.85rem", color: "#3a5a3a", fontFamily: "Georgia, serif",
            }}>
              🎵 Spotify link detected — in a future update, we'll auto-suggest genre, era, and energy tags from the track data.
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={goToPhase2}
              disabled={!form.title.trim()}
              style={{
                background: form.title.trim() ? "#8B4513" : "#ccc",
                color: "#fff", border: "none", borderRadius: "6px",
                padding: "12px 32px", fontSize: "1rem", fontWeight: 600,
                cursor: form.title.trim() ? "pointer" : "default",
                fontFamily: "Georgia, serif",
              }}
            >
              Next: Tag the Vibe →
            </button>
            {!form.title.trim() && (
              <span style={{ fontSize: "0.8rem", color: "#8a7565" }}>
                Add a title to continue
              </span>
            )}
          </div>

          {saved && (
            <div style={{
              marginTop: "16px", padding: "12px 20px", background: "#f0f7f0",
              border: "1px solid #b8d4b8", borderRadius: "8px",
              color: "#2E8B57", fontWeight: 600, fontSize: "0.9rem",
            }}>
              ✓ Playlist saved! Add another or switch to Search.
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 2: Tagging ─── */}
      {phase === 2 && (
        <div>
          {/* Summary of phase 1 */}
          <div style={{
            background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px",
            padding: "16px 20px", marginBottom: "20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <h3 style={{ margin: "0 0 2px 0", fontFamily: "Georgia, serif", color: "#2c1810", fontSize: "1.05rem" }}>
                {form.title}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#8a7565" }}>
                {form.curator}{form.tracks ? ` · ${form.tracks} tracks` : ""}{form.runtime ? ` · ${form.runtime}` : ""}
              </span>
            </div>
            <button
              onClick={goBackToPhase1}
              style={{
                background: "transparent", border: "1px solid #d5c8b8", borderRadius: "6px",
                padding: "6px 14px", fontSize: "0.8rem", cursor: "pointer", color: "#5a4a3a",
              }}
            >
              ← Edit Details
            </button>
          </div>

          {/* Auto-taggable categories (genre, era, energy) — manual for now */}
          <div style={{
            background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px",
            overflow: "hidden", marginBottom: "20px",
          }}>
            <div style={{ padding: "16px 24px 0" }}>
              <h3 style={{ margin: "0 0 4px 0", fontFamily: "Georgia, serif", color: "#2c1810", fontSize: "1rem" }}>
                Musical DNA
              </h3>
              <p style={{ margin: "0 0 8px 0", color: "#8a7565", fontSize: "0.8rem" }}>
                Genre, era, and energy — these will be auto-suggested from Spotify data in a future update. For now, tag manually.
              </p>
            </div>

            {/* Auto-taggable category tabs */}
            <div style={{
              display: "flex", gap: "0", borderBottom: "1px solid #e0d5c7", overflowX: "auto",
              padding: "0 24px",
            }}>
              {autoCatEntries.map(([key, cat]) => {
                const isAutoActive = AUTO_TAGGABLE.has(key) &&
                  ((!MANUAL_CATEGORIES.includes(activeCategory) && activeCategory === key) ||
                   (MANUAL_CATEGORIES.includes(activeCategory) && key === "genre"));
                const showThis = !MANUAL_CATEGORIES.includes(activeCategory) && activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    style={{
                      background: showThis ? cat.color : "transparent",
                      color: showThis ? "#fff" : "#5a4a3a",
                      border: "none",
                      borderRadius: "6px 6px 0 0",
                      padding: "8px 16px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {!MANUAL_CATEGORIES.includes(activeCategory) && (
              <div style={{ padding: "12px 24px 16px" }}>
                <TagCloud
                  tags={TAG_CATEGORIES[activeCategory].tags}
                  activeTags={form.tags}
                  onToggle={toggleTag}
                  color={TAG_CATEGORIES[activeCategory].color}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={`Suggest a new ${TAG_CATEGORIES[activeCategory].label.toLowerCase()} tag...`}
                    value={suggestTag}
                    onChange={e => setSuggestTag(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSuggest()}
                    style={{ ...inputStyle, flex: 1, fontSize: "0.85rem" }}
                  />
                  <button onClick={handleSuggest} style={smallBtnStyle}>+ Add</button>
                </div>
              </div>
            )}

            {MANUAL_CATEGORIES.includes(activeCategory) && (
              <div style={{ padding: "12px 24px 16px", color: "#8a7565", fontSize: "0.85rem" }}>
                Select a tab above to tag genre, era, or energy.
              </div>
            )}
          </div>

          {/* Manual categories — the human stuff */}
          <div style={{
            background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px",
            overflow: "hidden", marginBottom: "20px",
          }}>
            <div style={{ padding: "16px 24px 0" }}>
              <h3 style={{ margin: "0 0 4px 0", fontFamily: "Georgia, serif", color: "#2c1810", fontSize: "1rem" }}>
                The Human Stuff
              </h3>
              <p style={{ margin: "0 0 8px 0", color: "#8a7565", fontSize: "0.8rem" }}>
                Only a person who's been in the room can answer these. When should this play? What does it feel like?
              </p>
            </div>

            {/* Manual category tabs */}
            <div style={{
              display: "flex", gap: "0", borderBottom: "1px solid #e0d5c7", overflowX: "auto",
              padding: "0 24px",
            }}>
              {manualCatEntries.map(([key, cat]) => {
                const showThis = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    style={{
                      background: showThis ? cat.color : "transparent",
                      color: showThis ? "#fff" : "#5a4a3a",
                      border: "none",
                      borderRadius: "6px 6px 0 0",
                      padding: "8px 16px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {MANUAL_CATEGORIES.includes(activeCategory) && (
              <div style={{ padding: "12px 24px 16px" }}>
                <TagCloud
                  tags={TAG_CATEGORIES[activeCategory].tags}
                  activeTags={form.tags}
                  onToggle={toggleTag}
                  color={TAG_CATEGORIES[activeCategory].color}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={`Suggest a new ${TAG_CATEGORIES[activeCategory].label.toLowerCase()} tag...`}
                    value={suggestTag}
                    onChange={e => setSuggestTag(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSuggest()}
                    style={{ ...inputStyle, flex: 1, fontSize: "0.85rem" }}
                  />
                  <button onClick={handleSuggest} style={smallBtnStyle}>+ Add</button>
                </div>
              </div>
            )}

            {!MANUAL_CATEGORIES.includes(activeCategory) && (
              <div style={{ padding: "12px 24px 16px", color: "#8a7565", fontSize: "0.85rem" }}>
                Select a tab above to tag time, season, room, vibe, or practical details.
              </div>
            )}
          </div>

          {suggestions.length > 0 && (
            <div style={{
              fontSize: "0.8rem", color: "#8a7565", marginBottom: "12px",
              background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px",
              padding: "12px 20px",
            }}>
              <span style={{ fontWeight: 600 }}>Suggested tags: </span>{suggestions.join(", ")}
            </div>
          )}

          {/* Selected tags summary */}
          {form.tags.length > 0 && (
            <div style={{
              background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px",
              padding: "16px 24px", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "0.8rem", color: "#8a7565", marginBottom: "8px", fontWeight: 600 }}>
                {form.tags.length} tags selected:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      background: "#8B4513", color: "#fff", borderRadius: "4px",
                      padding: "3px 10px", fontSize: "0.8rem", cursor: "pointer",
                    }}
                  >
                    {tag} &times;
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={goBackToPhase1}
              style={{
                background: "transparent", border: "1px solid #d5c8b8",
                borderRadius: "6px", padding: "12px 24px", fontSize: "1rem",
                cursor: "pointer", color: "#5a4a3a", fontFamily: "Georgia, serif",
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              style={{
                background: "#8B4513",
                color: "#fff", border: "none", borderRadius: "6px",
                padding: "12px 32px", fontSize: "1rem", fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Georgia, serif",
              }}
            >
              Save Playlist
            </button>
            {form.tags.length === 0 && (
              <span style={{ fontSize: "0.8rem", color: "#8a7565" }}>
                You can save without tags, but the more you tag, the better search works
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchView({ playlists }) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeCategory, setActiveCategory] = useState("vibe");

  const toggleFilter = useCallback((tag) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const results = useMemo(
    () => searchPlaylists(playlists, query, activeFilters),
    [playlists, query, activeFilters]
  );

  const showAll = !query.trim() && activeFilters.length === 0;

  const catEntries = Object.entries(TAG_CATEGORIES);

  return (
    <div>
      {/* Search header — Cookthink style */}
      <div style={{
        background: "linear-gradient(135deg, #3c2415 0%, #5a3a28 100%)",
        borderRadius: "12px", padding: "32px", marginBottom: "24px", textAlign: "center",
      }}>
        <h2 style={{
          margin: "0 0 16px 0", fontFamily: "Georgia, serif",
          color: "#f5e6d3", fontSize: "1.6rem", fontWeight: 400,
        }}>
          what are you in the mood for?
        </h2>
        <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Type cravings separated by spaces... e.g. rainy chill afternoon"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: "6px", border: "none",
              fontSize: "1rem", fontFamily: "Georgia, serif",
              background: "#faf7f2", color: "#2c1810",
            }}
          />
          <button style={{
            background: "#D2691E", color: "#fff", border: "none",
            borderRadius: "6px", padding: "12px 24px", fontSize: "1rem",
            fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif",
          }}>
            search
          </button>
        </div>
        {activeFilters.length > 0 && (
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {activeFilters.map(f => (
              <span key={f} onClick={() => toggleFilter(f)} style={{
                background: "rgba(255,255,255,0.2)", color: "#f5e6d3",
                borderRadius: "4px", padding: "3px 10px", fontSize: "0.8rem",
                cursor: "pointer",
              }}>
                {f} &times;
              </span>
            ))}
            <span
              onClick={() => setActiveFilters([])}
              style={{ color: "#f5e6d3", fontSize: "0.8rem", cursor: "pointer", padding: "3px 8px", textDecoration: "underline" }}
            >
              clear all
            </span>
          </div>
        )}
      </div>

      {/* Tag browser with category tabs — the Cookthink "what are you craving" panel */}
      <div style={{
        background: "#faf7f2", border: "1px solid #e0d5c7", borderRadius: "8px",
        marginBottom: "24px", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px 0" }}>
          <p style={{ margin: 0, color: "#8a7565", fontSize: "0.85rem" }}>
            ...or browse by category and click to filter:
          </p>
        </div>

        {/* Category tabs at bottom like Cookthink */}
        <div style={{ padding: "4px 20px 12px" }}>
          <TagCloud
            tags={TAG_CATEGORIES[activeCategory].tags}
            activeTags={activeFilters}
            onToggle={toggleFilter}
            color={TAG_CATEGORIES[activeCategory].color}
          />
        </div>

        <div style={{
          display: "flex", borderTop: "1px solid #e0d5c7",
          background: "linear-gradient(to bottom, #e8ddd0, #d9ccbc)",
        }}>
          {catEntries.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                flex: 1, background: activeCategory === key ? cat.color : "transparent",
                color: activeCategory === key ? "#fff" : "#5a4a3a",
                border: "none", padding: "10px 4px", fontSize: "0.72rem",
                fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
                letterSpacing: "0.03em", borderRadius: activeCategory === key ? "0" : "0",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <div style={{ fontSize: "0.85rem", color: "#8a7565", marginBottom: "12px" }}>
          {showAll
            ? `All playlists (${playlists.length})`
            : `${results.length} playlist${results.length !== 1 ? "s" : ""} found`
          }
        </div>
        {(showAll ? playlists : results).map(pl => (
          <PlaylistCard key={pl.id} playlist={pl} allCategories={TAG_CATEGORIES} />
        ))}
        {!showAll && results.length === 0 && (
          <div style={{
            textAlign: "center", padding: "48px 24px", color: "#8a7565",
            fontFamily: "Georgia, serif", fontSize: "1.1rem",
          }}>
            No playlists match that vibe yet. Time to make one?
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
const inputStyle = {
  padding: "10px 14px", borderRadius: "6px", border: "1px solid #d5c8b8",
  fontSize: "0.95rem", fontFamily: "Georgia, serif", background: "#fff", color: "#2c1810",
  outline: "none",
};

const smallBtnStyle = {
  background: "#8B4513", color: "#fff", border: "none", borderRadius: "6px",
  padding: "8px 16px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600,
};

export default function HighDivePlaylistDB() {
  const [view, setView] = useState("search");
  const [playlists, setPlaylists] = useState(INITIAL_PLAYLISTS);

  return (
    <div style={{
      maxWidth: "900px", margin: "0 auto", padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#2c1810", minHeight: "100vh", background: "#f0e8dd",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: "2.2rem", fontWeight: 400,
          color: "#2c1810", margin: "0 0 4px 0",
        }}>
          High Dive Playlist Library
        </h1>
        <p style={{ color: "#8a7565", margin: "0 0 20px 0", fontFamily: "Georgia, serif" }}>
          Music selected by a human. Always.
        </p>

        {/* View toggle */}
        <div style={{
          display: "inline-flex", background: "#e0d5c7", borderRadius: "8px", padding: "3px",
        }}>
          <button
            onClick={() => setView("search")}
            style={{
              background: view === "search" ? "#fff" : "transparent",
              color: "#2c1810", border: "none", borderRadius: "6px",
              padding: "8px 24px", fontSize: "0.9rem", cursor: "pointer",
              fontWeight: view === "search" ? 600 : 400,
              boxShadow: view === "search" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Search
          </button>
          <button
            onClick={() => setView("curate")}
            style={{
              background: view === "curate" ? "#fff" : "transparent",
              color: "#2c1810", border: "none", borderRadius: "6px",
              padding: "8px 24px", fontSize: "0.9rem", cursor: "pointer",
              fontWeight: view === "curate" ? 600 : 400,
              boxShadow: view === "curate" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Curate
          </button>
        </div>
      </div>

      {view === "search"
        ? <SearchView playlists={playlists} />
        : <CuratorView playlists={playlists} setPlaylists={setPlaylists} />
      }

      {/* Footer */}
      <div style={{
        textAlign: "center", marginTop: "48px", padding: "24px",
        borderTop: "1px solid #e0d5c7", color: "#8a7565", fontSize: "0.8rem",
      }}>
        High Dive Playlist Library &middot; {playlists.length} playlists &middot; Built for humans who care about what's playing
      </div>
    </div>
  );
}
