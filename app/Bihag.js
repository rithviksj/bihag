"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function Bihag() {
  const [playlistName, setPlaylistName] = useState("");
  const [tracklist, setTracklist] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setPlaylistLink("https://www.youtube.com/playlist?list=FAKE12345");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-4">🧓 Bihag</h1>
      <p className="text-center text-muted-foreground mb-2">
        For banger-loving grandmas, hot girls, and all vinyl souls 🎶
      </p>
      <div className="text-sm text-center mb-6 text-muted-foreground">
        <strong>What is this?</strong> Upload or paste a tracklist from Discogs, Billboard, or Wikipedia. We'll turn it into a banger-ready YouTube playlist.
        <br />
        <strong>How it works:</strong> Paste your tracklist → Click the button → Get your playlist link.
      </div>
      <Card className="mb-4">
        <CardContent className="space-y-4 pt-4">
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
              <a href={playlistLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View Playlist
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-sm text-muted-foreground">
        🫶 Willing to donate free hugs to hot people?
        <br />
        <a href="https://buymeacoffee.com/yourname" className="text-pink-500 underline" target="_blank">
          Buy me a chai latte ☕ or toss a rose 🌹
        </a>
      </div>
      <div className="text-center text-xs mt-4">
        💌 Share this app with friends — next time you walk into work,
        <br />
        bras may fly, cheeks will blush, and vibes will erupt.
      </div>
    </div>
  );
}