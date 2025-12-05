import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'Next Step',
  description: 'AI-based learning roadmap service',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
