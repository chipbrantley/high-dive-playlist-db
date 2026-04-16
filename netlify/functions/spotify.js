// Netlify serverless function: fetches Spotify playlist data and returns suggested tags
// Credentials are stored as Netlify environment variables (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)

const GENRE_MAP = {
  // Maps Spotify genre strings (often very specific) to our tag taxonomy
  // Spotify genres are lowercase, often hyphenated
  "jazz": ["jazz"],
  "soul": ["soul"],
  "funk": ["funk"],
  "rock": ["rock"],
  "indie": ["indie"],
  "electronic": ["electronic"],
  "ambient": ["ambient"],
  "hip hop": ["hip-hop"],
  "hip-hop": ["hip-hop"],
  "rap": ["hip-hop"],
  "r&b": ["R&B"],
  "rnb": ["R&B"],
  "folk": ["folk"],
  "country": ["country"],
  "classical": ["classical"],
  "reggae": ["reggae"],
  "dub": ["dub"],
  "blues": ["blues"],
  "punk": ["punk"],
  "new wave": ["new wave"],
  "disco": ["disco"],
  "house": ["house"],
  "afrobeat": ["afrobeat"],
  "bossa nova": ["bossa nova"],
  "psychedelic": ["psychedelic"],
  "shoegaze": ["shoegaze"],
  "trip hop": ["trip-hop"],
  "trip-hop": ["trip-hop"],
  "lo-fi": ["lo-fi"],
  "lofi": ["lo-fi"],
  "garage rock": ["garage rock"],
  "post-punk": ["post-punk"],
  "americana": ["Americana"],
  "gospel": ["gospel"],
  "latin": ["Latin"],
  "highlife": ["highlife"],
  "cumbia": ["cumbia"],
  "krautrock": ["krautrock"],
  "synthpop": ["synth-pop"],
  "synth-pop": ["synth-pop"],
  "dream pop": ["dream pop"],
  "singer-songwriter": ["singer-songwriter"],
  "ska": ["ska"],
  "tropicalia": ["tropicalia"],
  "exotica": ["exotica"],

  // Broader / compound Spotify genres mapped to our tags
  "indie rock": ["indie", "rock"],
  "indie pop": ["indie"],
  "indie folk": ["indie", "folk"],
  "alt-country": ["Americana", "country"],
  "alternative country": ["Americana", "country"],
  "alternative rock": ["rock", "indie"],
  "art rock": ["rock"],
  "progressive rock": ["rock"],
  "classic rock": ["rock"],
  "soft rock": ["rock"],
  "southern rock": ["rock", "Americana"],
  "folk rock": ["folk", "rock"],
  "country rock": ["country", "rock"],
  "acid rock": ["rock", "psychedelic"],
  "psychedelic rock": ["psychedelic", "rock"],
  "garage": ["garage rock"],
  "post punk": ["post-punk"],
  "new romantic": ["new wave", "synth-pop"],
  "synthwave": ["synth-pop", "electronic"],
  "electro": ["electronic"],
  "electronica": ["electronic"],
  "downtempo": ["electronic"],
  "chillwave": ["electronic", "dream pop"],
  "neo soul": ["soul", "R&B"],
  "neo-soul": ["soul", "R&B"],
  "contemporary r&b": ["R&B"],
  "quiet storm": ["R&B", "soul"],
  "smooth jazz": ["jazz"],
  "acid jazz": ["jazz", "funk"],
  "bebop": ["jazz"],
  "cool jazz": ["jazz"],
  "free jazz": ["jazz"],
  "latin jazz": ["jazz", "Latin"],
  "jazz fusion": ["jazz"],
  "afro-cuban jazz": ["jazz", "Latin"],
  "modern jazz": ["jazz"],
  "vocal jazz": ["jazz"],
  "bop": ["jazz"],
  "hard bop": ["jazz"],
  "deep house": ["house", "electronic"],
  "tech house": ["house", "electronic"],
  "afro house": ["house", "afrobeat"],
  "chicago house": ["house"],
  "reggaeton": ["Latin"],
  "salsa": ["Latin"],
  "samba": ["Latin", "bossa nova"],
  "mpb": ["Latin"],
  "afropop": ["afrobeat", "world"],
  "afrobeats": ["afrobeat"],
  "world music": ["world"],
  "roots": ["folk", "Americana"],
  "roots rock": ["rock", "Americana"],
  "bluegrass": ["folk", "country"],
  "chamber pop": ["classical", "indie"],
  "baroque pop": ["classical"],
  "post-rock": ["rock", "ambient"],
  "noise pop": ["indie", "shoegaze"],
  "power pop": ["rock", "indie"],
  "jangle pop": ["indie", "rock"],
  "c86": ["indie"],
  "twee pop": ["indie"],
  "bedroom pop": ["indie", "lo-fi"],
  "hyperpop": ["electronic"],
  "dancehall": ["reggae"],
  "dub reggae": ["reggae", "dub"],
  "roots reggae": ["reggae"],
  "lovers rock": ["reggae"],
  "delta blues": ["blues"],
  "electric blues": ["blues"],
  "chicago blues": ["blues"],
  "country blues": ["blues", "folk"],
  "punk rock": ["punk"],
  "hardcore punk": ["punk"],
  "pop punk": ["punk"],
  "post-hardcore": ["punk"],
  "emo": ["punk", "rock"],
  "grunge": ["rock"],
  "metal": ["rock"],
  "heavy metal": ["rock"],
  "experimental": ["electronic"],
  "avant-garde": ["electronic"],
  "noise": ["electronic"],
  "industrial": ["electronic"],
  "techno": ["electronic"],
  "trance": ["electronic"],
  "drum and bass": ["electronic"],
  "dubstep": ["electronic"],
  "idm": ["electronic"],
  "chanson": ["world"],
  "french pop": ["world"],
  "k-pop": ["world"],
  "j-pop": ["world"],
  "bollywood": ["world"],
};

function mapSpotifyGenres(spotifyGenres) {
  const tagCounts = {};

  for (const genre of spotifyGenres) {
    const lower = genre.toLowerCase();

    // Try exact match first
    if (GENRE_MAP[lower]) {
      for (const tag of GENRE_MAP[lower]) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
      continue;
    }

    // Try substring matching — if a Spotify genre contains one of our keys
    for (const [key, tags] of Object.entries(GENRE_MAP)) {
      if (lower.includes(key)) {
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 0.5;
        }
      }
    }
  }

  // Return tags sorted by frequency, with a minimum threshold
  return Object.entries(tagCounts)
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

function mapYearsToEras(years) {
  const eraCounts = {};

  for (const year of years) {
    let era;
    if (year < 1950) era = "pre-war";
    else if (year < 1960) era = "1950s";
    else if (year < 1970) era = "1960s";
    else if (year < 1980) era = "1970s";
    else if (year < 1990) era = "1980s";
    else if (year < 2000) era = "1990s";
    else if (year < 2010) era = "2000s";
    else if (year < 2020) era = "2010s";
    else era = "2020s";

    eraCounts[era] = (eraCounts[era] || 0) + 1;
  }

  const totalTracks = years.length;
  const eras = Object.entries(eraCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([era]) => era);

  // If tracks span 3+ decades, add "mixed era"
  if (eras.length >= 3) {
    eras.push("mixed era");
  }

  return eras;
}

async function getSpotifyToken(clientId, clientSecret) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getPlaylistFull(token, playlistId) {
  // Fetch the full playlist object — includes metadata and first page of tracks
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: { "Authorization": `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Spotify playlist fetch failed: ${response.status} - ${errText}`);
  }

  return await response.json();
}

async function getMoreTracks(token, nextUrl) {
  // Follow pagination for playlists with more than 100 tracks
  const allItems = [];
  let url = nextUrl;

  while (url) {
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) break; // Stop pagination on error, use what we have

    const data = await response.json();
    if (data.items) {
      allItems.push(...data.items);
    }
    url = data.next || null;
  }

  return allItems;
}

async function getArtistGenres(token, artistIds) {
  // Spotify allows up to 50 artists per request
  const genres = [];
  const chunks = [];
  for (let i = 0; i < artistIds.length; i += 50) {
    chunks.push(artistIds.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`,
      {
        headers: { "Authorization": `Bearer ${token}` },
      }
    );

    if (response.ok) {
      const data = await response.json();
      for (const artist of data.artists) {
        if (artist && artist.genres) {
          genres.push(...artist.genres);
        }
      }
    }
  }

  return genres;
}

function extractPlaylistId(url) {
  // Handle various Spotify URL formats
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
  const match = url.match(/playlist[/:]([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export async function handler(event) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { playlistUrl } = JSON.parse(event.body);

    if (!playlistUrl) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing playlistUrl" }) };
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Could not parse Spotify playlist URL" }) };
    }

    const { accessToken } = JSON.parse(event.body);

    let token;

    if (accessToken) {
      // Use the user's OAuth token (preferred — works with Development Mode apps)
      token = accessToken;
    } else {
      // Fall back to Client Credentials (requires approved app for track access)
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Spotify credentials not configured" }) };
      }

      token = await getSpotifyToken(clientId, clientSecret);
    }

    // Fetch full playlist (metadata + first page of tracks in one call)
    const playlist = await getPlaylistFull(token, playlistId);

    // Collect all track items — first page comes with the playlist object
    let trackItems = (playlist.tracks && playlist.tracks.items) ? playlist.tracks.items : [];

    // If there are more pages, follow pagination
    if (playlist.tracks && playlist.tracks.next) {
      const moreItems = await getMoreTracks(token, playlist.tracks.next);
      trackItems = trackItems.concat(moreItems);
    }

    // Extract artist IDs and release years
    const artistIdSet = new Set();
    const releaseYears = [];
    let totalDurationMs = 0;
    let trackCount = 0;

    for (const item of trackItems) {
      if (!item || !item.track) continue;
      trackCount++;
      totalDurationMs += item.track.duration_ms || 0;

      // Collect unique artist IDs
      if (item.track.artists) {
        for (const artist of item.track.artists) {
          if (artist && artist.id) artistIdSet.add(artist.id);
        }
      }

      // Extract release year
      if (item.track.album && item.track.album.release_date) {
        const year = parseInt(item.track.album.release_date.substring(0, 4));
        if (!isNaN(year)) releaseYears.push(year);
      }
    }

    // Fetch artist genres
    const allGenres = await getArtistGenres(token, [...artistIdSet]);

    // Map to our taxonomy
    const genreTags = mapSpotifyGenres(allGenres);
    const eraTags = mapYearsToEras(releaseYears);

    // Calculate runtime
    const totalMinutes = Math.round(totalDurationMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const runtime = hours > 0 ? `${hours}hr ${mins}min` : `${mins}min`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        playlistName: playlist.name || "",
        playlistDescription: playlist.description || "",
        trackCount: (playlist.tracks && playlist.tracks.total) || trackCount,
        runtime,
        suggestedTags: {
          genre: genreTags,
          era: eraTags,
        },
        rawGenres: [...new Set(allGenres)].sort(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
