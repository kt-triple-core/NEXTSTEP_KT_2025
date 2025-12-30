export type BoardStat = {
  board: string
  posts: number
  comments: number
  reports: number
  updatedAt: string
}

export type TechRequest = {
  id: string
  name: string
  requestedBy: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export type Tech = {
  id: string
  name: string
  category: string
  createdAt: string
}
