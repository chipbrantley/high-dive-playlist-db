// Fetch playlists from Supabase
// Public: returns only approved playlists
// Admin (with admin-password header): returns all playlists
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

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, admin-password",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const adminPw = event.headers["admin-password"];
    const isAdmin = adminPw && adminPw === ADMIN_PASSWORD;

    let query = "playlists?order=submitted_at.desc";
    if (!isAdmin) {
      query += "&status=eq.approved";
    }

    const playlists = await supabaseFetch(query);

    // Map to frontend format
    const mapped = playlists.map((p) => ({
      id: p.id,
      title: p.title,
      curator: p.credit_name || p.contact_name,
      contactName: isAdmin ? p.contact_name : undefined,
      description: p.description || "",
      moodVibe: p.mood_vibe || "",
      link: p.spotify_link || p.apple_music_link || p.tidal_link || "",
      spotifyLink: p.spotify_link || "",
      appleMusicLink: p.apple_music_link || "",
      tidalLink: p.tidal_link || "",
      tracks: p.tracks,
      runtime: p.runtime || "",
      tags: p.tags || [],
      status: isAdmin ? p.status : undefined,
      submittedAt: p.submitted_at,
      reviewedAt: isAdmin ? p.reviewed_at : undefined,
      reviewedBy: isAdmin ? p.reviewed_by : undefined,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mapped),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
