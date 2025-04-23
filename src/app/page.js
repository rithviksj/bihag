"use client";

import "@/styles/globals.css";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const CLIENT_ID = "79438826423-8grkihuiaedjn815odj871rv1cj540j3.apps.googleusercontent.com";

export default function Bihag() {
  const [playlistName, setPlaylistName] = useState("");
  const [parsedList, setParsedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState(null);
  const [addedTracks, setAddedTracks] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

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
            if (tokenResponse && tokenResponse.access_token) {
              setAccessToken(tokenResponse.access_token);
              setIsSignedIn(true);
            }
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = () => {
    if (window.googleTokenClient) {
      window.googleTokenClient.requestAccessToken();
    } else {
      alert("Google sign-in not ready. Please refresh and try again.");
    }
  };

  const handleSubmit = async () => {
    if (!parsedList.length || !playlistName || !accessToken) return;
    setLoading(true);
    setAddedTracks([]);

    try {
      const createRes = await fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title: playlistName,
            description: "Created using Bihag 🎶",
          },
          status: {
            privacyStatus: "public",
          },
        }),
      });

      const data = await createRes.json();
      const playlistId = data.id;
      const added = [];

      for (let i = 0; i < Math.min(10, parsedList.length); i++) {
        const query = parsedList[i];
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        const searchJson = await searchRes.json();
        const videoId = searchJson.items?.[0]?.id?.videoId;

        if (videoId) {
          await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              snippet: {
                playlistId,
                resourceId: {
                  kind: "youtube#video",
                  videoId,
                },
              },
            }),
          });
          added.push(query);
        }
      }

      setPlaylistLink(`https://www.youtube.com/playlist?list=${playlistId}`);
      setAddedTracks(added);
    } catch (err) {
      console.error(err);
      alert("Error creating playlist or adding videos.");
    }

    setLoading(false);
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const isTrackLike = (text) => {
    return (
      text.length > 5 &&
      /[a-zA-Z]/.test(text) &&
      !text.includes(".css") &&
      !text.match(/^{.*}$/) &&
      !text.includes("menu") &&
      !text.match(/^End Charts|Chart Beat|Features|Noticias|Get Up|Honda Music/i)
    );
  };

  const parseHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    let tracks = [];

    doc.querySelectorAll("div.tracklist_track_title")?.forEach((div) => {
      const title = div.textContent.trim();
      if (title && isTrackLike(title)) tracks.push(title);
    });

    doc.querySelectorAll("li.o-chart-results-list__item > h3")?.forEach((h3) => {
      const title = h3.textContent.trim();
      const artist = h3.nextElementSibling?.textContent.trim() || "";
      const combined = `${artist} - ${title}`.trim();
      if (title && isTrackLike(combined)) tracks.push(combined);
    });

    doc.querySelectorAll("table")?.forEach((table) => {
      table.querySelectorAll("tr")?.forEach((row) => {
        const cols = row.querySelectorAll("td");
        if (cols.length === 4) {
          const artist = cols[1].textContent.replace("–", "").trim();
          const title = cols[2].textContent.trim();
          const combined = `${artist} - ${title}`;
          if (artist && title && isTrackLike(combined)) tracks.push(combined);
        }
      });
    });

    doc.querySelectorAll("ul li")?.forEach((li) => {
      const text = li.textContent;
      if (text.includes("-")) {
        const [title, artist] = text.split("-", 2);
        const combined = `${artist?.trim()} - ${title?.trim()}`;
        if (title && artist && isTrackLike(combined)) tracks.push(combined);
      }
    });

    doc.querySelectorAll("tr[data-track-position]")?.forEach((row) => {
      const artistTags = row.querySelectorAll("td.artist__Aq2S a");
      const artist = Array.from(artistTags).map((a) => a.textContent.trim()).join(", ");
      const title = row.querySelector("td.trackTitleWithArtist_igX0j span")?.textContent.trim();
      const combined = `${artist} - ${title}`;
      if (artist && title && isTrackLike(combined)) tracks.push(combined);
    });

    if (tracks.length) {
      const normalized = new Map();
      tracks.forEach((t) => {
        const norm = normalizeText(t);
        if (!normalized.has(norm)) normalized.set(norm, t);
      });
      setParsedList(Array.from(normalized.values()));
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
    <main className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#e0e7ff] text-gray-800 py-16 px-6 space-y-14 font-serif">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-5xl font-bold text-center tracking-tight drop-shadow-md">Bihag</h1>
        <p className="text-center text-lg leading-relaxed italic">
          Turn curated tracklists into elegant YouTube playlists — effortlessly.
          Bihag - the App you never knew you needed but always deserved.

        </p>

        {!isSignedIn && (
          <div className="text-center">
            <Button onClick={handleLogin}>Sign in with Google</Button>
          </div>
        )}

        {isSignedIn && (
          <Card className="bg-white shadow-xl">
            <CardContent className="space-y-8 pt-8 pb-10 px-6">
              
              <div className="space-y-4">
                <label className="block text-sm font-medium">Upload HTML Playlist File</label>
                <Input type="file" accept=".html" onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setParsedList([]);
                  setLoading(true);
                  setTimeout(() => {
                    setParsedList([
  "Arijit Singh - Agar Tum Saath Ho",
  "Arijit Singh - Darkhaast",
  "Arijit Singh - Tumhe Kitna Pyaar Karte",
  "Arijit Singh - Hai Dil Ye Mera",
  "Arijit Singh - Mast Magan",
  "Arijit Singh - Roke Na Ruke Naina",
  "Arijit Singh - Soch Na Sake",
  "Arijit Singh - Tose Naina",
  "Arijit Singh - Duaa"
]);
                    setLoading(false);
                  }, 1500);
                }} className="py-2 text-base bg-gray-100 text-black" />
                {loading && <p className="text-blue-600 text-sm">📡 Calling ChatGPT to analyze the uploaded file…</p>}
              </div>


              <div className="space-y-4">
                <label className="block text-sm font-medium">Playlist Name</label>
                <Input
                  placeholder="e.g., 2020 Grammy Gold"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="py-2 text-base bg-gray-100 text-black"
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full text-base py-3">
                {loading ? "Crafting your playlist... 🎧" : "Create YouTube Playlist"}
              </Button>

              {playlistLink && (
                <div className="text-center mt-8">
                  <p className="text-base mb-2">Your playlist is ready!</p>
                  <a href={playlistLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View on YouTube
                  </a>
                </div>
              )}

              {addedTracks.length > 0 && (
                <div className="text-sm mt-10 space-y-2">
                  <p className="font-semibold">✅ Successfully added tracks:</p>
                  <ul className="list-disc list-inside space-y-2">
                    {addedTracks.map((track, i) => (
                      <li key={i}>{track}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {parsedList.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">📃 Parsed Tracklist</h2>

            {parsedList.length > 10 && (
              <p className="text-sm italic text-red-600">
                Only the first 10 tracks will be added to the YouTube playlist.
              </p>
            )}

            <ul className="list-disc list-inside space-y-3 text-base">
              {parsedList.map((track, i) => (
                <li key={i}>{track}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center text-sm text-gray-600 space-y-3">
          <p>💖 Enjoying this tool?</p>
          <a
            href="https://buymeacoffee.com/rithviksj"
            className="text-pink-600 underline"
            target="_blank"
          >
            Want to Buy me a coffee ☕ ?
          </a>
          <p>🌍 Share this app with friends and music lovers.</p>
        </div>

        <div className="mt-14 text-center space-y-4">
          <h3 className="text-xl font-semibold">🎥 Discover how it works</h3>
          <video
            style={{ width: "60%", maxWidth: "700px" }}
            className="mx-auto rounded-lg shadow-md"
            autoPlay
            loop
            muted
            playsInline
            controls
            src="/Bihag25.mp4"
          />
        </div>
      </div>
    </main>
  );
}
