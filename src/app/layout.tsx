import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './providers/ThemeProvider'
import AuthProvider from './providers/AuthProvider'
import ReactQueryProviders from './providers/ReactQueryProviders'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Next Step',
  description: 'AI-based learning roadmap service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
            `,
          }}
        />
      </head>

      <body>
        <ReactQueryProviders>
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
            <Toaster />
          </AuthProvider>
        </ReactQueryProviders>
      </body>
    </html>
  )
}
