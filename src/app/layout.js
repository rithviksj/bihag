// src/app/layout.js
import "../components/styles/globals.css";

export const metadata = {
  title: "Bihag · Lo-fi Playlist Maker",
  description: "Turn curated tracklists into elegant YouTube playlists — effortlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f9fafb" />
      </head>
      <body className="bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#e0e7ff] font-serif text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
