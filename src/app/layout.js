console.log("🧠 Root layout loaded...");

export const metadata = {
  title: "Bihag",
  description: "Banger playlist maker for classy souls",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
