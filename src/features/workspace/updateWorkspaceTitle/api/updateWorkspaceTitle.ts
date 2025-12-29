import { api } from '@/shared/libs/axios'

interface updateWorkspaceTitleParams {
  workspaceId: string
  title: string
}

const updateWorkspaceTitle = async ({
  workspaceId,
  title,
}: updateWorkspaceTitleParams) => {
  // 워크스페이스 이름 업데이트
  const { data } = await api.patch(`/workspaces/${workspaceId}/title`, {
    title,
  })
  return data.content
}

export default updateWorkspaceTitle
