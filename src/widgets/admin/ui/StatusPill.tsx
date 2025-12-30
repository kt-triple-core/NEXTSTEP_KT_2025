export default function StatusPill({
  status,
}: {
  status: 'pending' | 'approved' | 'rejected'
}) {
  const label =
    status === 'pending' ? '대기' : status === 'approved' ? '승인' : '거절'

  const cls =
    status === 'approved'
      ? 'bg-[var(--color-accent)] text-white'
      : 'bg-background-light text-foreground'

  return (
    <span className={`text-12 rounded-full px-12 py-6 font-semibold ${cls}`}>
      {label}
    </span>
  )
}
