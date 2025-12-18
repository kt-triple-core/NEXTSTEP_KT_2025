export default function CommunityCommentInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="border-border flex items-end gap-12 rounded-xl border bg-[var(--color-foreground-light)] p-16">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="댓글을 입력하세요"
        className="flex-1 resize-none bg-transparent text-sm outline-none"
      />

      <button
        onClick={onSubmit}
        className="rounded-md bg-[var(--color-accent)] px-16 py-8 text-sm text-white"
      >
        등록
      </button>
    </div>
  )
}
