// Admin actions: approve, reject, update playlist details
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
    "Access-Control-Allow-Methods": "POST, PATCH, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Auth check
  const adminPw = event.headers["admin-password"];
  if (!adminPw || adminPw !== ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { action, id } = data;

    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Playlist ID required" }) };
    }

    if (action === "approve") {
      const result = await supabaseFetch(`playlists?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: data.reviewerName || "admin",
        }),
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, playlist: result[0] }) };
    }

    if (action === "reject") {
      const result = await supabaseFetch(`playlists?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: data.reviewerName || "admin",
        }),
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, playlist: result[0] }) };
    }

    if (action === "update") {
      const updates = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined) updates.description = data.description;
      if (data.moodVibe !== undefined) updates.mood_vibe = data.moodVibe;
      if (data.creditName !== undefined) updates.credit_name = data.creditName;
      if (data.spotifyLink !== undefined) updates.spotify_link = data.spotifyLink;
      if (data.appleMusicLink !== undefined) updates.apple_music_link = data.appleMusicLink;
      if (data.tidalLink !== undefined) updates.tidal_link = data.tidalLink;
      if (data.tracks !== undefined) updates.tracks = data.tracks ? parseInt(data.tracks) : null;
      if (data.runtime !== undefined) updates.runtime = data.runtime;
      if (data.tags !== undefined) updates.tags = data.tags;
      if (data.status !== undefined) updates.status = data.status;

      const result = await supabaseFetch(`playlists?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, playlist: result[0] }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
