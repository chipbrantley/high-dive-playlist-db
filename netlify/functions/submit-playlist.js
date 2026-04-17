// Submit a new playlist — requires a valid invite token
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

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
    const data = JSON.parse(event.body);

    // Validate invite token
    const tokens = await supabaseFetch(
      `invite_tokens?token=eq.${encodeURIComponent(data.inviteToken)}&active=eq.true`
    );
    if (!tokens || tokens.length === 0) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "Invalid or expired invite link" }),
      };
    }

    // Validate required fields
    if (!data.title || !data.contactName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Title and contact name are required" }),
      };
    }

    // Insert playlist
    const playlist = await supabaseFetch("playlists", {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        contact_name: data.contactName,
        credit_name: data.creditName || null,
        description: data.description || "",
        mood_vibe: data.moodVibe || "",
        spotify_link: data.spotifyLink || "",
        apple_music_link: data.appleMusicLink || "",
        tidal_link: data.tidalLink || "",
        tracks: data.tracks ? parseInt(data.tracks) : null,
        runtime: data.runtime || "",
        tags: data.tags || [],
        status: "pending",
      }),
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, id: playlist[0]?.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
