"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

const CLIENT_ID = "79438826423-8grkihuiaedjn815odj871rv1cj540j3.apps.googleusercontent.com";

export default function Bihag() {
  const [playlistName, setPlaylistName] = useState("");
  const [parsedList, setParsedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState(null);
  const [addedTracks, setAddedTracks] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              setIsSignedIn(true);
            }
          },
        });

        window.google.accounts.id.prompt();

        window.googleTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/youtube",
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              window.googleAccessToken = tokenResponse.access_token;
            }
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = () => {
    window.google?.accounts.id.prompt();
  };

  const handleLogout = () => {
    window.google.accounts.id.disableAutoSelect();
    setIsSignedIn(false);
  };

  const handleSubmit = async () => {
    if (!parsedList.length || !playlistName || !isSignedIn) return;
    setLoading(true);
    setAddedTracks([]);

    try {
      if (!window.googleAccessToken) {
        await new Promise((resolve) => {
          window.googleTokenClient.callback = (tokenResponse) => {
            window.googleAccessToken = tokenResponse.access_token;
            resolve();
          };
          window.googleTokenClient.requestAccessToken();
        });
      }

      const accessToken = window.googleAccessToken;

      const response = await fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title: playlistName,
            description: "Created using Bihag app",
          },
          status: {
            privacyStatus: "public",
          },
        }),
      });

      const data = await response.json();
      const playlistId = data.id;

      const added = [];
      for (let i = 0; i < Math.min(2, parsedList.length); i++) {
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
    } catch (error) {
      console.error("YouTube playlist creation error:", error);
      alert("There was an issue creating the playlist.");
    }

    setLoading(false);
  };

  const parseHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    let tracks = [];

    doc.querySelectorAll("div.tracklist_track_title")?.forEach((div) => {
      const title = div.textContent.trim();
      if (title) tracks.push(title);
    });

    doc.querySelectorAll("li.o-chart-results-list__item > h3")?.forEach((h3) => {
      const title = h3.textContent.trim();
      const artist = h3.nextElementSibling?.textContent.trim() || "";
      if (title) tracks.push(`${artist} - ${title}`.trim());
    });

    doc.querySelectorAll("table")?.forEach((table) => {
      table.querySelectorAll("tr")?.forEach((row) => {
        const cols = row.querySelectorAll("td");
        if (cols.length === 4) {
          const artist = cols[1].textContent.replace("–", "").trim();
          const title = cols[2].textContent.trim();
          if (artist && title) tracks.push(`${artist} - ${title}`);
        }
      });
    });

    doc.querySelectorAll("ul li")?.forEach((li) => {
      const text = li.textContent;
      if (text.includes("-")) {
        const [title, artist] = text.split("-", 2);
        if (title && artist) tracks.push(`${artist.trim()} - ${title.trim()}`);
      }
    });

    doc.querySelectorAll("tr[data-track-position]")?.forEach((row) => {
      const artistTags = row.querySelectorAll("td.artist__Aq2S a");
      const artist = Array.from(artistTags).map((a) => a.textContent.trim()).join(", ");
      const title = row.querySelector("td.trackTitleWithArtist_igX0j span")?.textContent.trim();
      if (artist && title) tracks.push(`${artist} - ${title}`);
    });

    if (tracks.length) {
      setParsedList(tracks);
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
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1604014238647-a9e02d843041?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center text-white px-4 py-14">
      <div className="backdrop-blur-sm bg-black/30 p-10 rounded-xl max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 tracking-tight drop-shadow-xl animate-pulse">Bihag</h1>
        <p className="text-center text-lg mb-6 italic opacity-90">
          Lo-fi powered playlist magic. Upload your vibe → drop a YouTube playlist 🎶
        </p>

        {!isSignedIn && (
          <div className="text-center mb-8">
            <Button onClick={handleLogin}>Sign in with Google</Button>
          </div>
        )}

        {isSignedIn && (
          <Card className="mb-12 shadow-lg border border-gray-200/30 bg-white/10">
            <CardContent className="space-y-8 pt-8 pb-10 px-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Upload HTML Playlist File</label>
                <Input type="file" accept=".html" onChange={handleFileUpload} className="py-2 text-base bg-white text-black" />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Playlist Name</label>
                <Input
                  placeholder="e.g., 2020 Grammy Gold"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="py-2 text-base bg-white text-black"
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full text-base py-2.5">
                {loading ? "Crafting your playlist... 🎧" : "Create YouTube Playlist"}
              </Button>

              {playlistLink && (
                <div className="text-center mt-6">
                  <p className="text-base">Your playlist is ready!</p>
                  <a
                    href={playlistLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 underline"
                  >
                    View on YouTube
                  </a>
                </div>
              )}

              {addedTracks.length > 0 && (
                <div className="text-sm mt-6">
                  <p className="font-semibold mb-2">✅ Successfully added tracks:</p>
                  <ul className="list-disc list-inside">
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
          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-4">📃 Parsed Tracklist</h2>
            <ul className="list-disc list-inside space-y-2 text-base">
              {parsedList.map((track, i) => (
                <li key={i}>{track}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center text-base text-white/80 mb-3">
          💖 Enjoying this tool?
          <br />
          <a
            href="https://buymeacoffee.com/yourname"
            className="text-pink-300 underline"
            target="_blank"
          >
            Buy me a coffee ☕ or show some love 🌷
          </a>
        </div>

        <div className="text-center text-sm text-white/70">
          🌍 Share this app with friends and music lovers — let’s make the internet sound better.
        </div>
      </div>
    </div>
  );
}
