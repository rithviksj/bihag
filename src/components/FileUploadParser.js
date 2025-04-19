"use client";

import React from "react";

export default function FileUploadParser({ onTracksParsed }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(reader.result, "text/html");

      const rows = doc.querySelectorAll("tr[data-track-position]");
      const tracks = [];

      rows.forEach((row) => {
        const artistTags = row.querySelectorAll("td.artist__Aq2S a");
        const artist = [...artistTags].map((a) => a.textContent.trim()).join(", ");
        const title = row.querySelector("td.trackTitleWithArtist_igX0j span")?.textContent?.trim();
        if (artist && title) {
          tracks.push(`${artist} - ${title}`);
        }
      });

      if (tracks.length > 0) {
        onTracksParsed(tracks.join("\\n"));
      } else {
        alert("No tracks found in this file.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Upload HTML Tracklist</label>
      <input type="file" accept=".html" onChange={handleFile} />
    </div>
  );
}
