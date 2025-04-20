import '../styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bihag',
  description: 'The App you never knew you needed but always deserved.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}