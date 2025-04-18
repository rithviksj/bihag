export const metadata = {
  title: "Bihag",
  description: "Banger playlist maker for classy souls",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        {children}
      </body>
    </html>
  );
}
