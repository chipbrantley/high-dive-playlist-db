// Scheduled function: pings Supabase once a day to prevent free-tier auto-pause.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const handler = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/playlists?select=id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase ping failed: ${res.status} - ${text}`);
    }
    console.log("Keep-alive ping successful");
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Keep-alive ping error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

export const config = {
  schedule: "@daily",
};
