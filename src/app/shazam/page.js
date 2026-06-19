"use client";

import "@/styles/globals.css";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CLIENT_ID = "79438826423-8grkihuiaedjn815odj871rv1cj540j3.apps.googleusercontent.com";
const PLAYLIST_TITLE = "Shazam Finds 🎵";
const STORAGE_KEY = "shazam_finds_log";
const PLAYLIST_ID_KEY = "shazam_finds_playlist_id";

export default function ShazamFinds() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [status, setStatus] = useState(null); // null | "adding" | "done" | "error"
  const [log, setLog] = useState([]);
  const [pendingSong, setPendingSong] = useState(null); // { song, artist }
  const [lastAdded, setLastAdded] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const tokenRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLog(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const song = params.get("song");
    const artist = params.get("artist");
    if (song || artist) {
      setPendingSong({ song: song || "", artist: artist || "" });
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.googleTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/youtube",
          callback: (tokenResponse) => {
            if (tokenResponse?.access_token) {
              tokenRef.current = tokenResponse.access_token;
              setAccessToken(tokenResponse.access_token);
              setIsSignedIn(true);
            }
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const findOrCreatePlaylist = async (token) => {
    const cached = localStorage.getItem(PLAYLIST_ID_KEY);
    if (cached) return cached;

    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    const existing = data.items?.find((p) => p.snippet.title === PLAYLIST_TITLE);
    if (existing) {
      localStorage.setItem(PLAYLIST_ID_KEY, existing.id);
      return existing.id;
    }

    const createRes = await fetch(
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          snippet: { title: PLAYLIST_TITLE, description: "Songs I Shazamed — captured via Bihag 🎵" },
          status: { privacyStatus: "private" },
        }),
      }
    );
    const created = await createRes.json();
    localStorage.setItem(PLAYLIST_ID_KEY, created.id);
    return created.id;
  };

  const addToPlaylist = useCallback(
    async (token, song, artist) => {
      setStatus("adding");
      setErrorMsg("");
      try {
        const query = [song, artist].filter(Boolean).join(" ");

        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const searchJson = await searchRes.json();
        const video = searchJson.items?.[0];
        if (!video) throw new Error("No YouTube video found for this track.");

        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title;
        const playlistId = await findOrCreatePlaylist(token);

        await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            snippet: { playlistId, resourceId: { kind: "youtube#video", videoId } },
          }),
        });

        const entry = { song, artist, videoId, videoTitle, addedAt: new Date().toISOString() };
        const newLog = [entry, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLog));
        setLog(newLog);
        setLastAdded(entry);
        setStatus("done");
        setPendingSong(null);
        window.history.replaceState({}, "", window.location.pathname);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Something went wrong.");
        setStatus("error");
      }
    },
    []
  );

  useEffect(() => {
    if (isSignedIn && accessToken && pendingSong && status === null) {
      addToPlaylist(accessToken, pendingSong.song, pendingSong.artist);
    }
  }, [isSignedIn, accessToken, pendingSong, status, addToPlaylist]);

  const handleLogin = () => {
    if (window.googleTokenClient) window.googleTokenClient.requestAccessToken();
    else alert("Google sign-in not ready. Please refresh.");
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#e0e7ff] text-gray-800 py-16 px-6 font-serif">
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Bihag</a>
          <h1 className="text-3xl font-bold text-center">Shazam Finds 🎵</h1>
          <div className="w-16" />
        </div>

        <p className="text-center italic text-gray-600 text-sm">
          Songs you caught in the wild — saved automatically to your YouTube playlist.
        </p>

        {!isSignedIn && (
          <div className="text-center space-y-5">
            {pendingSong && (
              <Card className="bg-white shadow-md border border-blue-100">
                <CardContent className="pt-6 pb-5 text-center space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Ready to add</p>
                  <p className="font-semibold text-xl">{pendingSong.song}</p>
                  {pendingSong.artist && <p className="text-gray-500">{pendingSong.artist}</p>}
                </CardContent>
              </Card>
            )}
            <Button onClick={handleLogin}>Sign in with Google to continue</Button>
          </div>
        )}

        {isSignedIn && status === "adding" && (
          <div className="text-center py-10 space-y-2">
            <p className="text-lg animate-pulse">🔍 Finding on YouTube...</p>
            {pendingSong && (
              <p className="text-gray-500 text-sm">
                {pendingSong.song} — {pendingSong.artist}
              </p>
            )}
          </div>
        )}

        {isSignedIn && status === "done" && lastAdded && (
          <Card className="bg-green-50 border border-green-200 shadow-md">
            <CardContent className="pt-6 pb-5 text-center space-y-2">
              <p className="text-green-700 font-bold text-xl">✅ Added to Shazam Finds!</p>
              <p className="font-medium">
                {lastAdded.song}
                {lastAdded.artist ? ` — ${lastAdded.artist}` : ""}
              </p>
              <p className="text-sm text-gray-500 italic">"{lastAdded.videoTitle}"</p>
              <div className="flex justify-center gap-4 pt-1">
                <a
                  href={`https://www.youtube.com/watch?v=${lastAdded.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  ▶ Watch on YouTube
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {isSignedIn && status === "error" && (
          <Card className="bg-red-50 border border-red-200 shadow-md">
            <CardContent className="pt-6 pb-5 text-center space-y-3">
              <p className="text-red-600 font-medium">Couldn't add that one.</p>
              <p className="text-sm text-gray-500">{errorMsg}</p>
              <Button
                onClick={() => { setStatus(null); setErrorMsg(""); }}
                className="mt-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {isSignedIn && status === null && !pendingSong && (
          <div className="text-center text-gray-400 py-4 text-sm">
            <p>Trigger from your iOS Shortcut after Shazaming to add songs here.</p>
          </div>
        )}

        {log.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Finds ({log.length})</h2>
              <a
                href={`https://www.youtube.com/playlist?list=${localStorage.getItem(PLAYLIST_ID_KEY) || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open playlist →
              </a>
            </div>
            <div className="space-y-3">
              {log.map((entry, i) => (
                <Card key={i} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-5 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{entry.song}</p>
                      {entry.artist && (
                        <p className="text-sm text-gray-500 truncate">{entry.artist}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(entry.addedAt)}</p>
                    </div>
                    <a
                      href={`https://www.youtube.com/watch?v=${entry.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium shrink-0"
                    >
                      ▶ Watch
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-400 pt-4 space-y-1">
          <p>Discoveries stored locally in your browser.</p>
          <p>
            <a href="https://buymeacoffee.com/rithviksj" className="text-pink-500 hover:underline" target="_blank" rel="noopener noreferrer">
              ☕ Buy me a coffee
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}
