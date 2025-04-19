"use client";

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
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-2">Bihag</h1>
      <p className="text-center text-muted-foreground text-lg mb-8">
        Turn your HTML tracklists into beautiful YouTube playlists 🎶
      </p>

      <Card className="mb-10 shadow-md border border-gray-200">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload HTML Playlist File</label>
            <Input type="file" accept=".html" onChange={handleFileUpload} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Playlist Name</label>
            <Input
              placeholder="e.g., 2020 Grammy Gold"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tracklist</label>
            <Textarea
              rows={6}
              placeholder="Paste or auto-populated tracklist (e.g., Artist - Title)"
              value={tracklist}
              onChange={(e) => setTracklist(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Crafting your playlist... 🎧" : "Create YouTube Playlist"}
          </Button>

          {playlistLink && (
            <div className="text-center mt-4">
              <p className="text-sm">Your playlist is ready!</p>
              <a
                href={playlistLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View on YouTube
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedList.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-3">📃 Parsed Tracklist:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {parsedList.map((track, i) => (
              <li key={i}>{track}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        💖 Enjoying this tool?
        <br />
        <a
          href="https://buymeacoffee.com/yourname"
          className="text-pink-500 underline"
          target="_blank"
        >
          Buy me a coffee ☕ or show some love 🌷
        </a>
      </div>

      <div className="text-center text-xs mt-4 text-muted-foreground">
        🌍 Share this app with friends and music lovers —
        <br />
        and let’s make the internet sound better.
      </div>
    </div>
  );
}
