"use client";

// Bihag - The Classy Playlist Maker
// Upload + Parse HTML + Create Playlist

import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";

export default function Bihag() {
  const [playlistName, setPlaylistName] = useState("");
  const [tracklist, setTracklist] = useState("");
  const [parsedList, setParsedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPlaylistLink("https://www.youtube.com/playlist?list=FAKE12345");
      setLoading(false);
    }, 1500);
  };

  const parseHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    let tracks = [];

    const rows = doc.querySelectorAll("tr[data-track-position]");
    if (rows.length) {
      rows.forEach((row) => {
        const artistTags = row.querySelectorAll("td.artist__Aq2S a");
        const artist = Array.from(artistTags).map(a => a.textContent.trim()).join(", ");
        const title = row.querySelector("td.trackTitleWithArtist_igX0j span")?.textContent.trim();
        if (artist && title) tracks.push(`${artist} - ${title}`);
      });
    }

    if (tracks.length) {
      setParsedList(tracks);
      setTracklist(tracks.join("\n"));
    } else {
      alert("No recognizable tracks found in uploaded HTML.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => parseHTML(reader.result);
    reader.readAsText(file);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-4">Bihag</h1>
      <p className="text-center text-muted-foreground mb-2">
        For banger-loving grandmas, hot girls, and all vinyl souls 🎶
      </p>

      <div className="text-sm text-center mb-6 text-muted-foreground">
        <strong>What is this?</strong> Upload a tracklist HTML file or paste it manually.
        <br />We’ll parse and build a ready-to-go YouTube playlist.
      </div>

      <Card className="mb-4">
        <CardContent className="space-y-4 pt-4">
          <Input type="file" accept=".html" onChange={handleFileUpload} />

          <Input
            placeholder="Name your playlist (e.g., 2020 Grammy Gold)"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />

          <Textarea
            rows={6}
            placeholder="Paste your tracklist here (e.g., Artist - Title)..."
            value={tracklist}
            onChange={(e) => setTracklist(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Crafting your banger... 🔥" : "Create YouTube Playlist"}
          </Button>

          {playlistLink && (
            <div className="text-center mt-4">
              <p className="text-sm">Playlist ready, superstar 🕺</p>
              <a
                href={playlistLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Playlist
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedList.length > 0 && (
        <div className="text-sm mt-6">
          <h2 className="font-semibold mb-2">📃 Parsed Tracklist:</h2>
          <ul className="list-disc list-inside space-y-1">
            {parsedList.map((track, i) => (
              <li key={i}>{track}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground mt-6">
        🫶 Willing to donate ?
        <br />
        <a
          href="https://buymeacoffee.com/yourname"
          className="text-pink-500 underline"
          target="_blank"
        >
          Buy me a cofee ?🌹
        </a>
      </div>

      <div className="text-center text-xs mt-4">
        💌 Share this app with friends!
        <br />
        
      </div>
    </div>
  );
}
