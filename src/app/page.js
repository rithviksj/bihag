"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

const CLIENT_ID = "79438826423-tqe7lj8imr83hv7l3fob5307srbs3bcp.apps.googleusercontent.com","project_id":"animated-flare-457003-j7"; // Replace with your actual OAuth client ID

export default function Bihag() {
  const [playlistName, setPlaylistName] = useState("");
  const [parsedList, setParsedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("client:auth2", () => {
        window.gapi.client.init({
          clientId: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/youtube"
        }).then(() => {
          const authInstance = window.gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        });
      });
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = () => {
    window.gapi.auth2.getAuthInstance().signIn();
  };

  const handleLogout = () => {
    window.gapi.auth2.getAuthInstance().signOut();
  };

  const handleSubmit = async () => {
    if (!parsedList.length || !playlistName || !isSignedIn) return;
    setLoading(true);

    try {
      const accessToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

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
            privacyStatus: "public"
          }
        })
      });

      const data = await response.json();
      const playlistId = data.id;

      for (let i = 0; i < Math.min(2, parsedList.length); i++) {
        const query = parsedList[i];
        const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
          }
        });

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
                }
              }
            })
          });
        }
      }

      setPlaylistLink(`https://www.youtube.com/playlist?list=${playlistId}`);
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

    doc.querySelectorAll("div.tracklist_track_title")?.forEach(div => {
      const title = div.textContent.trim();
      if (title) tracks.push(title);
    });

    doc.querySelectorAll("li.o-chart-results-list__item > h3")?.forEach(h3 => {
      const title = h3.textContent.trim();
      const artist = h3.nextElementSibling?.textContent.trim() || "";
      if (title) tracks.push(`${artist} - ${title}`.trim());
    });

    doc.querySelectorAll("table")?.forEach(table => {
      table.querySelectorAll("tr")?.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length === 4) {
          const artist = cols[1].textContent.replace("–", "").trim();
          const title = cols[2].textContent.trim();
          if (artist && title) tracks.push(`${artist} - ${title}`);
        }
      });
    });

    doc.querySelectorAll("ul li")?.forEach(li => {
      const text = li.textContent;
      if (text.includes("-")) {
        const [title, artist] = text.split("-", 2);
        if (title && artist) tracks.push(`${artist.trim()} - ${title.trim()}`);
      }
    });

    doc.querySelectorAll("tr[data-track-position]")?.forEach(row => {
      const artistTags = row.querySelectorAll("td.artist__Aq2S a");
      const artist = Array.from(artistTags).map(a => a.textContent.trim()).join(", ");
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
    <div className="max-w-3xl mx-auto px-8 py-14 font-serif">
      <h1 className="text-5xl font-bold text-center mb-4 tracking-tight">Bihag</h1>
      <p className="text-center text-muted-foreground text-lg mb-6">
        Turn your HTML tracklists into beautiful YouTube playlists 🎶
      </p>

      {!isSignedIn && (
        <div className="text-center mb-8">
          <Button onClick={handleLogin}>Sign in with Google</Button>
        </div>
      )}

      {isSignedIn && (
        <Card className="mb-12 shadow-lg border border-gray-200">
          <CardContent className="space-y-8 pt-8 pb-10 px-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Upload HTML Playlist File</label>
              <Input type="file" accept=".html" onChange={handleFileUpload} className="py-2 text-base" />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Playlist Name</label>
              <Input
                placeholder="e.g., 2020 Grammy Gold"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="py-2 text-base"
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
                  className="text-blue-600 underline"
                >
                  View on YouTube
                </a>
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

      <div className="text-center text-base text-muted-foreground mb-3">
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

      <div className="text-center text-sm text-muted-foreground">
        🌍 Share this app with friends and music lovers — let’s make the internet sound better.
      </div>
    </div>
  );
}
