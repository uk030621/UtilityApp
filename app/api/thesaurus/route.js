// Backend API Route
// File: app/api/thesaurus/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return new Response(JSON.stringify({ error: "Word is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Fetch synonyms from Datamuse API
    const synonymsResponse = await fetch(
      `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`
    );

    if (!synonymsResponse.ok) {
      throw new Error("Failed to fetch synonyms");
    }

    const synonyms = await synonymsResponse.json();

    // Fetch dictionary data from Free Dictionary API
    const dictionaryResponse = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word
      )}`
    );

    const dictionaryData = dictionaryResponse.ok
      ? await dictionaryResponse.json()
      : null;

    // Fetch spelling suggestions from Datamuse API
    const suggestionsResponse = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}`
    );
    const suggestions = await suggestionsResponse.json();

    // Combine results
    return new Response(
      JSON.stringify({
        synonyms,
        definition: dictionaryData
          ? dictionaryData[0]?.meanings[0]?.definitions[0]?.definition
          : "Definition not found",
        suggestions,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error fetching data. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
