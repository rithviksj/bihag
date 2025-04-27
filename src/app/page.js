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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('htmlFile', file);

    setLoading(true);
    setParsedList([]);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setParsedList(data.tracks || []);
    } catch (error) {
      console.error("Error extracting playlist:", error);
      alert("Failed to parse playlist. Please try again.");
    }

    setLoading(false);
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
            <Button onClick={handleLogin}>Sign in
