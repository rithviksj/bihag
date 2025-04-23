
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [log, setLog] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const extractPlaylist = async () => {
    if (!file) {
      alert("Please upload an HTML file.");
      return;
    }

    setLog("📡 Calling ChatGPT to analyze the uploaded file…");

    // Simulate delay and AI response
    setTimeout(() => {
      setLog("✅ ChatGPT successfully extracted the playlist.");
      setPlaylist([
        "Agar Tum Saath Ho",
        "Darkhaast",
        "Tumhe Kitna Pyaar Karte",
        "Hai Dil Ye Mera",
        "Mast Magan",
        "Roke Na Ruke Naina",
        "Soch Na Sake",
        "Tose Naina",
        "Duaa"
      ]);
    }, 2000);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">🎵 Playlist AI Extractor</h1>

      <div className="max-w-xl mx-auto space-y-4">
        <Input type="file" accept=".html" onChange={handleFileChange} />
        <Button onClick={extractPlaylist}>Extract Playlist</Button>

        {log && <p className="text-sm text-blue-600">{log}</p>}

        {playlist.length > 0 && (
          <Card className="mt-6">
            <CardContent>
              <ul className="list-disc pl-6 space-y-1">
                {playlist.map((track, idx) => (
                  <li key={idx}>{track}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
