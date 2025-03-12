// Frontend Page
// File: app/page.js

"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [synonyms, setSynonyms] = useState([]);
  const [definition, setDefinition] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWordData = async (searchWord = word) => {
    if (!searchWord.trim()) {
      setError("Please enter a word to search.");
      return;
    }

    setError(null);
    setSynonyms([]);
    setDefinition("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/thesaurus?word=${encodeURIComponent(searchWord)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSynonyms(data.synonyms);
        setDefinition(data.definition);
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const clearFields = () => {
    setWord("");
    setSynonyms([]);
    setDefinition("");
    setSuggestions([]);
    setError(null);
  };

  const selectSuggestionAndSearch = (suggestion) => {
    setWord(suggestion);
    fetchWordData(suggestion);
  };

  const selectSynonymAndSearch = (synonym) => {
    setWord(synonym);
    fetchWordData(synonym);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 bg-gradient-to-b from-slate-100 to-slate-500">
      <h1 className="text-4xl font-bold text-center text-slate-600 mb-6 w-full">
        Word
        <span className="block text-lg">Definition Finder</span>
      </h1>

      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Enter a word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-yellow-300"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => fetchWordData()}
            className="flex-1 p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={clearFields}
            className="flex-1 p-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-700"
          >
            Clear
          </button>
          <Link className="hover:underline self-center" href="/">
            Go to Menu
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {definition && (
        <div className="mt-6 w-full max-w-md p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-blue-600">Definition</h2>
          <p className="mt-2 text-gray-700">{definition}</p>
        </div>
      )}

      {synonyms.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-lg font-semibold text-gray-700">Synonyms:</h2>
          <ul className="mt-2 space-y-2">
            {synonyms.map((synonym, index) => (
              <li
                key={index}
                onClick={() => selectSynonymAndSearch(synonym.word)}
                className="p-3 border rounded-lg shadow-sm hover:bg-gray-600 cursor-pointer  bg-black text-white"
              >
                {synonym.word}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-lg font-semibold text-gray-700">Did you mean:</h2>
          <ul className="mt-2 space-y-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => selectSuggestionAndSearch(suggestion.word)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                {suggestion.word}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && synonyms.length === 0 && !error && !definition && (
        <p className="mt-6 text-gray-500">
          Enter a word to find synonyms and definitions.
        </p>
      )}
    </div>
  );
}
