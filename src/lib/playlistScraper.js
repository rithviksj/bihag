import * as cheerio from "cheerio";

/**
 * Generic playlist scraper that attempts to extract songs from various HTML structures
 * @param {string} html - The HTML content to parse
 * @returns {Array<{title: string, artist: string, combined: string}>} - Array of song objects
 */
export function parseSongsFromHTML(html) {
  const $ = cheerio.load(html);
  let songs = [];

  // Strategy 1: Look for JSON-LD structured data (schema.org MusicPlaylist)
  try {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data["@type"] === "MusicPlaylist" && data.track) {
          data.track.forEach((track) => {
            const title = track.name || "";
            const artist = track.byArtist?.name || "";
            if (title && isValidSong(title)) {
              songs.push({
                title,
                artist,
                combined: artist ? `${artist} - ${title}` : title,
              });
            }
          });
        }
      } catch (e) {
        // Ignore invalid JSON
      }
    });
  } catch (e) {
    console.error("JSON-LD parsing error:", e);
  }

  // Strategy 2: Look for table structures with song/artist columns
  if (songs.length === 0) {
    $("table").each((_, table) => {
      $(table)
        .find("tr")
        .each((_, row) => {
          const cols = $(row).find("td");

          // Pattern: 4 columns (rank, artist, title, other)
          if (cols.length === 4) {
            const artist = $(cols[1]).text().replace(/–/g, "").trim();
            const title = $(cols[2]).text().trim();
            if (artist && title && isValidSong(`${artist} - ${title}`)) {
              songs.push({
                title,
                artist,
                combined: `${artist} - ${title}`,
              });
            }
          }

          // Pattern: 2-3 columns (artist, title) or (title, artist)
          if (cols.length >= 2 && cols.length <= 3) {
            const col1 = $(cols[0]).text().trim();
            const col2 = $(cols[1]).text().trim();

            // Try both orders
            if (col1 && col2 && isValidSong(`${col1} - ${col2}`)) {
              songs.push({
                title: col2,
                artist: col1,
                combined: `${col1} - ${col2}`,
              });
            }
          }
        });
    });
  }

  // Strategy 3: Look for specific class names (common patterns)
  if (songs.length === 0) {
    const selectors = [
      ".tracklist_track_title",
      ".song-title",
      ".track-title",
      ".playlist-item",
      ".song",
      ".track",
      '[data-track-position]',
      ".o-chart-results-list__item > h3",
    ];

    selectors.forEach((selector) => {
      $(selector).each((_, el) => {
        const $el = $(el);
        let title = $el.text().trim();
        let artist = "";

        // Look for artist in sibling or parent elements
        const $artist = $el.next().length
          ? $el.next()
          : $el.find(".artist, .track-artist, [class*='artist']").first();

        if ($artist.length) {
          artist = $artist.text().trim();
        }

        // For data-track-position rows (Spotify-like structure)
        if (selector === '[data-track-position]') {
          const artistTags = $el.find("td.artist a, [class*='artist'] a");
          artist = Array.from(artistTags)
            .map((a) => $(a).text().trim())
            .join(", ");
          const titleEl = $el.find(
            "td.trackTitle span, [class*='trackTitle'] span"
          );
          title = titleEl.text().trim();
        }

        const combined = artist ? `${artist} - ${title}` : title;
        if (title && isValidSong(combined)) {
          songs.push({ title, artist, combined });
        }
      });
    });
  }

  // Strategy 4: Look for lists (ul/ol) with "Artist - Song" format
  if (songs.length === 0) {
    $("ul li, ol li").each((_, li) => {
      const text = $(li).text().trim();

      // Pattern: "Artist - Song" or "Song - Artist"
      if (text.includes("-")) {
        const parts = text.split("-");
        if (parts.length === 2) {
          const [part1, part2] = parts.map((p) => p.trim());

          // Heuristic: If first part is longer, it's probably the title
          if (part1 && part2 && isValidSong(text)) {
            if (part1.length > part2.length) {
              songs.push({
                title: part1,
                artist: part2,
                combined: `${part2} - ${part1}`,
              });
            } else {
              songs.push({
                title: part2,
                artist: part1,
                combined: `${part1} - ${part2}`,
              });
            }
          }
        }
      }
    });
  }

  // Strategy 5: Look for heading + paragraph patterns (h3 + p, etc.)
  if (songs.length === 0) {
    $("h3, h4, h2").each((_, heading) => {
      const title = $(heading).text().trim();
      const $next = $(heading).next();
      const artist = $next.is("p, span, div") ? $next.text().trim() : "";

      const combined = artist ? `${artist} - ${title}` : title;
      if (title && isValidSong(combined)) {
        songs.push({ title, artist, combined });
      }
    });
  }

  // Deduplicate songs based on normalized text
  const normalized = new Map();
  songs.forEach((song) => {
    const norm = normalizeText(song.combined);
    if (!normalized.has(norm)) {
      normalized.set(norm, song);
    }
  });

  return Array.from(normalized.values());
}

/**
 * Normalize text for comparison (lowercase, remove special chars)
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate if a string looks like a song (filter out menu items, CSS, etc.)
 */
function isValidSong(text) {
  if (!text || text.length < 3) return false;
  if (!/[a-zA-Z]/.test(text)) return false;
  if (text.includes(".css") || text.includes(".js")) return false;
  if (text.match(/^{.*}$/)) return false; // JSON
  if (text.match(/^<.*>$/)) return false; // HTML tags
  if (
    text.match(
      /^(menu|navigation|header|footer|copyright|privacy|terms|login|signup|subscribe)/i
    )
  )
    return false;
  if (
    text.match(
      /^(End Charts|Chart Beat|Features|Noticias|Get Up|Honda Music|Listen Live|Buy Tickets)/i
    )
  )
    return false;

  return true;
}

/**
 * Scrape a radio station URL and return songs
 * @param {string} url - The URL to scrape
 * @returns {Promise<{songs: Array, count: number, error?: string}>}
 */
export async function scrapePlaylist(url) {
  try {
    // Validate URL
    if (!url || typeof url !== "string") {
      return { songs: [], count: 0, error: "Invalid URL provided" };
    }

    // Basic URL validation
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (e) {
      return { songs: [], count: 0, error: "Invalid URL format" };
    }

    // Only allow http/https protocols
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      return {
        songs: [],
        count: 0,
        error: "Only HTTP/HTTPS URLs are supported",
      };
    }

    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Bihag/2.0; +https://bihag.vercel.app)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return {
        songs: [],
        count: 0,
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();

    // Parse songs from HTML
    const allSongs = parseSongsFromHTML(html);

    if (allSongs.length === 0) {
      return {
        songs: [],
        count: 0,
        error: "No songs found on this page. Please check the URL or try a different page.",
      };
    }

    // Limit to top 20 (or all if less than 20)
    const songs = allSongs.slice(0, Math.min(20, allSongs.length));

    return {
      songs,
      count: songs.length,
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      songs: [],
      count: 0,
      error: error.message || "Failed to scrape playlist",
    };
  }
}
