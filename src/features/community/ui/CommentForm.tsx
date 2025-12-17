// features/comment/ui/CommentForm.tsx
'use client'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  rows?: number
  buttonText?: string
}

const CommentForm = ({
  value,
  onChange,
  onSubmit,
  placeholder = '댓글을 입력하세요',
  rows = 3,
  buttonText = '댓글 작성',
}: Props) => {
  return (
    <div className="bg-secondary flex flex-col gap-8 rounded-lg p-12">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-primary text-foreground w-full resize-none rounded-lg border-none p-12 text-sm outline-none"
        rows={rows}
      />
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          className="bg-primary text-foreground hover:bg-primary/70 rounded-lg px-16 py-8 text-sm font-medium transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default CommentForm
