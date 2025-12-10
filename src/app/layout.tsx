import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './providers/ThemeProvider'
import AuthProviders from '@/features/login/AuthProvider'

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
        <AuthProviders>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProviders>
      </body>
    </html>
  )
}
