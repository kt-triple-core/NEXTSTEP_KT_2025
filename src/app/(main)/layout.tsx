import Header from '@/widgets/header/ui/Header'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-dvh max-h-dvh w-full flex-col">
      <Header />
      <main className="h-full w-full">{children}</main>
    </div>
  )
}
