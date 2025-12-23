import { Button } from '@/shared/ui'
import { CustomNodeType } from '../model/types'
import { useState } from 'react'
import { formatKoreaTime } from '@/shared/libs/formatKoreaTime'
import Trash from '@/shared/ui/icon/Trash'
import { MemoForm } from '@/features/roadmap/postNodeMemo/ui'
import { LinkForm } from '@/features/roadmap/postNodeLink/ui'

interface NodeInformationProps {
  selectedNode: CustomNodeType
  handleTechEdit: () => void
}

const NodeInformationMenu = [
  { key: 'memo', label: '메모' },
  { key: 'link', label: '자료' },
  { key: 'troubleShooting', label: '트러블슈팅' },
]
const TROUBLE_SHOOTING = [
  {
    troubleShootingId: 4,
    troubleShooting: '트러블슈팅4',
    createdAt: '2025-12-20 05:34:43.326738+00',
  },
  {
    troubleShootingId: 3,
    troubleShooting: '트러블슈팅3',
    createdAt: '2025-12-20 05:34:43.326738+00',
  },
  {
    troubleShootingId: 2,
    troubleShooting: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: '2025-12-20 05:34:43.326738+00',
  },
  {
    troubleShootingId: 1,
    troubleShooting:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut cursus nibh eget lorem posuere finibus. Vestibulum sapien erat, cursus in rutrum a, varius non leo.',
    createdAt: '2025-12-20 05:34:43.326738+00',
  },
]

const NodeInformation = ({
  selectedNode,
  handleTechEdit,
}: NodeInformationProps) => {
  const [mode, setMode] = useState<string>(NodeInformationMenu[0].key)

  const [isLinkFormOpen, setIsLinkFormOpen] = useState<boolean>(false)
  const [links, setLinks] = useState<any[]>([])

  const [isTroubleShootingAddOpen, setIsTroubleShootingAddOpen] =
    useState<boolean>(false)
  const [troubleShooting, setTroubleShooting] =
    useState<any[]>(TROUBLE_SHOOTING)
  const [troubleShootingInput, setTroubleShootingInput] = useState<string>('')

  // 모드 변경
  const handleModeChange = (mode: string) => {
    // 모든 폼 초기화
    // initDataAdd()
    initTroubleShootingAdd()
    setMode(mode)
  }

  // 자료 삭제
  const handleDeleteLink = (id: number) => {
    setLinks(links.filter((link) => link.linkId !== id))
  }

  // 트러블슈팅 추가 초기화
  const initTroubleShootingAdd = () => {
    setTroubleShootingInput('')
    setIsTroubleShootingAddOpen(false)
  }
  // 트러블슈팅 추가
  const handleAddTroubleShooting = () => {
    setTroubleShooting([
      {
        troubleShootingId: troubleShooting.length + 1,
        troubleShooting: troubleShootingInput,
        createdAt: new Date().toISOString(),
      },
      ...troubleShooting,
    ])
    initTroubleShootingAdd()
  }
  // 트러블슈팅 삭제
  const handleDeleteTroubleShooting = (id: number) => {
    setTroubleShooting(
      troubleShooting.filter((item) => item.troubleShootingId !== id)
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* 기술 이름 및 편집 버튼 */}
      <div className="mb-10 flex items-center justify-between p-10">
        <div className="flex items-center gap-10">
          <img
            src={selectedNode.data.iconUrl}
            alt={selectedNode.data.label || ''}
            className="h-30 w-30 object-cover"
          />
          <p className="text-20">{selectedNode.data.label}</p>
        </div>
        <Button className="shrink-0 px-10 py-2" onClick={handleTechEdit}>
          변경
        </Button>
      </div>

      {/* navigation */}
      <div className="border-b-secondary border-b">
        <ul className="flex">
          {NodeInformationMenu.map((item) => (
            <li
              key={item.key}
              className={`text-14 box-content flex h-50 w-full items-center justify-center text-center ${item.key === mode && 'border-b-accent text-accent border-b-2 font-bold'} hover:cursor-pointer`}
              onClick={() => handleModeChange(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 탭별 항목 */}
      <div className="h-full p-10">
        {/* 메모 탭 */}
        {mode === 'memo' && <MemoForm techId={selectedNode.data.techId} />}

        {/* 자료 탭 */}
        {mode === 'link' && (
          <>
            {!isLinkFormOpen ? (
              <Button
                variant="accent"
                className="w-full py-10"
                onClick={() => setIsLinkFormOpen(true)}
              >
                추가하기
              </Button>
            ) : (
              <LinkForm
                techId={selectedNode.data.techId}
                handleCloseForm={() => setIsLinkFormOpen(false)}
                links={links}
                setLinks={setLinks}
              />
            )}
            {links.length > 0 && (
              <ul className="mt-10 flex flex-col gap-10">
                {links.map((link) => (
                  <li
                    key={link.linkId}
                    className="bg-secondary group flex justify-between gap-10 rounded-md p-10"
                  >
                    <div>
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent break-all underline hover:cursor-pointer"
                      >
                        {link.linkTitle}
                      </a>
                      <p className="text-12 text-foreground-light">
                        {link.linkUrl}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteLink(link.linkId)}
                    >
                      <Trash />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* 트러블슈팅 탭 */}
        {mode === 'troubleShooting' && (
          <>
            {!isTroubleShootingAddOpen ? (
              <>
                <Button
                  variant="accent"
                  className="w-full py-10"
                  onClick={() => setIsTroubleShootingAddOpen(true)}
                >
                  추가하기
                </Button>
                <ul className="mt-10 flex flex-col gap-10">
                  {troubleShooting.map((item) => (
                    <li
                      key={item.troubleShootingId}
                      className="bg-secondary group flex justify-between gap-10 rounded-md p-10"
                    >
                      <div>
                        <p className="text-12 mb-5">
                          {formatKoreaTime(item.createdAt, 'date')}
                        </p>
                        <div>{item.troubleShooting}</div>
                      </div>
                      <Button
                        variant="secondary"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() =>
                          handleDeleteTroubleShooting(item.troubleShootingId)
                        }
                      >
                        <Trash />
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex h-full flex-col">
                <textarea
                  value={troubleShootingInput}
                  onChange={(e) => setTroubleShootingInput(e.target.value)}
                  placeholder="문제 상황과 해결 방법을 기록하세요."
                  className="bg-background h-full w-full resize-none rounded-md p-10 outline-none"
                />
                <div className="mt-5 flex gap-5">
                  <Button
                    className="w-[calc(50%-2.5px)] py-8"
                    onClick={initTroubleShootingAdd}
                  >
                    취소
                  </Button>
                  <Button
                    variant="accent"
                    className="w-[calc(50%-2.5px)] py-8"
                    onClick={handleAddTroubleShooting}
                  >
                    추가
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NodeInformation
