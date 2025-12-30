import { AdminTab } from './Admin'

export default function AdminTabs({
  tab,
  onChange,
}: {
  tab: AdminTab
  onChange: (t: AdminTab) => void
}) {
  return (
    <div className="border-border flex gap-10 border-b">
      <Tab active={tab === 'board'} onClick={() => onChange('board')}>
        게시판 데이터
      </Tab>
      <Tab active={tab === 'requests'} onClick={() => onChange('requests')}>
        기술 스택 요청
      </Tab>
      <Tab active={tab === 'techs'} onClick={() => onChange('techs')}>
        기술 스택 관리
      </Tab>
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-14 px-16 py-10 font-semibold ${
        active
          ? 'text-foreground border-b-2 border-[var(--color-accent)]'
          : 'text-foreground-light'
      }`}
    >
      {children}
    </button>
  )
}
