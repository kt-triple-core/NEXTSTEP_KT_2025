import Header from '@/widgets/header/ui/Header'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex h-dvh max-h-dvh w-full flex-col">
      <Header />
      {children}
    </main>
  )
}
