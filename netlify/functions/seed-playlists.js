// One-time seed function — migrates hardcoded playlists into Supabase
// Call via: /.netlify/functions/seed-playlists with admin-password header
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  return res.json();
}

const SEED_PLAYLISTS = [
  {
    title: "I smoked too much pot and got lost in Joshua Tree",
    contact_name: "Chip", credit_name: "Chip",
    description: "Desert wandering music. Long instrumental passages, reverb for days, the kind of thing that sounds better when the sun is setting behind a rock formation and you're not entirely sure which direction the car is going.",
    spotify_link: "https://open.spotify.com/playlist/3NohUaZDQCLiQhrftFvfFC",
    tracks: 18, runtime: "1hr 35min",
    tags: ["psychedelic","rock","ambient","folk","1960s","1970s","2010s","mixed era","low energy","mid-tempo","downtempo","mixed tempo","slow build","afternoon","golden hour","late night","summer","autumn","sunny","overcast","first warm day","background-friendly","solo listening","sparse crowd","contemplative","dreamy","hazy","spacious","stoned","woozy","otherworldly","earthy","pastoral","cinematic","instrumental-heavy","deep cuts only","journey/arc","winds down"],
  },
  {
    title: "I had a dream last night about Molly Ringwald",
    contact_name: "Chip", credit_name: "Chip",
    description: "80s-adjacent but not the obvious hits. The B-sides and deep cuts from the Brat Pack era. Synths, longing, and the feeling of sitting in Saturday detention.",
    spotify_link: "https://open.spotify.com/playlist/5hbREUISxhJ0M1OUdTXIab",
    tracks: 22, runtime: "1hr 28min",
    tags: ["synth-pop","new wave","dream pop","indie","1980s","1990s","medium energy","mid-tempo","steady pulse","afternoon","evening","golden hour","autumn","winter","overcast","rainy day","conversation-friendly","intimate gathering","friends catching up","nostalgic","dreamy","wistful","cinematic","romantic","warm","whimsical","playful","mixed vocals","some recognizable","deep cuts only","steady energy"],
  },
  {
    title: "I'm going to go home and watch 50 Shades of Grey",
    contact_name: "Chip", credit_name: "Chip",
    description: "Music that gets you in the mood. Or at least reminds you what it's like to be in the mood.",
    spotify_link: "https://open.spotify.com/playlist/60dtM72l1eXLCwWMJo6NSo",
    tracks: 16, runtime: "1hr 12min",
    tags: ["R&B","electronic","trip-hop","soul","2000s","2010s","2020s","low energy","downtempo","simmering","evening","late night","after midnight","winter","autumn","rainy day","intimate gathering","date night","demands attention","sparse crowd","sultry","nocturnal","smoky","mysterious","warm","lush","raw","tender","vocal-forward","some recognizable","deep cuts only","slow build","pairs with wine","pairs with cocktails"],
  },
  {
    title: "Je veux danser plus tard",
    contact_name: "Chip", credit_name: "Chip",
    description: "French and French-adjacent. Serge and Jane, Air, Francoise Hardy, newer stuff too. The energy builds slowly — you'll want to dance eventually, but not yet.",
    spotify_link: "https://open.spotify.com/playlist/2ZS679Rsf6K4Y3qZpvj8IE",
    tracks: 20, runtime: "1hr 40min",
    tags: ["pop","electronic","chanson","world","bossa nova","synth-pop","1960s","1970s","2000s","2010s","mixed era","medium energy","mid-tempo","slow build","simmering","afternoon","golden hour","evening","spring","summer","sunny","first warm day","conversation-friendly","dinner service","bustling cafe","happy hour","sophisticated","urbane","playful","breezy","romantic","whimsical","warm","buoyant","tipsy","mixed vocals","some recognizable","deep cuts only","builds energy","pairs with wine","pairs with cocktails","pairs with food"],
  },
  {
    title: "Looking for something easy to cook for dinner in the Piggly Wiggly",
    contact_name: "Chip", credit_name: "Chip",
    description: "Wandering the aisles after work, no plan, no rush. Soft rock, country-soul, the kind of music that plays in your head when you're deciding between rotisserie chicken and pasta.",
    spotify_link: "https://open.spotify.com/playlist/5dyVFMM8Bjh1EGZoPtkiiz",
    tracks: 19, runtime: "1hr 22min",
    tags: ["Americana","soul","country","folk","singer-songwriter","soft rock","1970s","1990s","2000s","2010s","mixed era","low energy","medium energy","mid-tempo","downtempo","afternoon","evening","golden hour","weekday afternoon","autumn","winter","overcast","crisp air","conversation-friendly","background-friendly","post-work decompression","warm","cozy","wistful","pastoral","earthy","nostalgic","tender","whimsical","irreverent","vocal-forward","mixed vocals","some recognizable","steady energy","pairs with food","pairs with wine"],
  },
  {
    title: "The Only Living Boy in the High Dive",
    contact_name: "Chip", credit_name: "Chip",
    description: "Solo acoustic leanings, but not coffeehouse cliche. Maybe a little emo. Maybe a little twee, but introspective without being mopey. The kind of thing you'd want to hear alone in a beautiful room.",
    spotify_link: "https://open.spotify.com/playlist/32DXf6SJ5GdogFbZNvNtPk",
    tracks: 17, runtime: "1hr 15min",
    tags: ["folk","singer-songwriter","indie","Americana","classical","1960s","1970s","2000s","2010s","2020s","mixed era","very low energy","low energy","downtempo","languid","early morning","morning","late morning","afternoon","spring","autumn","overcast","rainy day","crisp air","quiet reading","solo listening","sparse crowd","working/studying","contemplative","wistful","tender","pastoral","spacious","warm","cerebral","meditative","earthy","vocal-forward","instrumental-heavy","deep cuts only","some recognizable","steady energy","winds down","pairs with coffee"],
  },
  {
    title: "Pleasant Jangle Happy Hour",
    contact_name: "Chip", credit_name: "Chip",
    description: "Bright, jangly guitars, upbeat but not aggressive. The Byrds meet Real Estate meet Big Star. Perfect for the 4-6pm window when the light is good and the first drinks are being poured.",
    tracks: 21, runtime: "1hr 30min",
    tags: ["indie","rock","garage rock","jangle pop","Americana","1960s","1980s","2000s","2010s","mixed era","medium energy","medium-high energy","mid-tempo","uptempo","steady pulse","afternoon","golden hour","happy hour","evening","spring","summer","first warm day","sunny","bustling cafe","happy hour","friends catching up","packed house","conversation-friendly","jangly","buoyant","breezy","playful","warm","sun-drenched","nostalgic","bright","irreverent","mixed vocals","some recognizable","steady energy","builds energy","pairs with cocktails"],
  },
  {
    title: "Dreampop Morning",
    contact_name: "Jackie Lo", credit_name: "Jackie Lo",
    description: "Great for mornings or end of the night, driving around with the windows down, or when you want to feel like a main character in a Sofia Coppola film. Beach House, Slowdive, Cocteau Twins, Air, Stereolab, Low, Yo La Tengo.",
    tracks: 20, runtime: "1hr 25min",
    tags: ["dream pop","shoegaze","indie","electronic","ambient","1990s","2000s","2010s","mixed era","low energy","downtempo","mid-tempo","languid","steady pulse","early morning","morning","late night","all day","spring","summer","autumn","sunny","overcast","background-friendly","solo listening","sparse crowd","conversation-friendly","dreamy","hazy","cinematic","contemplative","breezy","wistful","warm","lush","spacious","blissed-out","nostalgic","vocal-forward","mixed vocals","deep cuts only","some recognizable","steady energy","pairs with coffee"],
  },
  {
    title: "Dark Feminine Energy",
    contact_name: "Jackie Lo", credit_name: "Jackie Lo",
    description: "Feeling melancholy? Want to listen to women who are full of dark beauty and quiet rage? Would you be burned at the stake for your musical taste? Karen O, Mazzy Star, Warpaint, Babehoven, PJ Harvey, Japanese Breakfast, Wednesday, Portishead.",
    tracks: 18, runtime: "1hr 20min",
    tags: ["indie","rock","electronic","trip-hop","post-punk","dream pop","1990s","2000s","2010s","2020s","mixed era","low energy","medium energy","mid-tempo","simmering","slow build","morning","late night","after midnight","autumn","winter","overcast","rainy day","stormy","solo listening","demands attention","intimate gathering","sparse crowd","melancholic","gritty","raw","mysterious","nocturnal","sultry","angular","cool","smoky","cinematic","contemplative","tender","vocal-forward","deep cuts only","some recognizable","journey/arc","winds down"],
  },
  {
    title: "Highdivinwithsuaze",
    contact_name: "Suaze", credit_name: "Suaze",
    description: "Mellow, jazzy, and soulful.",
    tracks: 22, runtime: "1hr 30min",
    tags: ["jazz","soul","R&B","1960s","1970s","2000s","2010s","mixed era","low energy","medium energy","downtempo","mid-tempo","languid","morning","afternoon","golden hour","evening","dinner hour","late night","year-round","conversation-friendly","background-friendly","dinner service","happy hour","late night wind-down","warm","smoky","sophisticated","sultry","cool","lush","tender","vocal-forward","mixed vocals","some recognizable","steady energy","pairs with wine","pairs with cocktails"],
  },
  {
    title: "Dead Sunny Ski Slopes",
    contact_name: "Bart", credit_name: "Bart",
    description: "Upbeat, beautiful, americana rock.",
    tracks: 18, runtime: "1hr 10min",
    tags: ["Americana","rock","indie","folk","1970s","2000s","2010s","mixed era","medium energy","medium-high energy","uptempo","mid-tempo","steady pulse","late morning","brunch","midday","afternoon","spring","summer","sunny","first warm day","crisp air","bustling cafe","conversation-friendly","friends catching up","buoyant","sun-drenched","warm","breezy","earthy","jangly","playful","nostalgic","vocal-forward","mixed vocals","some recognizable","steady energy","builds energy"],
  },
  {
    title: "Cover to Cover",
    contact_name: "Bruce Lanier", credit_name: "Bruce Lanier",
    description: "Less-known covers of songs we all know — or the original versions of songs with better-known covers. Upbeat background music that is both familiar and unfamiliar. Typically dating back to the 60s and 70s, with a favorable bent toward R&B, soul & funk. Etta James covering the Eagles, Buddy Miles covering the Allman Brothers.",
    tracks: 24, runtime: "1hr 35min",
    tags: ["R&B","soul","funk","rock","blues","1960s","1970s","mixed era","medium energy","mid-tempo","uptempo","steady pulse","all day","brunch","afternoon","golden hour","evening","year-round","background-friendly","conversation-friendly","bustling cafe","dinner service","happy hour","friends catching up","warm","funky","playful","nostalgic","irreverent","buoyant","swaggering","vocal-forward","some recognizable","mostly recognizable","steady energy","pairs with food","pairs with cocktails"],
  },
  {
    title: "Reg's Coffee House",
    contact_name: "Scott Register", credit_name: "Scott Register",
    description: "New music in the singer-songwriter, alternative, folk vein. A curated Sunday morning radio show, now in playlist form — helping build your music library one song at a time since 1997.",
    tracks: 40, runtime: "2hr 45min",
    tags: ["singer-songwriter","folk","indie","Americana","rock","2010s","2020s","medium energy","mid-tempo","mixed tempo","steady pulse","morning","late morning","brunch","midday","afternoon","weekend morning","spring","autumn","year-round","background-friendly","conversation-friendly","working/studying","bustling cafe","Sunday morning","warm","earthy","contemplative","breezy","tender","wistful","nostalgic","vocal-forward","deep cuts only","some recognizable","steady energy","pairs with coffee"],
  },
  {
    title: "Worm Time in the City",
    contact_name: "Griffin", credit_name: "Griffin",
    description: "City vibes for sure. Happy and uplifting, a little weird but always ties back into a theme. Mainly a Japanese fusion playlist: Casiopea, Takanaka, Shigeo Sekito, Nucleus, Hiro Yanagida.",
    tracks: 16, runtime: "1hr 15min",
    tags: ["jazz","funk","electronic","world","1970s","1980s","mixed era","medium energy","medium-high energy","uptempo","mid-tempo","propulsive","brunch","midday","afternoon","summer","sunny","humid","bustling cafe","conversation-friendly","friends catching up","funky","buoyant","playful","urbane","sophisticated","warm","driving","whimsical","irreverent","instrumental-heavy","deep cuts only","builds energy","steady energy"],
  },
  {
    title: "Sunny Holler in the Mountains",
    contact_name: "Chase", credit_name: "Chase",
    description: "Driving through North Georgia into East Tennessee or West North Carolina at the turn of spring. Mandolin, banjo, guitar, and fiddle, along with stompin' and foot-tappin' percussion. Sierra Ferrell, Robert Plant, Larkin Poe, Matt Heckler, and the Lost Dog Street Band around a campfire between a cabin and a peaceful creek.",
    tracks: 20, runtime: "1hr 25min",
    tags: ["folk","Americana","country","singer-songwriter","2010s","2020s","mixed era","medium energy","mid-tempo","uptempo","mixed tempo","morning","midday","afternoon","golden hour","spring","autumn","crisp air","first warm day","sunny","conversation-friendly","intimate gathering","solo listening","earthy","warm","pastoral","nostalgic","tender","cozy","buoyant","raw","vocal-forward","deep cuts only","some recognizable","steady energy","pairs with coffee"],
  },
  {
    title: "Jazzy Breaks & Lo-Fi Vibes",
    contact_name: "DJ CraigHead", credit_name: "DJ CraigHead",
    description: "Music intended to be background ambiance or actively listened to. Think Brian Eno's Music for Airports — jazzy breaks and hip-hop lo-fi vibes. 40 years of DJ and musician experience distilled into atmosphere.",
    tracks: 22, runtime: "1hr 40min",
    tags: ["jazz","hip-hop","electronic","ambient","lo-fi","1990s","2000s","2010s","2020s","mixed era","low energy","downtempo","languid","steady pulse","morning","midday","afternoon","late night","all day","rainy day","overcast","year-round","background-friendly","working/studying","quiet reading","solo listening","conversation-friendly","hazy","contemplative","meditative","spacious","cool","cerebral","dreamy","smoky","instrumental-heavy","deep cuts only","steady energy","pairs with coffee"],
  },
];

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, admin-password",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const adminPw = event.headers["admin-password"];
  if (!adminPw || adminPw !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    // Check if playlists already exist
    const existing = await supabaseFetch("playlists?select=id&limit=1");
    if (existing.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Database already has playlists. Clear them first if you want to re-seed." }),
      };
    }

    // Insert all seed playlists as approved
    const toInsert = SEED_PLAYLISTS.map((p) => ({
      ...p,
      apple_music_link: "",
      tidal_link: "",
      mood_vibe: "",
      status: "approved",
    }));

    const result = await supabaseFetch("playlists", {
      method: "POST",
      body: JSON.stringify(toInsert),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, count: result.length }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
