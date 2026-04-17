import { useState, useMemo, useCallback, useEffect } from "react";
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
      "singer-songwriter","ska","tropicalia","exotica"
    ],
  },
  era: {
    label: "Era",
    color: "#556B2F",
    tags: [
      "timeless","mixed era","2020s","2010s","2000s","1990s","1980s","1970s",
      "1960s","1950s","pre-war"
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
      "all day","weekend morning","weekday afternoon",
      "Saturday morning","Sunday morning","Saturday afternoon","Sunday afternoon",
      "Thursday afternoon"
    ],
  },
  season: {
    label: "Season & Weather",
    color: "#2E8B57",
    tags: [
      "spring","summer","autumn","winter","rainy day","sunny","overcast",
      "crisp air","humid","snowy","stormy","foggy","first warm day",
      "Indian summer","dead of winter","year-round",
      "first cold day","brisk","freezing","broiling","thunderstorms",
      "gloomy","soggy","tornado"
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
      "instrumental","instrumental-heavy","vocal-forward","mixed vocals","deep cuts only",
      "some recognizable","mostly recognizable","explicit content","clean",
      "builds energy","steady energy","winds down","journey/arc",
      "great openers","great closers","pairs with coffee","pairs with wine",
      "pairs with cocktails","pairs with food"
    ],
  },
};

// ─── SYNONYM / ASSOCIATION MAP ──────────────────────────────────────────────
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

// ─── BRAND + LAYOUT CONSTANTS ──────────────────────────────────────────────
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "Georgia, 'Times New Roman', serif";
const FONT_NAV = "'Archivo Narrow', 'Titling Gothic FB', -apple-system, Helvetica, sans-serif";

const HD = {
  black: "#3E3E3F",
  walnut: "#2E2E2F",
  amber: "#F27178",
  cream: "#FAF7F5",
  warmWhite: "#FFFFFF",
  warmGray: "#7A7A7B",
  rule: "#E0DEDD",
};

const inputStyle = {
  padding: "10px 14px", borderRadius: "4px", border: `1px solid ${HD.rule}`,
  fontSize: "0.95rem", fontFamily: FONT_BODY, background: "#fff", color: HD.black,
  outline: "none",
};

const smallBtnStyle = {
  background: HD.walnut, color: "#fff", border: "none", borderRadius: "4px",
  padding: "8px 16px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600,
};

// ─── API HELPERS ────────────────────────────────────────────────────────────
const API_BASE = "/.netlify/functions";

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function fetchPlaylists(adminPassword) {
  const headers = adminPassword ? { "admin-password": adminPassword } : {};
  return apiFetch("get-playlists", { headers });
}

async function submitPlaylist(playlistData) {
  return apiFetch("submit-playlist", {
    method: "POST",
    body: JSON.stringify(playlistData),
  });
}

async function adminAction(action, id, adminPassword, extra = {}) {
  return apiFetch("admin-playlist", {
    method: "POST",
    headers: { "admin-password": adminPassword },
    body: JSON.stringify({ action, id, ...extra }),
  });
}

// ─── SEARCH HELPERS ────────────────────────────────────────────────────────
function searchPlaylists(playlists, query, activeFilters) {
  if (!query.trim() && activeFilters.length === 0) return playlists;

  const words = query.toLowerCase().split(/[\s,]+/).filter(Boolean);

  return playlists
    .map(pl => {
      const plTags = pl.tags.map(t => t.toLowerCase());
      let score = 0;

      activeFilters.forEach(f => {
        if (plTags.includes(f.toLowerCase())) score += 2;
      });

      words.forEach(word => {
        plTags.forEach(tag => {
          if (tag === word) score += 2;
          else if (tag.includes(word)) score += 1;
        });

        if (pl.title.toLowerCase().includes(word)) score += 1.5;
        if (pl.description.toLowerCase().includes(word)) score += 0.5;
        if (pl.curator && pl.curator.toLowerCase().includes(word)) score += 2;

        if (SYNONYM_MAP[word]) {
          SYNONYM_MAP[word].forEach(([synTag, weight]) => {
            if (plTags.includes(synTag.toLowerCase())) {
              score += weight * 1.5;
            }
          });
        }

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
  const sizes = useMemo(() => {
    const map = {};
    tags.forEach((t) => {
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
              background: active ? HD.walnut : "transparent",
              color: active ? "#fff" : HD.black,
              border: "none",
              borderRadius: "3px",
              padding: "2px 6px",
              fontSize: `${sizes[tag]}rem`,
              cursor: "pointer",
              fontFamily: FONT_BODY,
              opacity: active ? 1 : 0.7,
              transition: "all 0.15s ease",
              fontWeight: active ? 600 : 400,
            }}
            onMouseEnter={e => { if (!active) e.target.style.opacity = 1; e.target.style.textDecoration = "underline"; }}
            onMouseLeave={e => { if (!active) e.target.style.opacity = 0.7; e.target.style.textDecoration = "none"; }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

function PlaylistCard({ playlist, allCategories, onCuratorClick }) {
  const [expanded, setExpanded] = useState(false);

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

  // Determine which streaming links are available
  const links = [];
  if (playlist.spotifyLink) links.push({ label: "Spotify", url: playlist.spotifyLink });
  if (playlist.appleMusicLink) links.push({ label: "Apple Music", url: playlist.appleMusicLink });
  if (playlist.tidalLink) links.push({ label: "TIDAL", url: playlist.tidalLink });
  // Fallback to generic link
  if (links.length === 0 && playlist.link) links.push({ label: "Open playlist", url: playlist.link });

  return (
    <div
      style={{
        background: HD.warmWhite,
        border: `1px solid ${HD.rule}`,
        borderRadius: "6px",
        padding: "20px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px 0", fontFamily: FONT_DISPLAY, color: HD.black, fontSize: "1.15rem" }}>
            {playlist.title}
          </h3>
          <div style={{ fontSize: "0.75rem", color: HD.warmGray, marginBottom: "8px", fontFamily: FONT_NAV }}>
            <span
              onClick={onCuratorClick ? (e) => { e.stopPropagation(); onCuratorClick(playlist.curator); } : undefined}
              style={onCuratorClick ? {
                color: HD.amber, cursor: "pointer", textDecoration: "underline",
                textDecorationColor: HD.rule,
              } : {}}
              onMouseEnter={onCuratorClick ? (e) => { e.target.style.textDecorationColor = HD.amber; } : undefined}
              onMouseLeave={onCuratorClick ? (e) => { e.target.style.textDecorationColor = HD.rule; } : undefined}
            >
              {playlist.curator}
            </span>
            {playlist.tracks ? <>{" "}&middot; {playlist.tracks} tracks</> : null}
            {playlist.runtime ? <>{" "}&middot; {playlist.runtime}</> : null}
          </div>
          <p style={{
            margin: 0, color: "#4a3f34", fontSize: "0.9rem", lineHeight: 1.6, fontFamily: FONT_BODY,
          }}>
            {playlist.description}
          </p>
        </div>
        {playlist.score !== undefined && (
          <div style={{
            background: HD.walnut, color: "#fff", borderRadius: "12px",
            padding: "2px 10px", fontSize: "0.7rem", fontWeight: 600, marginLeft: "12px", flexShrink: 0,
            fontFamily: FONT_NAV,
          }}>
            {Math.round(playlist.score * 10) / 10}
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${HD.rule}` }}>
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
          {links.length > 0 && (
            <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {links.map(l => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: HD.amber, fontSize: "0.85rem", fontFamily: FONT_NAV }}>
                  {l.label} &rarr;
                </a>
              ))}
            </div>
          )}
          {playlist.moodVibe && (
            <div style={{ marginTop: "10px", fontSize: "0.8rem", color: HD.warmGray, fontStyle: "italic" }}>
              {playlist.moodVibe}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SEARCH VIEW ────────────────────────────────────────────────────────────

function SearchView({ playlists }) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeCategory, setActiveCategory] = useState("vibe");
  const [curatorFilter, setCuratorFilter] = useState(null);

  const toggleFilter = useCallback((tag) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const filteredByCurator = curatorFilter
    ? playlists.filter(pl => pl.curator === curatorFilter)
    : playlists;

  const results = useMemo(
    () => searchPlaylists(filteredByCurator, query, activeFilters),
    [filteredByCurator, query, activeFilters]
  );

  const showAll = !query.trim() && activeFilters.length === 0;

  const catEntries = Object.entries(TAG_CATEGORIES);

  return (
    <div>
      {/* Search header */}
      <div style={{
        background: HD.black,
        borderRadius: "8px", padding: "36px 32px", marginBottom: "24px", textAlign: "center",
      }}>
        <h2 style={{
          margin: "0 0 16px 0", fontFamily: FONT_DISPLAY,
          color: HD.cream, fontSize: "1.5rem", fontWeight: 400, fontStyle: "italic",
        }}>
          What are you in the mood for?
        </h2>
        <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="e.g. rainy chill afternoon jazz"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: "4px", border: "none",
              fontSize: "1rem", fontFamily: FONT_BODY,
              background: HD.warmWhite, color: HD.black,
            }}
          />
          <button style={{
            background: HD.amber, color: "#fff", border: "none",
            borderRadius: "4px", padding: "12px 24px", fontSize: "0.8rem",
            fontWeight: 600, cursor: "pointer", fontFamily: FONT_NAV,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Search
          </button>
        </div>
        {(activeFilters.length > 0 || curatorFilter) && (
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {curatorFilter && (
              <span onClick={() => setCuratorFilter(null)} style={{
                background: "rgba(242,113,120,0.5)", color: HD.cream,
                borderRadius: "4px", padding: "3px 10px", fontSize: "0.8rem",
                cursor: "pointer", fontWeight: 600,
              }}>
                Curator: {curatorFilter} &times;
              </span>
            )}
            {activeFilters.map(f => (
              <span key={f} onClick={() => toggleFilter(f)} style={{
                background: "rgba(255,255,255,0.15)", color: HD.cream,
                borderRadius: "4px", padding: "3px 10px", fontSize: "0.8rem",
                cursor: "pointer",
              }}>
                {f} &times;
              </span>
            ))}
            <span
              onClick={() => { setActiveFilters([]); setCuratorFilter(null); }}
              style={{ color: HD.cream, fontSize: "0.8rem", cursor: "pointer", padding: "3px 8px", textDecoration: "underline" }}
            >
              clear all
            </span>
          </div>
        )}
      </div>

      {/* Tag browser */}
      <div style={{
        background: HD.warmWhite, border: `1px solid ${HD.rule}`, borderRadius: "6px",
        marginBottom: "24px", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px 0" }}>
          <p style={{ margin: 0, color: HD.warmGray, fontSize: "0.8rem", fontFamily: FONT_NAV }}>
            Browse by category:
          </p>
        </div>

        <div style={{ padding: "4px 20px 12px" }}>
          <TagCloud
            tags={TAG_CATEGORIES[activeCategory].tags}
            activeTags={activeFilters}
            onToggle={toggleFilter}
            color={TAG_CATEGORIES[activeCategory].color}
          />
        </div>

        <div style={{
          display: "flex", borderTop: `1px solid ${HD.rule}`,
          background: HD.cream,
        }}>
          {catEntries.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                flex: 1,
                background: activeCategory === key ? HD.walnut : "transparent",
                color: activeCategory === key ? "#fff" : HD.warmGray,
                border: "none", padding: "10px 4px", fontSize: "0.65rem",
                fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: FONT_NAV,
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
            ? curatorFilter
              ? `${filteredByCurator.length} playlist${filteredByCurator.length !== 1 ? "s" : ""} by ${curatorFilter}`
              : `All playlists (${playlists.length})`
            : `${results.length} playlist${results.length !== 1 ? "s" : ""} found${curatorFilter ? ` by ${curatorFilter}` : ""}`
          }
        </div>
        {(showAll ? filteredByCurator : results).map(pl => (
          <PlaylistCard key={pl.id} playlist={pl} allCategories={TAG_CATEGORIES} onCuratorClick={setCuratorFilter} />
        ))}
        {!showAll && results.length === 0 && (
          <div style={{
            textAlign: "center", padding: "48px 24px", color: "#8a7565",
            fontFamily: FONT_BODY, fontSize: "1.1rem",
          }}>
            No playlists match that vibe yet. Time to make one?
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CURATOR / SUBMIT VIEW ──────────────────────────────────────────────────

function CuratorView({ inviteToken, onSubmitted }) {
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState({
    title: "", contactName: "", creditName: "", description: "", moodVibe: "",
    spotifyLink: "", appleMusicLink: "", tidalLink: "",
    tracks: "", runtime: "", tags: [],
  });
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [activeCategory, setActiveCategory] = useState("vibe");
  const [suggestTag, setSuggestTag] = useState("");
  const [customTags, setCustomTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleTag = useCallback((tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  }, []);

  const handleSuggest = () => {
    if (suggestTag.trim()) {
      setCustomTags(prev => [...prev, suggestTag.trim()]);
      setForm(prev => ({ ...prev, tags: [...prev.tags, suggestTag.trim()] }));
      setSuggestTag("");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.contactName.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitPlaylist({
        inviteToken,
        title: form.title,
        contactName: form.contactName,
        creditName: form.creditName || null,
        description: form.description,
        moodVibe: form.moodVibe,
        spotifyLink: form.spotifyLink,
        appleMusicLink: form.appleMusicLink,
        tidalLink: form.tidalLink,
        tracks: form.tracks ? parseInt(form.tracks) : null,
        runtime: form.runtime,
        tags: form.tags,
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "", contactName: form.contactName, creditName: form.creditName,
      description: "", moodVibe: "",
      spotifyLink: "", appleMusicLink: "", tidalLink: "",
      tracks: "", runtime: "", tags: [],
    });
    setAiSuggestions(null);
    setCustomTags([]);
    setAiError("");
    setSubmitError("");
    setPhase(1);
    setSubmitted(false);
  };

  const fetchAISuggestions = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/.netlify/functions/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get tag suggestions");

      setAiSuggestions(data.suggestedTags);

      const allSuggested = Object.values(data.suggestedTags).flat();
      const newTags = [...form.tags];
      for (const tag of allSuggested) {
        if (!newTags.includes(tag)) newTags.push(tag);
      }
      setForm(prev => ({ ...prev, tags: newTags }));
      return true;
    } catch (err) {
      setAiError(err.message);
      return false;
    } finally {
      setAiLoading(false);
    }
  };

  const goToPhase2 = async () => {
    if (!form.title.trim() || !form.contactName.trim()) return;
    if (!aiSuggestions) await fetchAISuggestions();
    setPhase(2);
    setActiveCategory("vibe");
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "#e8f5e8", color: "#2E8B57",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem", margin: "0 auto 16px",
        }}>
          &#10003;
        </div>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: HD.black, margin: "0 0 8px 0" }}>
          Playlist submitted!
        </h2>
        <p style={{ color: HD.warmGray, fontFamily: FONT_BODY, fontSize: "0.95rem", margin: "0 0 24px 0" }}>
          It's in the queue for review. We'll add it to the library once it's approved.
        </p>
        <button onClick={resetForm} style={{
          background: HD.walnut, color: "#fff", border: "none", borderRadius: "6px",
          padding: "12px 32px", fontSize: "1rem", fontWeight: 600, cursor: "pointer",
          fontFamily: FONT_BODY,
        }}>
          Submit another playlist
        </button>
      </div>
    );
  }

  const totalSuggested = aiSuggestions ? Object.values(aiSuggestions).flat().length : 0;
  const catEntries = Object.entries(TAG_CATEGORIES);

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
            background: phase === 1 ? HD.walnut : "#2E8B57",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 600,
          }}>
            {phase > 1 ? "\u2713" : "1"}
          </div>
          <span style={{
            fontSize: "0.85rem", fontWeight: phase === 1 ? 600 : 400,
            color: HD.black, fontFamily: FONT_BODY,
          }}>
            Playlist Details
          </span>
        </div>
        <div style={{ width: "40px", height: "2px", background: phase >= 2 ? HD.walnut : HD.rule }} />
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          opacity: phase === 2 ? 1 : 0.5,
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: phase === 2 ? HD.walnut : HD.rule,
            color: phase === 2 ? "#fff" : HD.warmGray,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 600,
          }}>
            2
          </div>
          <span style={{
            fontSize: "0.85rem", fontWeight: phase === 2 ? 600 : 400,
            color: phase === 2 ? HD.black : HD.warmGray, fontFamily: FONT_BODY,
          }}>
            Add Keywords
          </span>
        </div>
      </div>

      {/* ─── PHASE 1: Playlist Details ─── */}
      {phase === 1 && (
        <div>
          <div style={{
            background: HD.cream, border: `1px solid ${HD.rule}`, borderRadius: "8px", padding: "24px", marginBottom: "24px",
          }}>
            <h3 style={{ margin: "0 0 4px 0", fontFamily: FONT_DISPLAY, color: HD.black }}>Tell us about the playlist</h3>
            <p style={{ margin: "0 0 16px 0", color: HD.warmGray, fontSize: "0.85rem" }}>
              Basic info first. We'll handle tags in the next step.
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              <input
                type="text" placeholder="Playlist title *" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="What's the story behind this playlist? How would you describe it to someone else?"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3} style={{ ...inputStyle, resize: "vertical" }}
              />
              <textarea
                placeholder="When and where would you play this? What should people feel when they hear it?"
                value={form.moodVibe}
                onChange={e => setForm(p => ({ ...p, moodVibe: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: "vertical" }}
              />

              <div style={{ borderTop: `1px solid ${HD.rule}`, paddingTop: "12px", marginTop: "4px" }}>
                <p style={{ margin: "0 0 8px 0", color: HD.warmGray, fontSize: "0.8rem", fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Streaming Links
                </p>
                <div style={{ display: "grid", gap: "8px" }}>
                  <input
                    type="url" placeholder="Spotify link" value={form.spotifyLink}
                    onChange={e => setForm(p => ({ ...p, spotifyLink: e.target.value }))}
                    style={inputStyle}
                  />
                  <input
                    type="url" placeholder="Apple Music link" value={form.appleMusicLink}
                    onChange={e => setForm(p => ({ ...p, appleMusicLink: e.target.value }))}
                    style={inputStyle}
                  />
                  <input
                    type="url" placeholder="TIDAL link" value={form.tidalLink}
                    onChange={e => setForm(p => ({ ...p, tidalLink: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${HD.rule}`, paddingTop: "12px", marginTop: "4px" }}>
                <p style={{ margin: "0 0 8px 0", color: HD.warmGray, fontSize: "0.8rem", fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  About You
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="text" placeholder="Your name (private) *" value={form.contactName}
                    onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Credit as (display name, optional)"
                    value={form.creditName}
                    onChange={e => setForm(p => ({ ...p, creditName: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <p style={{ margin: "4px 0 0 0", color: HD.warmGray, fontSize: "0.75rem" }}>
                  Your name stays private. "Credit as" is what shows publicly — leave blank to use your name.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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

          {form.title.trim() && form.description.trim() && (
            <div style={{
              background: "#f0f7f0", border: "1px solid #b8d4b8", borderRadius: "8px",
              padding: "16px 20px", marginBottom: "16px",
              fontSize: "0.85rem", color: "#3a5a3a", fontFamily: FONT_BODY,
            }}>
              When you proceed, we'll auto-suggest tags across all categories based on your title and description.
            </div>
          )}
          {aiError && (
            <div style={{
              background: "#fff0f0", border: "1px solid #d4b8b8", borderRadius: "8px",
              padding: "16px 20px", marginBottom: "16px",
              fontSize: "0.85rem", color: "#5a3a3a", fontFamily: FONT_BODY,
            }}>
              Couldn't generate tag suggestions: {aiError}. You can still tag manually.
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={goToPhase2}
              disabled={!form.title.trim() || !form.contactName.trim() || aiLoading}
              style={{
                background: (form.title.trim() && form.contactName.trim() && !aiLoading) ? HD.walnut : "#ccc",
                color: "#fff", border: "none", borderRadius: "6px",
                padding: "12px 32px", fontSize: "1rem", fontWeight: 600,
                cursor: (form.title.trim() && form.contactName.trim() && !aiLoading) ? "pointer" : "default",
                fontFamily: FONT_BODY,
              }}
            >
              {aiLoading ? "Generating tag suggestions..." : "Next: Add Keywords \u2192"}
            </button>
            {(!form.title.trim() || !form.contactName.trim()) && !aiLoading && (
              <span style={{ fontSize: "0.8rem", color: HD.warmGray }}>
                {!form.title.trim() ? "Add a title to continue" : "Add your name to continue"}
              </span>
            )}
            {aiLoading && (
              <span style={{ fontSize: "0.8rem", color: HD.warmGray }}>
                Reading the vibe...
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── PHASE 2: Tagging ─── */}
      {phase === 2 && (
        <div>
          {/* Summary of phase 1 */}
          <div style={{
            background: HD.cream, border: `1px solid ${HD.rule}`, borderRadius: "8px",
            padding: "16px 20px", marginBottom: "20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <h3 style={{ margin: "0 0 2px 0", fontFamily: FONT_DISPLAY, color: HD.black, fontSize: "1.05rem" }}>
                {form.title}
              </h3>
              <span style={{ fontSize: "0.8rem", color: HD.warmGray }}>
                {form.creditName || form.contactName}
                {form.tracks ? ` \u00b7 ${form.tracks} tracks` : ""}
                {form.runtime ? ` \u00b7 ${form.runtime}` : ""}
              </span>
            </div>
            <button
              onClick={() => setPhase(1)}
              style={{
                background: "transparent", border: `1px solid ${HD.rule}`, borderRadius: "6px",
                padding: "6px 14px", fontSize: "0.8rem", cursor: "pointer", color: HD.warmGray,
              }}
            >
              &larr; Edit Details
            </button>
          </div>

          {/* AI suggestions summary */}
          {aiSuggestions && totalSuggested > 0 && (
            <div style={{
              background: "#f0f7f0", border: "1px solid #b8d4b8", borderRadius: "8px",
              padding: "16px 20px", marginBottom: "20px",
              fontFamily: FONT_BODY,
            }}>
              <div style={{ fontSize: "0.85rem", color: "#3a5a3a", marginBottom: "4px", fontWeight: 600 }}>
                {totalSuggested} tags auto-suggested
              </div>
              <div style={{ fontSize: "0.8rem", color: "#5a7a5a" }}>
                Review the suggestions below — they're pre-selected. Click any tag to add or remove it.
              </div>
              <button
                onClick={fetchAISuggestions}
                disabled={aiLoading}
                style={{
                  marginTop: "8px", background: "transparent", border: "1px solid #b8d4b8",
                  borderRadius: "4px", padding: "4px 12px", fontSize: "0.75rem",
                  cursor: aiLoading ? "default" : "pointer", color: "#3a5a3a",
                }}
              >
                {aiLoading ? "Regenerating..." : "Regenerate suggestions"}
              </button>
            </div>
          )}

          {/* All tag categories */}
          <div style={{
            background: HD.cream, border: `1px solid ${HD.rule}`, borderRadius: "8px",
            overflow: "hidden", marginBottom: "20px",
          }}>
            <div style={{ padding: "16px 24px 0" }}>
              <h3 style={{ margin: "0 0 4px 0", fontFamily: FONT_DISPLAY, color: HD.black, fontSize: "1rem" }}>
                Keywords
              </h3>
              <p style={{ margin: "0 0 8px 0", color: HD.warmGray, fontSize: "0.8rem" }}>
                What words would you use to describe (and search for) this playlist?
              </p>
            </div>

            {/* Category tabs */}
            <div style={{
              display: "flex", gap: "0", borderBottom: `1px solid ${HD.rule}`, overflowX: "auto",
              padding: "0 24px",
            }}>
              {catEntries.map(([key, cat]) => {
                const showThis = activeCategory === key;
                const catSuggestionCount = aiSuggestions && aiSuggestions[key] ? aiSuggestions[key].length : 0;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    style={{
                      background: showThis ? cat.color : "transparent",
                      color: showThis ? "#fff" : HD.warmGray,
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
                    {catSuggestionCount > 0 && !showThis && (
                      <span style={{
                        marginLeft: "4px", background: "#b8d4b8", color: "#3a5a3a",
                        borderRadius: "8px", padding: "1px 5px", fontSize: "0.65rem",
                      }}>
                        {catSuggestionCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: "12px 24px 16px" }}>
              {aiSuggestions && aiSuggestions[activeCategory] && aiSuggestions[activeCategory].length > 0 && (
                <div style={{
                  fontSize: "0.75rem", color: "#5a7a5a", marginBottom: "8px",
                  fontStyle: "italic",
                }}>
                  Suggested: {aiSuggestions[activeCategory].join(", ")}
                </div>
              )}
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
          </div>

          {customTags.length > 0 && (
            <div style={{
              fontSize: "0.8rem", color: HD.warmGray, marginBottom: "12px",
              background: HD.cream, border: `1px solid ${HD.rule}`, borderRadius: "8px",
              padding: "12px 20px",
            }}>
              <span style={{ fontWeight: 600 }}>Custom tags: </span>{customTags.join(", ")}
            </div>
          )}

          {/* Selected tags summary */}
          {form.tags.length > 0 && (
            <div style={{
              background: HD.cream, border: `1px solid ${HD.rule}`, borderRadius: "8px",
              padding: "16px 24px", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "0.8rem", color: HD.warmGray, marginBottom: "8px", fontWeight: 600 }}>
                {form.tags.length} tags selected:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      background: HD.walnut, color: "#fff", borderRadius: "4px",
                      padding: "3px 10px", fontSize: "0.8rem", cursor: "pointer",
                    }}
                  >
                    {tag} &times;
                  </span>
                ))}
              </div>
            </div>
          )}

          {submitError && (
            <div style={{
              background: "#fff0f0", border: "1px solid #d4b8b8", borderRadius: "8px",
              padding: "16px 20px", marginBottom: "16px",
              fontSize: "0.85rem", color: "#5a3a3a", fontFamily: FONT_BODY,
            }}>
              {submitError}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setPhase(1)}
              style={{
                background: "transparent", border: `1px solid ${HD.rule}`,
                borderRadius: "6px", padding: "12px 24px", fontSize: "1rem",
                cursor: "pointer", color: HD.warmGray, fontFamily: FONT_BODY,
              }}
            >
              &larr; Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: submitting ? "#ccc" : HD.amber,
                color: "#fff", border: "none", borderRadius: "6px",
                padding: "12px 32px", fontSize: "1rem", fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
                fontFamily: FONT_BODY,
              }}
            >
              {submitting ? "Submitting..." : "Submit Playlist"}
            </button>
            {form.tags.length === 0 && (
              <span style={{ fontSize: "0.8rem", color: HD.warmGray }}>
                You can submit without tags, but the more you tag, the better search works
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN VIEW ─────────────────────────────────────────────────────────────

function AdminView({ playlists, adminPassword, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const pending = playlists.filter(p => p.status === "pending");
  const approved = playlists.filter(p => p.status === "approved");
  const rejected = playlists.filter(p => p.status === "rejected");

  const handleAction = async (action, id, extra = {}) => {
    setActionLoading(id + action);
    setError("");
    try {
      await adminAction(action, id, adminPassword, extra);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (pl) => {
    setEditingId(pl.id);
    setEditForm({
      title: pl.title,
      description: pl.description || "",
      moodVibe: pl.moodVibe || "",
      creditName: pl.curator || "",
      spotifyLink: pl.spotifyLink || "",
      appleMusicLink: pl.appleMusicLink || "",
      tidalLink: pl.tidalLink || "",
      tracks: pl.tracks || "",
      runtime: pl.runtime || "",
    });
  };

  const saveEdit = async (id) => {
    setActionLoading(id + "update");
    setError("");
    try {
      await adminAction("update", id, adminPassword, editForm);
      setEditingId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderPlaylistAdmin = (pl) => {
    const isEditing = editingId === pl.id;
    return (
      <div key={pl.id} style={{
        background: HD.warmWhite, border: `1px solid ${HD.rule}`, borderRadius: "6px",
        padding: "16px 20px", marginBottom: "10px",
      }}>
        {isEditing ? (
          <div style={{ display: "grid", gap: "8px" }}>
            <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Title" style={inputStyle} />
            <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            <textarea value={editForm.moodVibe} onChange={e => setEditForm(p => ({ ...p, moodVibe: e.target.value }))}
              placeholder="Mood / Vibe" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            <input value={editForm.creditName} onChange={e => setEditForm(p => ({ ...p, creditName: e.target.value }))}
              placeholder="Credit name" style={inputStyle} />
            <input value={editForm.spotifyLink} onChange={e => setEditForm(p => ({ ...p, spotifyLink: e.target.value }))}
              placeholder="Spotify link" style={inputStyle} />
            <input value={editForm.appleMusicLink} onChange={e => setEditForm(p => ({ ...p, appleMusicLink: e.target.value }))}
              placeholder="Apple Music link" style={inputStyle} />
            <input value={editForm.tidalLink} onChange={e => setEditForm(p => ({ ...p, tidalLink: e.target.value }))}
              placeholder="TIDAL link" style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <input value={editForm.tracks} onChange={e => setEditForm(p => ({ ...p, tracks: e.target.value }))}
                placeholder="Tracks" style={inputStyle} />
              <input value={editForm.runtime} onChange={e => setEditForm(p => ({ ...p, runtime: e.target.value }))}
                placeholder="Runtime" style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button onClick={() => saveEdit(pl.id)} disabled={actionLoading === pl.id + "update"}
                style={{ ...smallBtnStyle, background: HD.amber }}>
                {actionLoading === pl.id + "update" ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditingId(null)}
                style={{ ...smallBtnStyle, background: "transparent", color: HD.warmGray, border: `1px solid ${HD.rule}` }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px 0", fontFamily: FONT_DISPLAY, color: HD.black, fontSize: "1.05rem" }}>
                  {pl.title}
                </h4>
                <div style={{ fontSize: "0.75rem", color: HD.warmGray, fontFamily: FONT_NAV, marginBottom: "6px" }}>
                  <strong>Contact:</strong> {pl.contactName || "—"} &middot;{" "}
                  <strong>Credit:</strong> {pl.curator || "—"}
                  {pl.tracks ? <> &middot; {pl.tracks} tracks</> : null}
                  {pl.runtime ? <> &middot; {pl.runtime}</> : null}
                </div>
                {pl.description && (
                  <p style={{ margin: "0 0 4px 0", color: "#4a3f34", fontSize: "0.85rem", lineHeight: 1.5, fontFamily: FONT_BODY }}>
                    {pl.description}
                  </p>
                )}
                {pl.moodVibe && (
                  <p style={{ margin: "0 0 4px 0", color: HD.warmGray, fontSize: "0.8rem", fontStyle: "italic" }}>
                    {pl.moodVibe}
                  </p>
                )}
                {pl.tags && pl.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                    {pl.tags.slice(0, 12).map(t => (
                      <span key={t} style={{
                        background: HD.cream, border: `1px solid ${HD.rule}`, borderRadius: "3px",
                        padding: "1px 6px", fontSize: "0.7rem", color: HD.warmGray,
                      }}>{t}</span>
                    ))}
                    {pl.tags.length > 12 && (
                      <span style={{ fontSize: "0.7rem", color: HD.warmGray }}>+{pl.tags.length - 12} more</span>
                    )}
                  </div>
                )}
                {(pl.spotifyLink || pl.appleMusicLink || pl.tidalLink || pl.link) && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                    {pl.spotifyLink && <a href={pl.spotifyLink} target="_blank" rel="noreferrer" style={{ color: HD.amber, fontSize: "0.8rem" }}>Spotify</a>}
                    {pl.appleMusicLink && <a href={pl.appleMusicLink} target="_blank" rel="noreferrer" style={{ color: HD.amber, fontSize: "0.8rem" }}>Apple Music</a>}
                    {pl.tidalLink && <a href={pl.tidalLink} target="_blank" rel="noreferrer" style={{ color: HD.amber, fontSize: "0.8rem" }}>TIDAL</a>}
                    {!pl.spotifyLink && !pl.appleMusicLink && !pl.tidalLink && pl.link && (
                      <a href={pl.link} target="_blank" rel="noreferrer" style={{ color: HD.amber, fontSize: "0.8rem" }}>Link</a>
                    )}
                  </div>
                )}
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600,
                fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0,
                marginLeft: "12px",
                background: pl.status === "approved" ? "#e8f5e8" : pl.status === "rejected" ? "#fde8e8" : "#fff8e8",
                color: pl.status === "approved" ? "#2E8B57" : pl.status === "rejected" ? "#c53030" : "#b8860b",
              }}>
                {pl.status}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: `1px solid ${HD.rule}`, paddingTop: "10px" }}>
              {pl.status === "pending" && (
                <>
                  <button onClick={() => handleAction("approve", pl.id)}
                    disabled={actionLoading === pl.id + "approve"}
                    style={{
                      background: "#2E8B57", color: "#fff", border: "none", borderRadius: "4px",
                      padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                      fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                    {actionLoading === pl.id + "approve" ? "..." : "Approve"}
                  </button>
                  <button onClick={() => handleAction("reject", pl.id)}
                    disabled={actionLoading === pl.id + "reject"}
                    style={{
                      background: "#c53030", color: "#fff", border: "none", borderRadius: "4px",
                      padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                      fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                    {actionLoading === pl.id + "reject" ? "..." : "Reject"}
                  </button>
                </>
              )}
              {pl.status === "rejected" && (
                <button onClick={() => handleAction("approve", pl.id)}
                  disabled={actionLoading === pl.id + "approve"}
                  style={{
                    background: "#2E8B57", color: "#fff", border: "none", borderRadius: "4px",
                    padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                  {actionLoading === pl.id + "approve" ? "..." : "Approve"}
                </button>
              )}
              {(pl.status === "approved" || pl.status === "rejected") && (
                <button onClick={() => handleAction("revert", pl.id)}
                  disabled={actionLoading === pl.id + "revert"}
                  style={{
                    background: "#b8860b", color: "#fff", border: "none", borderRadius: "4px",
                    padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                  {actionLoading === pl.id + "revert" ? "..." : "Back to Review"}
                </button>
              )}
              <button onClick={() => startEdit(pl)}
                style={{
                  background: "transparent", color: HD.warmGray, border: `1px solid ${HD.rule}`,
                  borderRadius: "4px", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                Edit
              </button>
              {confirmDeleteId === pl.id ? (
                <>
                  <span style={{ fontSize: "0.75rem", color: "#c53030", fontFamily: FONT_NAV, alignSelf: "center" }}>
                    Delete this playlist?
                  </span>
                  <button onClick={() => { handleAction("delete", pl.id); setConfirmDeleteId(null); }}
                    disabled={actionLoading === pl.id + "delete"}
                    style={{
                      background: "#c53030", color: "#fff", border: "none", borderRadius: "4px",
                      padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                      fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                    {actionLoading === pl.id + "delete" ? "..." : "Yes, Delete"}
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)}
                    style={{
                      background: "transparent", color: HD.warmGray, border: `1px solid ${HD.rule}`,
                      borderRadius: "4px", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer",
                      fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setConfirmDeleteId(pl.id)}
                  style={{
                    background: "transparent", color: "#c53030", border: `1px solid #e8c0c0`,
                    borderRadius: "4px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT_NAV, textTransform: "uppercase", letterSpacing: "0.05em",
                    marginLeft: "auto",
                  }}>
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      {error && (
        <div style={{
          background: "#fff0f0", border: "1px solid #d4b8b8", borderRadius: "8px",
          padding: "12px 20px", marginBottom: "16px",
          fontSize: "0.85rem", color: "#5a3a3a",
        }}>
          {error}
        </div>
      )}

      {/* Pending */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, color: HD.black, margin: "0 0 12px 0" }}>
          Pending Review ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p style={{ color: HD.warmGray, fontSize: "0.9rem" }}>No playlists waiting for review.</p>
        ) : (
          pending.map(renderPlaylistAdmin)
        )}
      </div>

      {/* Approved */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, color: HD.black, margin: "0 0 12px 0" }}>
          Approved ({approved.length})
        </h3>
        {approved.map(renderPlaylistAdmin)}
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h3 style={{ fontFamily: FONT_DISPLAY, color: HD.black, margin: "0 0 12px 0" }}>
            Rejected ({rejected.length})
          </h3>
          {rejected.map(renderPlaylistAdmin)}
        </div>
      )}
    </div>
  );
}

// ─── INVALID INVITE SCREEN ─────────────────────────────────────────────────

function InvalidInvite() {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <h2 style={{ fontFamily: FONT_DISPLAY, color: HD.black, margin: "0 0 12px 0" }}>
        Invite required
      </h2>
      <p style={{ color: HD.warmGray, fontFamily: FONT_BODY, fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto" }}>
        Playlist submissions are invite-only. If you have an invite link, make sure you're using the full URL.
      </p>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function HighDivePlaylistDB() {
  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get("key") || "";
  const adminPassword = params.get("admin") || "";

  const [view, setView] = useState(adminPassword ? "admin" : "search");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [inviteValid, setInviteValid] = useState(null); // null = unchecked, true/false

  // Fetch playlists on mount and when view changes
  const loadPlaylists = useCallback(async () => {
    try {
      const data = await fetchPlaylists(adminPassword || null);
      setPlaylists(data);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // If invite token present, validate on mount
  useEffect(() => {
    if (inviteToken) {
      setInviteValid(true); // We'll validate server-side on submit
    }
  }, [inviteToken]);

  // Determine available views
  const isAdmin = !!adminPassword;
  const hasInvite = !!inviteToken;

  // Auto-switch to curate view if invite token present
  useEffect(() => {
    if (hasInvite && !isAdmin) {
      setView("curate");
    }
  }, [hasInvite, isAdmin]);

  const approvedPlaylists = isAdmin ? playlists.filter(p => p.status === "approved") : playlists;

  return (
    <div style={{
      maxWidth: "900px", margin: "0 auto", padding: "24px",
      fontFamily: FONT_BODY,
      color: HD.black, minHeight: "100vh", background: HD.cream,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ margin: "0 auto 6px auto", maxWidth: "220px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 269 110" fill="none" style={{ width: "100%", height: "auto" }}>
            <g clipPath="url(#clip0_10208_1050)"><path d="M120.304 2.05616C120.105 2.20633 119.694 3.07653 119.404 3.96214C118.825 5.7218 116.135 15.9448 112.996 28.3163C111.906 32.6096 109.772 40.9035 108.248 46.7793L105.479 57.4489L102.85 59.8978C98.3422 64.0987 88.5198 73.0779 88.4741 73.0433C88.4055 72.9894 89.2818 69.5124 93.7625 52.0275C98.487 33.5953 99.6186 28.9978 99.611 28.2355C99.5996 26.9802 97.6297 26.341 96.6505 27.2728C96.2048 27.7002 95.6028 29.4368 94.7226 32.8406C94.4712 33.8109 94.1702 34.6157 94.0597 34.6157C93.7777 34.6157 91.9565 33.6839 89.48 32.2746C88.295 31.5969 86.6833 30.7306 85.8832 30.3417L84.4316 29.6332L82.5646 30.5881C80.5758 31.6046 77.2115 33.6261 76.4037 34.2884C75.8017 34.7812 75.7598 34.9276 71.8545 50.0445C70.1933 56.4786 68.7683 61.8461 68.6883 61.9847C68.3111 62.6239 53.4975 75.9966 53.1622 75.9966C52.7393 75.9966 52.945 74.1869 53.7451 70.8678C54.1947 68.9964 55.875 62.3005 57.479 55.9934C59.0831 49.6825 61.0986 41.5966 61.9635 38.0233L63.5332 31.5276L62.8474 30.9154C62.295 30.4225 62.0168 30.3263 61.4301 30.4302C60.508 30.5894 59.1643 34.0368 57.399 40.7726C55.4558 48.1847 51.821 62.5893 49.7902 70.9371L48.3691 76.7705L49.7636 78.045C50.5218 78.7381 51.661 79.6545 52.263 80.0511C53.326 80.7558 53.3908 80.7712 53.9775 80.4516C54.6519 80.0858 58.6297 76.6165 62.7141 72.8315C66.0098 69.7781 66.7947 69.1043 66.7871 69.3353C66.7871 69.4392 66.5965 70.3249 66.3718 71.3144C65.6059 74.6528 65.7507 75.111 68.1854 77.0401C70.4638 78.8459 70.3152 78.8382 73.1956 77.3635C74.5825 76.655 77.5544 75.0455 79.8252 73.771C82.096 72.5004 84.142 71.3953 84.3859 71.3144C84.9002 71.1412 84.9345 70.9217 83.7915 75.2727L83.0333 78.1605L78.0192 82.7811C70.921 89.323 65.4116 95.4838 65.4192 96.173C65.4269 96.9469 70.7457 103.154 75.2416 108.098C77.2648 110.323 77.8249 110.493 78.686 109.141C79.4213 107.99 79.6118 107.366 82.0503 98.0443C83.2505 93.4661 85.4451 84.5177 85.8566 82.9544L86.6071 80.1089L91.9032 75.2419C99.7062 68.0723 103.36 64.784 103.436 64.861C103.478 64.8995 103.09 66.7401 102.583 68.9233C102.076 71.1103 101.657 73.0895 101.661 73.3051C101.665 73.5207 101.908 73.9404 102.198 74.2254C102.895 74.9185 104.046 74.9377 104.656 74.2677C105.318 73.5323 105.456 73.0279 113.583 41.5003L114.364 38.47L115.941 37.234C116.81 36.5524 119.705 34.4154 122.38 32.4825L127.242 28.967L128.122 29.4445C129.638 30.2685 129.718 29.7487 125.405 46.6984C122.376 58.5963 120.231 67.514 120.235 68.2032C120.243 68.9464 124.117 72.4195 124.929 72.408C125.775 72.3964 127.463 70.9486 137.491 61.619C143.758 55.7855 144.284 55.2233 144.277 54.3108C144.269 53.5484 143.427 52.6089 142.756 52.6166C141.823 52.6243 140.688 53.5484 133.083 60.4869C126.552 66.4474 125.363 67.4447 124.788 67.4486C124.422 67.4486 124.278 67.333 124.278 67.0289C124.278 66.7978 125.916 60.1943 127.924 52.3586C132.439 34.7312 133.624 29.9027 133.616 29.1018C133.608 28.2509 132.995 27.681 130.808 26.5027C127.947 24.9626 127.287 24.7469 126.461 25.1012C126.08 25.2629 123.584 26.9109 120.909 28.7591C117.85 30.873 116.09 31.9743 116.158 31.7278C116.737 29.6255 122.266 7.40445 122.643 5.66789C123.245 2.88401 123.245 2.93407 122.62 2.31414C122.026 1.72117 120.906 1.59796 120.296 2.06001L120.304 2.05616ZM89.3161 36.7103C93.0195 38.9551 93.0995 39.0129 93.0081 39.4788C92.8786 40.1488 87.0986 62.674 86.6414 64.2835C86.2719 65.5811 86.1576 65.7467 85.3231 66.1856C84.8202 66.4513 81.3911 68.3842 77.6992 70.4827L70.9896 74.3024L70.5095 73.8519C70.2428 73.6054 70.0256 73.2474 70.0256 73.0548C70.0256 72.6467 74.552 54.8498 77.1886 44.9118C78.183 41.1576 79.0441 37.8732 79.0975 37.6113C79.2346 36.9567 79.5966 36.6641 82.1303 35.1586L84.3401 33.8456L85.7499 34.6272C86.5309 35.0585 88.1236 35.9903 89.3085 36.7103H89.3161ZM78.7622 95.4145C77.802 99.084 76.9676 102.388 76.9067 102.777C76.8419 103.169 76.6819 103.477 76.5447 103.477C76.3161 103.477 72.205 99.1648 70.6657 97.1395L70.0447 96.3232L70.6695 95.684C71.1153 95.2296 81.174 84.999 81.3568 84.8565C81.3683 84.8488 79.7223 91.745 78.7622 95.4145Z" fill={HD.black}/><path d="M51.2152 9.90339C50.5675 10.1729 50.2475 11.1894 47.6109 21.3778C44.1513 34.7389 42.2539 41.7737 42.0558 41.9777C41.7129 42.332 24.9828 46.1054 24.758 45.8783C24.7122 45.832 26.0839 39.86 27.8022 32.6019C29.5206 25.3437 30.9265 19.1214 30.9227 18.771C30.9189 18.0818 29.9816 16.5955 28.5223 14.9629L27.6079 13.9425L26.4077 14.0927C24.0226 14.393 6.82769 17.9085 3.21191 18.8326C0.365773 19.5603 -0.342904 20.2034 0.140977 21.6242C0.548657 22.8217 1.04397 22.9449 3.62721 22.4982C4.83501 22.2903 10.3482 21.1698 15.8576 20.0224L25.8896 17.9278L26.3811 18.4091C26.6706 18.694 26.8764 19.1445 26.8764 19.518C26.8764 19.8645 25.6114 25.3206 24.0607 31.6277C19.3934 50.6143 10.2872 88.9149 10.1615 90.0931C10.051 91.1019 10.0853 91.2213 10.634 91.6487C11.3503 92.207 12.4628 92.2417 12.9238 91.718C13.583 90.971 13.5677 91.0326 18.8066 69.6741C20.9364 60.9952 22.8682 53.1287 23.0968 52.2123C23.474 50.6875 23.5692 50.5219 24.1826 50.3178C25.4819 49.8789 39.8307 46.7138 40.547 46.7061C41.0385 46.7023 41.2404 45.8166 36.8436 63.2592C33.8336 75.2034 32.4747 81.4078 32.7668 81.8724C32.9497 82.1496 33.4526 82.4962 33.8603 82.6309C35.0376 83.016 35.5443 82.5501 36.1654 80.5055C37.5484 75.9504 49.0511 31.5122 52.423 17.6967C53.7451 12.2753 53.9433 11.2356 53.7299 10.7312C53.3489 9.81868 52.2744 9.46058 51.219 9.90339H51.2152Z" fill={HD.black}/><path d="M63.8076 18.9289C63.4951 19.2023 63.1027 19.7144 62.9313 20.0648C62.4512 21.0543 61.5291 24.7431 61.5368 25.6325C61.5444 26.7184 62.3445 27.3614 63.5637 27.2651C64.3638 27.2035 64.4782 27.115 64.8935 26.2255C65.5602 24.8008 66.246 21.6935 66.1622 20.4729C66.0974 19.5257 66.006 19.3486 65.3545 18.9212C64.7677 18.5387 64.2521 18.5413 63.8076 18.9289Z" fill={HD.black}/><path d="M182.915 0.146324C177.181 1.19365 150.506 7.01555 148.887 7.57387C147.851 7.93196 147.809 7.97816 147.751 8.80986C147.664 10.0651 148.312 10.8429 149.443 10.8352C150.4 10.8275 154.038 10.119 168.536 7.11181C174.167 5.94512 179.962 4.77458 181.406 4.5166C184.416 3.97753 184.66 4.04684 184.671 5.43301C184.679 6.42258 183.002 13.7808 178.96 30.4995C173.15 54.5187 170.963 63.3055 170.669 63.7752C170.155 64.6031 154.053 75.4075 153.326 75.4152C153.154 75.4152 152.834 75.2342 152.651 75.0301C152.327 74.6682 152.514 73.7749 155.303 62.416C163.998 26.9763 167.023 14.5201 167.354 12.7912C167.682 11.0816 167.686 10.8391 167.389 10.3231C166.996 9.63386 166.177 9.29887 165.385 9.50295C164.344 9.77248 164.367 9.68777 158.709 32.5326C155.174 46.7985 149.893 68.492 148.826 73.128L148.144 76.0967L149.108 77.0863C149.641 77.633 150.739 78.5456 151.558 79.1232L153.044 80.1705L154.24 79.4812C156.225 78.3377 164.737 72.8392 169.313 69.7434C172.696 67.4563 173.675 66.6862 173.923 66.1163C174.323 65.196 175.154 62.031 177.969 50.6913C183.391 28.8554 188.958 5.56007 188.95 4.73607C188.942 3.89282 188.34 2.8686 186.969 1.37847C186.105 0.438959 185.304 -0.0179623 184.565 0.00770741C183.955 0.0308102 183.216 0.0924176 182.926 0.142474L182.915 0.146324Z" fill={HD.black}/><path d="M200.011 7.14261C199.813 7.20037 199.409 7.66243 199.127 8.15529C198.548 9.17181 197.549 12.9222 197.561 14.0542C197.568 14.9783 198.38 15.8601 199.222 15.8524C200.487 15.8408 201.291 14.3969 202.118 10.6427C202.548 8.6828 202.51 8.31701 201.798 7.60082C201.196 6.99245 200.845 6.90389 200.011 7.14261Z" fill={HD.black}/><path d="M253.299 12.7181C252.647 13.0723 250.483 14.832 247.45 17.4811L245.488 19.1945L244.875 21.2892C244.535 22.4443 244.105 24.0461 243.914 24.8663C243.632 26.083 243.472 26.3911 243.023 26.5643C242.192 26.8916 232.899 29.8488 232.705 29.8488C232.404 29.8488 232.492 29.3559 233.787 23.7496C235.585 15.9563 235.593 15.4634 233.955 14.7896C233.105 14.4392 232.564 14.6664 232.122 15.552C231.764 16.2682 226.883 35.5937 223.725 48.7892C222.787 52.7051 222.768 52.7359 220.212 54.4686C213.83 58.7927 208.096 62.2388 207.28 62.2388C206.518 62.2388 206.374 61.8461 206.675 60.5677C206.808 59.9902 206.953 59.3086 207.002 59.0237C207.052 58.7388 207.318 57.6838 207.608 56.6518C208.884 52.0736 216.927 20.1687 217.175 18.7132C217.293 18.0124 217.236 17.87 216.63 17.3656C215.811 16.6802 214.859 16.6263 214.268 17.2347C214.043 17.4657 213.677 18.3089 213.441 19.1329C212.748 21.5703 209.883 32.3939 207.52 41.4849L205.299 50.0406L203.973 51.2458C203.245 51.9081 199.759 55.0962 196.22 58.3345C192.68 61.5727 189.643 64.218 189.464 64.2218C189.285 64.2257 189.034 64.0601 188.916 63.8753C188.672 63.498 188.836 62.828 194.143 42.1471C198.018 27.0533 199.557 20.8502 199.553 20.3343C199.55 19.7336 198.464 18.8827 197.709 18.8865C196.429 18.8981 196.246 19.2677 194.684 25.0626C189.735 43.4139 184.698 63.4479 184.706 64.7339C184.713 65.4925 187.315 68.0761 188.687 68.6768C189.792 69.162 189.994 69.0965 191.674 67.6757C192.535 66.948 200.392 59.8477 202.899 57.5297C203.444 57.0253 203.493 57.0138 203.375 57.4219C203.303 57.6722 203.013 59.0314 202.727 60.4522L202.209 63.0282L204.046 64.7725C205.051 65.7274 206.172 66.6361 206.526 66.7785C207.113 67.0173 207.292 66.9749 208.507 66.328C211.441 64.7609 219.816 59.5089 224.212 56.4824L226.034 55.2272L226.788 52.3393C227.542 49.4515 230.838 36.2636 231.044 35.2895C231.147 34.8005 231.939 34.323 233.258 33.9572C233.345 33.9341 235.269 33.2718 237.521 32.4902C239.777 31.7085 241.788 31.0694 241.99 31.0655C242.329 31.0655 242.329 31.1656 241.952 32.5287C241.282 34.9545 237.289 50.7953 236.241 55.1887L235.262 59.2894L236.789 60.7372C237.632 61.5342 238.717 62.4391 239.209 62.7433L240.1 63.3016L242.699 62.1079C249.111 59.1585 265.887 50.8338 267.674 49.7326C268.992 48.9201 269.29 48.227 268.779 47.1643C268.341 46.2517 267.602 46.0053 266.508 46.4096C265.266 46.8678 261.067 48.8854 250.498 54.099L240.619 58.9737L239.994 58.3614L239.369 57.7492L240.527 53.5407C241.163 51.2304 241.899 48.9702 242.158 48.5274C242.577 47.815 247.705 43.079 259.475 32.5402C263.681 28.7745 263.407 29.2442 264.9 23.2029C265.998 18.771 266.272 17.2963 266.1 16.7726C265.906 16.1758 264.432 15.4442 261.288 14.3815C258.572 13.4651 254.685 12.3754 254.144 12.3792C254.011 12.3792 253.638 12.5255 253.314 12.6988L253.299 12.7181ZM257.894 17.3271C261.65 18.6478 261.73 18.6901 261.738 19.4179C261.742 20.1379 260.412 25.2937 259.917 26.4681C259.642 27.1226 257.791 28.9016 251.702 34.3615C247.374 38.2428 243.819 41.3809 243.789 41.3462C243.712 41.2692 247.058 27.8619 247.976 24.5621C248.387 23.0758 248.845 21.7127 248.989 21.5279C249.53 20.8464 254.594 16.2759 254.811 16.2759C254.868 16.2759 256.259 16.7495 257.894 17.3232V17.3271Z" fill={HD.black}/><path d="M113.651 87.5672V99.3997H110.79V94.8022H104.191V99.3997H101.345V87.5672H104.191V92.1377H110.79V87.5672H113.651Z" fill={HD.black}/><path d="M122.795 87.5672H119.877V99.4035H122.795V87.5672Z" fill={HD.black}/><path d="M131.852 90.097V92.2417H139.358V94.8446H131.852V99.3997H128.991V87.5672H139.712V90.097H131.852Z" fill={HD.black}/><path d="M148.022 87.5672H145.103V99.4035H148.022V87.5672Z" fill={HD.black}/><path d="M174.235 96.8699V99.3997H163.895V87.5672H166.768V96.8699H174.235Z" fill={HD.black}/><path d="M190.432 89.3808C189.156 87.9792 187.323 87.3285 184.66 87.3285C181.997 87.3285 180.21 87.9985 178.884 89.4963C178.019 90.4743 177.596 91.7527 177.596 93.4161C177.596 95.0795 178.068 96.5388 178.994 97.563C180.217 98.8953 182.122 99.5768 184.66 99.5768C187.335 99.5768 189.327 98.8645 190.421 97.5245C191.286 96.4964 191.716 95.118 191.716 93.4161C191.716 91.6102 191.32 90.3627 190.432 89.3808ZM188.062 95.9651C187.67 96.3655 187.224 96.6505 186.668 96.8353C186.115 97.024 185.464 97.1087 184.66 97.1087C183.189 97.1087 182.218 96.8006 181.421 96.0921C180.819 95.5608 180.522 94.6752 180.522 93.4661C180.522 92.4265 180.789 91.5255 181.257 90.9941C181.962 90.224 183.102 89.839 184.645 89.839C186.188 89.839 187.235 90.1624 188.081 90.971C188.554 91.4254 188.817 92.3148 188.817 93.47C188.817 94.2593 188.683 95.3375 188.058 95.9728L188.062 95.9651Z" fill={HD.black}/><path d="M208.858 87.5672V94.9909C208.858 97.9403 206.625 99.5652 202.567 99.5652C198.509 99.5652 196.372 97.8441 196.372 94.7252V87.5672H199.26V94.7676C199.26 96.2654 200.51 97.124 202.682 97.124C204.853 97.124 206.004 96.2423 206.004 94.7676V87.5672H208.862H208.858Z" fill={HD.black}/><path d="M226.761 87.5672V99.3997H223.831L217.438 91.5678V99.3997H214.66V87.5672H217.747L223.919 95.1103L224.01 95.2219V87.5672H226.761Z" fill={HD.black}/><path d="M245.309 99.0647V99.3958H242.836L242.764 98.1945L242.684 98.2638C241.697 99.134 240.249 99.573 238.378 99.573C236.073 99.573 234.141 98.8029 233.094 97.4629C232.377 96.5195 231.985 95.1103 231.985 93.4892C231.985 91.8682 232.328 90.663 233.094 89.6542C233.886 88.6145 235.536 87.3708 238.858 87.3708C241.838 87.3708 243.827 88.2796 244.76 90.0777C245 90.5205 245.145 90.998 245.206 91.4831H242.367C242.28 91.2444 242.112 90.9787 241.922 90.7824C241.655 90.4974 240.832 89.8313 238.946 89.8313C237.353 89.8313 236.226 90.2086 235.585 90.9556C235.117 91.4985 234.9 92.3071 234.9 93.4892C234.9 94.6097 235.105 95.3798 235.563 95.9882C236.168 96.7082 237.346 97.1202 238.801 97.1202C240.257 97.1202 241.365 96.7198 242.074 95.9689C242.299 95.7533 242.493 95.2681 242.577 94.9101L242.592 94.8446H238.115V92.4227H245.294V95.8688C245.294 97.0009 245.301 98.414 245.305 99.0686L245.309 99.0647Z" fill={HD.black}/><path d="M262.233 96.8699V99.3997H251.085V87.5672H262.134V90.097H253.904V92.2109H261.89V94.7252H253.904V96.8699H262.233Z" fill={HD.black}/></g>
            <defs><clipPath id="clip0_10208_1050"><rect width="269" height="110" fill="white"/></clipPath></defs>
          </svg>
        </div>
        <p style={{
          color: HD.warmGray, margin: "0 0 20px 0",
          fontFamily: FONT_NAV, fontSize: "0.7rem",
          textTransform: "uppercase", letterSpacing: "0.2em",
        }}>
          Playlist Library
        </p>

        {/* View toggle — only show when there's more than one view */}
        {(hasInvite || isAdmin) && (
          <div style={{
            display: "inline-flex", gap: "0", borderBottom: `2px solid ${HD.rule}`,
          }}>
            <button
              onClick={() => setView("search")}
              style={{
                background: "transparent",
                color: view === "search" ? HD.black : HD.warmGray,
                border: "none",
                borderBottom: view === "search" ? `2px solid ${HD.black}` : "2px solid transparent",
                padding: "8px 24px", fontSize: "0.75rem", cursor: "pointer",
                fontFamily: FONT_NAV, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.15em",
                marginBottom: "-2px",
              }}
            >
              Search
            </button>
            {(hasInvite || isAdmin) && (
              <button
                onClick={() => setView("curate")}
                style={{
                  background: "transparent",
                  color: view === "curate" ? HD.black : HD.warmGray,
                  border: "none",
                  borderBottom: view === "curate" ? `2px solid ${HD.black}` : "2px solid transparent",
                  padding: "8px 24px", fontSize: "0.75rem", cursor: "pointer",
                  fontFamily: FONT_NAV, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.15em",
                  marginBottom: "-2px",
                }}
              >
                Submit
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setView("admin")}
                style={{
                  background: "transparent",
                  color: view === "admin" ? HD.black : HD.warmGray,
                  border: "none",
                  borderBottom: view === "admin" ? `2px solid ${HD.black}` : "2px solid transparent",
                  padding: "8px 24px", fontSize: "0.75rem", cursor: "pointer",
                  fontFamily: FONT_NAV, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.15em",
                  marginBottom: "-2px",
                }}
              >
                Queue
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px", color: HD.warmGray, fontFamily: FONT_BODY }}>
          Loading playlists...
        </div>
      )}

      {loadError && (
        <div style={{
          background: "#fff0f0", border: "1px solid #d4b8b8", borderRadius: "8px",
          padding: "16px 20px", marginBottom: "16px", textAlign: "center",
          fontSize: "0.9rem", color: "#5a3a3a", fontFamily: FONT_BODY,
        }}>
          {loadError}
          <br />
          <button onClick={loadPlaylists} style={{
            marginTop: "8px", background: HD.walnut, color: "#fff", border: "none",
            borderRadius: "4px", padding: "6px 16px", fontSize: "0.85rem", cursor: "pointer",
          }}>
            Retry
          </button>
        </div>
      )}

      {/* Views */}
      {!loading && view === "search" && (
        <SearchView playlists={approvedPlaylists} />
      )}

      {!loading && view === "curate" && (
        (hasInvite || isAdmin)
          ? <CuratorView inviteToken={inviteToken || "hd-2026-invite"} onSubmitted={loadPlaylists} />
          : <InvalidInvite />
      )}

      {!loading && view === "admin" && isAdmin && (
        <AdminView playlists={playlists} adminPassword={adminPassword} onRefresh={loadPlaylists} />
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center", marginTop: "48px", padding: "24px",
        borderTop: `1px solid ${HD.rule}`, color: HD.warmGray,
        fontSize: "0.7rem", fontFamily: FONT_NAV,
        textTransform: "uppercase", letterSpacing: "0.15em",
      }}>
        High Dive HiFi Lounge &middot; {approvedPlaylists.length} playlists &middot; Birmingham, AL
      </div>
    </div>
  );
}
