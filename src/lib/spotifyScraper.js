import SpotifyUrlInfo from "spotify-url-info";

// spotify-url-info uses Spotify's server-rendered HTML — no API credentials,
// no developer account, no Premium subscription required.
const { getTracks, getData } = SpotifyUrlInfo(fetch);

/**
 * Returns true if the given URL is a Spotify playlist link.
 */
export function isSpotifyPlaylistUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "open.spotify.com" &&
      parsed.pathname.startsWith("/playlist/")
    );
  } catch {
    return false;
  }
}

/**
 * Fetches all tracks in a public Spotify playlist without any API credentials.
 *
 * Uses spotify-url-info which parses Spotify's server-rendered HTML.
 * The "Recommended" section shown in the Spotify UI is never part of the
 * playlist data and is automatically excluded.
 *
 * @param {string} url - A Spotify playlist URL
 * @returns {Promise<{songs: Array, count: number, playlistName: string, error?: string}>}
 */
export async function scrapeSpotifyPlaylist(url) {
  try {
    // Fetch playlist name and all tracks in parallel
    const [tracks, meta] = await Promise.all([
      getTracks(url),
      getData(url).catch(() => null), // metadata is best-effort
    ]);

    if (!tracks || tracks.length === 0) {
      return {
        songs: [],
        count: 0,
        playlistName: meta?.title || "",
        error: "No playable tracks found in this playlist.",
      };
    }

    const songs = tracks
      .filter((t) => t && t.name) // skip nulls
      .map((t) => ({
        title: t.name,
        artist: t.artist || "",
        combined: t.artist ? `${t.artist} - ${t.name}` : t.name,
      }));

    return {
      songs,
      count: songs.length,
      playlistName: meta?.title || "",
    };
  } catch (err) {
    console.error("Spotify scraper error:", err);

    // Give the user a meaningful message for private playlists
    const msg = err.message || "";
    if (msg.includes("403") || msg.includes("private")) {
      return {
        songs: [],
        count: 0,
        playlistName: "",
        error: "This playlist is private. Only public playlists are supported.",
      };
    }
    if (msg.includes("404") || msg.includes("not found")) {
      return {
        songs: [],
        count: 0,
        playlistName: "",
        error: "Spotify playlist not found. Check that the URL is correct.",
      };
    }

    return {
      songs: [],
      count: 0,
      playlistName: "",
      error: "Failed to fetch Spotify playlist. Please try again.",
    };
  }
}
