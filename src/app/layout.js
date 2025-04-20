"use client";

import "@/styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Bihag • Lo-fi Playlist Maker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#e0e7ff] text-gray-800 min-h-screen font-serif">
        {children}
      </body>
    </html>
  );
}