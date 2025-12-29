import { Button } from '@/shared/ui'
import { CustomNodeType } from '../model/types'
import { useState } from 'react'
import { formatKoreaTime } from '@/shared/libs/formatKoreaTime'
import { MemoForm } from '@/features/roadmap/postNodeMemo/ui'
import { LinkForm } from '@/features/roadmap/postNodeLink/ui'
import { TroubleshootingForm } from '@/features/roadmap/postNodeTroubleshooting/ui'
import { useWorkspaceStore } from '../model'
import { DeleteNodeLinkButton } from '@/features/roadmap/deleteNodeLink/ui'
import DeleteNodeTroubleshootingButton from '@/features/roadmap/deleteNodeTroubleshooting/ui/DeleteNodeLinkButton'

interface NodeInformationProps {
  selectedNode: CustomNodeType
  handleEditTech: () => void
}

const NodeInformationMenu = [
  { key: 'memo', label: '메모' },
  { key: 'link', label: '자료' },
  { key: 'troubleshooting', label: '트러블슈팅' },
]

const NodeInformation = ({
  selectedNode,
  handleEditTech,
}: NodeInformationProps) => {
  const [mode, setMode] = useState<string>(NodeInformationMenu[0].key)
  const getNodeLinks = useWorkspaceStore((s) => s.getNodeLinks)
  const getNodeTroubleshootings = useWorkspaceStore(
    (s) => s.getNodeTroubleshootings
  )

  const [isLinkFormOpen, setIsLinkFormOpen] = useState<boolean>(false)
  const links = getNodeLinks(selectedNode.data.techId)

  const [isTroubleshootingFormOpen, setIsTroubleshootingFormOpen] =
    useState<boolean>(false)
  const troubleshootings = getNodeTroubleshootings(selectedNode.data.techId)

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
        <Button className="shrink-0 px-10 py-2" onClick={handleEditTech}>
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
              onClick={() => setMode(item.key)}
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
              />
            )}
            {links.length > 0 && (
              <ul className="mt-10 flex flex-col gap-10">
                {links.map((link) => (
                  <li
                    key={link.nodeLinkId}
                    className="bg-secondary group flex justify-between gap-10 rounded-md p-10"
                  >
                    <div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent break-all underline hover:cursor-pointer"
                      >
                        {link.title}
                      </a>
                      <p className="text-12 text-foreground-light">
                        {link.url}
                      </p>
                    </div>
                    <DeleteNodeLinkButton
                      techId={selectedNode.data.techId}
                      nodeLinkId={link.nodeLinkId}
                      links={links}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* 트러블슈팅 탭 */}
        {mode === 'troubleshooting' && (
          <>
            {!isTroubleshootingFormOpen ? (
              <>
                <Button
                  variant="accent"
                  className="w-full py-10"
                  onClick={() => setIsTroubleshootingFormOpen(true)}
                >
                  추가하기
                </Button>
                <ul className="mt-10 flex flex-col gap-10">
                  {troubleshootings.map((item) => (
                    <li
                      key={item.nodeTroubleshootingId}
                      className="bg-secondary group flex justify-between gap-10 rounded-md p-10"
                    >
                      <div>
                        <p className="text-12 mb-5">
                          {formatKoreaTime(item.createdAt, 'date')}
                        </p>
                        <div>{item.troubleshooting}</div>
                      </div>
                      <DeleteNodeTroubleshootingButton
                        techId={selectedNode.data.techId}
                        nodeTroubleshootingId={item.nodeTroubleshootingId}
                        troubleshootings={troubleshootings}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <TroubleshootingForm
                techId={selectedNode.data.techId}
                handleCloseForm={() => setIsTroubleshootingFormOpen(false)}
                troubleshootings={troubleshootings}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NodeInformation
