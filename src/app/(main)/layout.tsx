import Header from '@/widgets/header/ui/Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-dvh w-full overflow-hidden">
      {/* Header (고정) */}
      <header className="fixed top-0 left-0 z-50 h-80 w-full">
        <Header />
      </header>

      {/* Content 영역 */}
      <main
        className="w-full overflow-y-auto"
        style={{
          marginTop: '80px', // 헤더 높이
          height: 'calc(100dvh - 80px)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
