import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './providers/ThemeProvider'
import AuthProvider from './providers/AuthProvider'
import ReactQueryProviders from './providers/ReactQueryProviders'

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
        <ReactQueryProviders>
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </ReactQueryProviders>
      </body>
    </html>
  )
}
