// src/app/layout.js

import "../components/styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bihag - Playlist Maker</title>
      </head>
      <body className="bg-gradient-to-br from-blue-100 via-white to-indigo-100 text-gray-800 font-serif antialiased">
        {children}
      </body>
    </html>
  );
}
