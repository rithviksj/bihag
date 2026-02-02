import "@/styles/globals.css";

export const metadata = {
  title: "Bihag - Turn Radio Playlists into YouTube Collections",
  description:
    "Transform radio station playlists into beautiful YouTube playlists effortlessly. Discover new music and create collections from your favorite radio stations.",
  keywords: [
    "radio playlist",
    "YouTube playlist",
    "music converter",
    "playlist generator",
    "radio to YouTube",
    "music playlist maker",
    "Billboard charts",
    "music charts",
  ],
  authors: [{ name: "Rithvik Javgal", url: "https://buymeacoffee.com/rithviksj" }],
  creator: "Rithvik Javgal",
  publisher: "Bihag",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://bihag.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bihag - Turn Radio Playlists into YouTube Collections",
    description:
      "Transform radio station playlists into beautiful YouTube playlists effortlessly. The app you never knew you needed but always deserved.",
    url: "/",
    siteName: "Bihag",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png", // You can create this later
        width: 1200,
        height: 630,
        alt: "Bihag - Radio to YouTube Playlist Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bihag - Turn Radio Playlists into YouTube Collections",
    description:
      "Transform radio station playlists into beautiful YouTube playlists effortlessly.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0891b2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
      </head>
      <body
        className="bg-[#D3D3D3] text-gray-100 font-sans antialiased"
        style={{
          backgroundImage: 'url(/music-pattern.svg)',
          backgroundSize: '600px 600px',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
          backgroundBlendMode: 'overlay'
        }}
      >
        {children}
      </body>
    </html>
  );
}
