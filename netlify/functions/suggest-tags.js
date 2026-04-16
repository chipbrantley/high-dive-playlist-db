// Netlify serverless function: sends playlist title + description to Claude
// and returns suggested tags across all categories.
// Requires ANTHROPIC_API_KEY as a Netlify environment variable.

const TAG_TAXONOMY = {
  genre: [
    "jazz","soul","funk","rock","indie","electronic","ambient","hip-hop",
    "R&B","folk","country","classical","world","reggae","dub","blues",
    "punk","new wave","disco","house","afrobeat","bossa nova","psychedelic",
    "shoegaze","trip-hop","lo-fi","garage rock","post-punk","Americana",
    "gospel","Latin","highlife","cumbia","krautrock","synth-pop","dream pop",
    "singer-songwriter","ska","tropicalia","exotica","Library music"
  ],
  era: [
    "1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s",
    "pre-war","timeless","mixed era"
  ],
  energy: [
    "very low energy","low energy","medium energy","medium-high energy",
    "high energy","downtempo","mid-tempo","uptempo","mixed tempo",
    "slow build","crescendo","steady pulse","languid","propulsive","simmering"
  ],
  timeOfDay: [
    "early morning","morning","late morning","brunch","midday","afternoon",
    "golden hour","evening","dinner hour","late night","after midnight",
    "all day","weekend morning","weekday afternoon"
  ],
  season: [
    "spring","summer","autumn","winter","rainy day","sunny","overcast",
    "crisp air","humid","snowy","stormy","foggy","first warm day",
    "Indian summer","dead of winter","year-round"
  ],
  room: [
    "conversation-friendly","background-friendly","demands attention",
    "intimate gathering","bustling cafe","quiet reading","dinner service",
    "happy hour","late night wind-down","Sunday morning","working/studying",
    "sparse crowd","packed house","date night","solo listening",
    "friends catching up","post-work decompression"
  ],
  vibe: [
    "cozy","wistful","cerebral","sultry","jangly","woozy","sun-drenched",
    "nocturnal","cinematic","funky","pastoral","urbane","breezy",
    "melancholic","euphoric","contemplative","playful","dreamy","gritty",
    "sophisticated","raw","lush","angular","warm","cool","smoky","hazy",
    "buoyant","romantic","irreverent","nostalgic","mysterious","driving",
    "blissed-out","tender","swaggering","meditative","whimsical","spacious",
    "earthy","otherworldly","stoned","caffeinated","tipsy"
  ],
  practical: [
    "instrumental-heavy","vocal-forward","mixed vocals","deep cuts only",
    "some recognizable","mostly recognizable","explicit content","clean",
    "builds energy","steady energy","winds down","journey/arc",
    "great openers","great closers","pairs with coffee","pairs with wine",
    "pairs with cocktails","pairs with food"
  ],
};

export async function handler(event) {
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
    const { title, description } = JSON.parse(event.body);

    if (!title) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing playlist title" }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Anthropic API key not configured" }) };
    }

    const systemPrompt = `You are a music expert tagging playlists for the High Dive, a hi-fi listening lounge and cafe in Birmingham, Alabama. Given a playlist title and description, suggest appropriate tags from the taxonomy below. Be generous with suggestions — it's better to over-suggest and let the curator remove tags than to miss relevant ones.

TAG TAXONOMY (only suggest tags from these lists):
${Object.entries(TAG_TAXONOMY).map(([cat, tags]) => `${cat}: ${tags.join(", ")}`).join("\n")}

IMPORTANT GUIDELINES:
- For genre/era: if the description doesn't specify, make reasonable inferences from the vibe and referenced artists. If the playlist likely spans multiple eras or genres, include "mixed era" and list the likely ones.
- For vibe/mood: be generous here — these are the most useful search tags. A playlist can have many vibes.
- For time of day and room: think about when and where this would actually be played at a hi-fi listening lounge.
- For practical: consider whether it's likely instrumental-heavy vs vocal, deep cuts vs recognizable, etc.
- You may suggest tags from ALL categories, not just the ones explicitly mentioned.

Respond with ONLY a JSON object mapping category names to arrays of suggested tags. No explanation, no markdown, just the JSON object. Example:
{"genre":["jazz","soul"],"era":["1970s"],"energy":["low energy","downtempo"],"timeOfDay":["evening"],"season":["autumn"],"room":["conversation-friendly"],"vibe":["smoky","warm"],"practical":["vocal-forward"]}`;

    const userMessage = `Playlist title: "${title}"${description ? `\nDescription: "${description}"` : ""}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Parse the JSON response
    let suggestedTags;
    try {
      suggestedTags = JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestedTags = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse tag suggestions from AI response");
      }
    }

    // Validate that suggested tags actually exist in our taxonomy
    const validated = {};
    for (const [cat, tags] of Object.entries(suggestedTags)) {
      if (TAG_TAXONOMY[cat]) {
        const lowerTaxonomy = TAG_TAXONOMY[cat].map(t => t.toLowerCase());
        validated[cat] = tags.filter(tag => {
          // Check case-insensitive match and return the canonical version
          const idx = lowerTaxonomy.indexOf(tag.toLowerCase());
          return idx !== -1;
        }).map(tag => {
          // Return the canonical casing from our taxonomy
          const idx = lowerTaxonomy.indexOf(tag.toLowerCase());
          return TAG_TAXONOMY[cat][idx];
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ suggestedTags: validated }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
