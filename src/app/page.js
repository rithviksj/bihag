"use client";

import "@/styles/globals.css";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import WorkflowDiagram from "@/components/WorkflowDiagram";
import VisitorCounter from "@/components/VisitorCounter";
import PlaylistCounter from "@/components/PlaylistCounter";
import VisitorMap from "@/components/VisitorMap";
import FeedbackWidget from "@/components/FeedbackWidget";

const CLIENT_ID = "79438826423-8grkihuiaedjn815odj871rv1cj540j3.apps.googleusercontent.com";

export default function Bihag() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [parsedSongs, setParsedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [playlistLink, setPlaylistLink] = useState(null);
  const [addedTracks, setAddedTracks] = useState([]);
  const [skippedTracks, setSkippedTracks] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);
  const [quotaError, setQuotaError] = useState(false);

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
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              setAccessToken(tokenResponse.access_token);
              setIsSignedIn(true);

              // Fetch user email from Google API
              try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                const userInfo = await userInfoRes.json();
                if (userInfo.email) {
                  setUserEmail(userInfo.email);

                  // Log authenticated user activity
                  await fetch("/api/user-activity", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "oauth_login",
                      email: userInfo.email,
                      metadata: { provider: "google" },
                    }),
                  });

                  // Update visitor count with email
                  await fetch("/api/visitor-count", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: userInfo.email }),
                  });
                }
              } catch (emailError) {
                console.error("Error fetching user email:", emailError);
              }
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

  const handleScrapePlaylist = async () => {
    if (!playlistUrl) {
      setError("Please enter a radio station playlist URL");
      return;
    }

    setLoading(true);
    setError(null);
    setQuotaError(false);
    setScrapingStatus("Fetching playlist from radio station...");
    setParsedSongs([]);

    try {
      const response = await fetch("/api/scrape-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: playlistUrl }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setScrapingStatus("");
        setLoading(false);
        return;
      }

      if (!data.songs || data.songs.length === 0) {
        setError("No songs found on this page. Please check the URL and try again.");
        setScrapingStatus("");
        setLoading(false);
        return;
      }

      setParsedSongs(data.songs);
      setScrapingStatus(`Found ${data.count} song${data.count !== 1 ? "s" : ""}!`);
    } catch (err) {
      console.error("Scraping error:", err);
      setError("Failed to fetch playlist. Please check the URL and try again.");
    }

    setLoading(false);
  };

  const handleCreatePlaylist = async () => {
    if (!parsedSongs.length || !playlistName || !accessToken) {
      setError("Please sign in, scrape a playlist, and enter a playlist name");
      return;
    }

    setLoading(true);
    setError(null);
    setQuotaError(false);
    setProgress(0);
    setAddedTracks([]);
    setSkippedTracks([]);
    setScrapingStatus("Creating YouTube playlist...");

    try {
      // Create playlist
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
            description: `Created using Bihag - Turn radio playlists into YouTube collections`,
          },
          status: {
            privacyStatus: "public",
          },
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        console.error("YouTube API error:", errorData);
        throw new Error(errorData.error?.message || `Failed to create playlist: ${createRes.status}`);
      }

      const data = await createRes.json();
      const playlistId = data.id;
      const added = [];
      const skipped = [];

      // No song limit for admin, 5-song limit for others
      const songLimit = userEmail === "rithviksj@gmail.com" ? parsedSongs.length : 5;
      const songsToAdd = parsedSongs.slice(0, songLimit);

      // Search and add songs
      for (let i = 0; i < songsToAdd.length; i++) {
        const song = songsToAdd[i];
        setScrapingStatus(`Processing song ${i + 1} of ${songsToAdd.length}...`);
        setProgress(((i + 1) / songsToAdd.length) * 100);

        try {
          // Search for video
          const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(song.combined)}&maxResults=1&type=video`,
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
            // Add to playlist
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

            added.push(song.combined);
          } else {
            skipped.push(song.combined);
          }
        } catch (songError) {
          console.error(`Error adding song ${song.combined}:`, songError);
          skipped.push(song.combined);
        }
      }

      setPlaylistLink(`https://www.youtube.com/playlist?list=${playlistId}`);
      setAddedTracks(added);
      setSkippedTracks(skipped);
      setScrapingStatus(`Playlist created! ${added.length} of ${songsToAdd.length} songs added successfully.`);

      // Log playlist creation activity
      try {
        await fetch("/api/user-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "playlist_created",
            email: userEmail || "anonymous",
            metadata: {
              playlistId,
              playlistName,
              songsAdded: added.length,
              songsSkipped: skipped.length,
              totalSongs: songsToAdd.length,
              sourceUrl: playlistUrl,
            },
          }),
        });
      } catch (logError) {
        console.error("Error logging playlist creation:", logError);
      }
    } catch (err) {
      console.error("Playlist creation error:", err);
      const errorMessage = err.message || "Unknown error";

      // Check if it's a quota error
      const isQuotaError = errorMessage.toLowerCase().includes("quota") ||
                          errorMessage.toLowerCase().includes("exceeded");

      if (isQuotaError) {
        setQuotaError(true);
        setError("YouTube API quota limit reached. The free tier allows ~3 playlists per day.");
      } else {
        setError(`Error creating playlist: ${errorMessage}`);
      }
      setScrapingStatus("");
    }

    setLoading(false);
    setProgress(0);
  };

  return (
    <>
      <FeedbackWidget />
      <main className="min-h-screen text-gray-800 py-16 px-6 space-y-14">
        <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-display font-black tracking-tight drop-shadow-2xl text-[#b91c1c] pb-2">
            Bihag
          </h1>
          <p className="text-2xl leading-relaxed font-light max-w-3xl mx-auto text-gray-700">
            Turn radio station playlists into YouTube playlist collection — effortlessly.
          </p>
          <p className="text-lg text-gray-600 font-medium">
            ✨ The app you never knew you needed but always deserved.
          </p>
        </div>

        {/* Workflow Diagram */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/20 p-10 border border-gray-300">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            How It Works
          </h2>
          <WorkflowDiagram />
        </section>

        {/* URL Input Section - Available to everyone */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl shadow-black/20 border border-gray-300">
          <CardContent className="space-y-8 pt-8 pb-10 px-6">
            {/* URL Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Radio Station Playlist URL</label>
              <Input
                type="url"
                placeholder="e.g., https://www.billboard.com/charts/hot-100"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="py-3 text-base bg-white text-gray-900 border-gray-300 focus:border-cyan-500"
              />
              <p className="text-xs text-gray-600">
                Paste the URL of a radio station's playlist page or music chart
              </p>
            </div>

            {/* Scrape Button */}
            <Button
              onClick={handleScrapePlaylist}
              disabled={loading || !playlistUrl}
              className="w-full text-base py-3"
            >
              {loading && !parsedSongs.length ? "Fetching playlist..." : "Fetch Playlist"}
            </Button>

            {/* Quota Error - Special Banner */}
            {error && quotaError && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-900 mb-2">
                      Daily API Limit Reached
                    </h3>
                    <p className="text-gray-700 mb-3">
                      YouTube's free API tier limits playlist creation to ~3 per day. The limit resets at midnight Pacific Time.
                    </p>
                    <p className="text-gray-800 font-medium mb-4">
                      ☕ Love this tool? Your support helps increase API limits and keep Bihag running for everyone!
                    </p>
                    <a
                      href="https://buymeacoffee.com/rithviksj"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <span className="mr-2">☕</span>
                      Buy Me a Coffee
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                    <button
                      onClick={() => {
                        setError(null);
                        setQuotaError(false);
                      }}
                      className="ml-4 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Error Message */}
            {error && !quotaError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-700 text-sm">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Status Message */}
            {scrapingStatus && !error && !playlistLink && (
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 text-green-700 font-medium text-sm">
                <p>{scrapingStatus}</p>
                {progress > 0 && (
                  <div className="mt-2 w-full bg-cyan-900/30 rounded-full h-2">
                    <div
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Parsed Songs - Ready to Save */}
            {parsedSongs.length > 0 && !playlistLink && (
              <div className="space-y-6">
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                    ✅ Playlist Ready! Found {parsedSongs.length} song{parsedSongs.length !== 1 ? "s" : ""}
                  </h3>
                  {(() => {
                    const limit = userEmail === "rithviksj@gmail.com" ? parsedSongs.length : 5;
                    return parsedSongs.length > limit && (
                      <p className="text-sm text-emerald-400">
                        {userEmail === "rithviksj@gmail.com"
                          ? "All songs will be added to the YouTube playlist."
                          : "Only the first 5 songs will be added to the YouTube playlist."}
                      </p>
                    );
                  })()}
                </div>

                {/* Song List Preview */}
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold text-green-700 hover:text-green-600">
                    Preview songs ({(() => {
                      const limit = userEmail === "rithviksj@gmail.com" ? parsedSongs.length : 5;
                      return Math.min(limit, parsedSongs.length);
                    })()} will be added)
                  </summary>
                  <ul className="list-disc list-inside space-y-2 mt-4 text-base max-h-64 overflow-y-auto">
                    {parsedSongs.slice(0, userEmail === "rithviksj@gmail.com" ? parsedSongs.length : 5).map((song, i) => (
                      <li key={i} className="text-gray-700">
                        {song.combined}
                      </li>
                    ))}
                  </ul>
                </details>

                {/* Sign In Prompt for non-signed-in users */}
                {!isSignedIn && (
                  <div className="bg-cyan-900/20 border-2 border-cyan-500/40 rounded-lg p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 text-green-700 mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-700">Sign in to save to YouTube</h3>
                    <p className="text-sm text-gray-700">
                      We'll create this playlist and save it to your YouTube account
                    </p>
                    <Button onClick={handleLogin} className="text-base py-3 px-8">
                      Sign in with Google
                    </Button>
                    <p className="text-xs text-gray-600 flex items-center justify-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Your data is never stored or shared</span>
                    </p>
                  </div>
                )}

                {/* Playlist Creation for signed-in users */}
                {isSignedIn && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-green-700">Playlist Name</label>
                      <Input
                        placeholder="e.g., Top 20 Hits from Billboard"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        className="py-3 text-base bg-[#0a1929] text-gray-100 border-cyan-500/30 focus:border-cyan-400"
                      />
                    </div>

                    <Button
                      onClick={handleCreatePlaylist}
                      disabled={loading || !playlistName}
                      className="w-full text-base py-3"
                    >
                      {loading ? "Creating playlist..." : "Create YouTube Playlist"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success - Playlist Link with Feedback */}
        {playlistLink && (
          <Card className="bg-emerald-900/20 border-2 border-emerald-500/40 backdrop-blur-sm shadow-2xl shadow-black/50">
            <CardContent className="p-6 text-center space-y-6">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold text-emerald-300">Playlist Created!</h3>
              <p className="text-emerald-400 text-lg">
                {addedTracks.length} of {Math.min(20, parsedSongs.length)} songs added successfully
              </p>
              <a
                href={playlistLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 shadow-lg transition-all transform hover:scale-105"
              >
                View on YouTube →
              </a>

              {/* Thumbs Up/Down Feedback */}
              <div className="pt-4 border-t border-emerald-500/30">
                <p className="text-sm text-gray-700 mb-3">How was your experience?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={async () => {
                      await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ feedback: 'positive' })
                      });
                      alert('Thank you for your feedback! 😊');
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg transition-all"
                  >
                    <span className="text-2xl">👍</span>
                    <span className="text-emerald-300 font-medium">Great!</span>
                  </button>
                  <button
                    onClick={async () => {
                      await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ feedback: 'negative' })
                      });
                      alert('Thank you for your feedback. We\'ll work on improvements! 🙏');
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/40 rounded-lg transition-all"
                  >
                    <span className="text-2xl">👎</span>
                    <span className="text-gray-700 font-medium">Needs work</span>
                  </button>
                </div>
              </div>

              {/* Added Tracks */}
              {addedTracks.length > 0 && (
                <details className="text-left text-sm mt-4">
                  <summary className="cursor-pointer font-semibold text-emerald-400 hover:text-emerald-300">
                    ✅ Successfully added ({addedTracks.length})
                  </summary>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700 max-h-48 overflow-y-auto">
                    {addedTracks.map((track, i) => (
                      <li key={i}>{track}</li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Skipped Tracks */}
              {skippedTracks.length > 0 && (
                <details className="text-left text-sm mt-2">
                  <summary className="cursor-pointer font-semibold text-amber-400 hover:text-amber-300">
                    ⚠️ Skipped (not found on YouTube) ({skippedTracks.length})
                  </summary>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700 max-h-48 overflow-y-auto">
                    {skippedTracks.map((track, i) => (
                      <li key={i}>{track}</li>
                    ))}
                  </ul>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer - Buy Me a Coffee */}
        <div className="text-center text-base space-y-4">
          <p className="text-green-700 font-medium text-lg">☕ Enjoying this tool?</p>
          <a
            href="https://buymeacoffee.com/rithviksj"
            className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-orange-900/30 hover:shadow-xl hover:shadow-orange-900/50 transition-all transform hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Buy me a coffee
          </a>
          <p className="text-green-700 font-medium">🌍 Share this app with friends and music lovers</p>
        </div>

        {/* Analytics - Visitor Counter, Playlist Counter & Map */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/20 border border-gray-300 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12">
            <VisitorCounter />
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <PlaylistCounter />
          </div>
          <VisitorMap />
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-400 space-y-3">
          <p className="text-sm text-gray-600 font-light">
            Designed & Developed by <span className="text-gray-800 font-semibold">Rithvik Javgal</span>
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Rithvik Javgal. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            <a
              href="https://github.com/rithviksj/bihag"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 underline"
            >
              Open Source
            </a>
            {" · "}
            <a
              href="mailto:rithviksj@gmail.com"
              className="hover:text-gray-700 underline"
            >
              Contact
            </a>
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
