import { BoardStat, TechRequest, Tech } from './types'

export const boardStats: BoardStat[] = [
  {
    board: 'Frontend',
    posts: 120,
    comments: 340,
    reports: 2,
    updatedAt: '2025-12-30',
  },
  {
    board: 'Backend',
    posts: 54,
    comments: 120,
    reports: 0,
    updatedAt: '2025-12-29',
  },
  {
    board: 'AI',
    posts: 12,
    comments: 340,
    reports: 2,
    updatedAt: '2025-12-30',
  },
  {
    board: 'Infrastructure',
    posts: 14,
    comments: 120,
    reports: 0,
    updatedAt: '2025-12-29',
  },
  {
    board: 'Cloud',
    posts: 63,
    comments: 340,
    reports: 2,
    updatedAt: '2025-12-30',
  },
  {
    board: 'Security',
    posts: 73,
    comments: 120,
    reports: 0,
    updatedAt: '2025-12-29',
  },
  {
    board: 'Product Management',
    posts: 74,
    comments: 340,
    reports: 2,
    updatedAt: '2025-12-30',
  },
  {
    board: 'UX/UI Design',
    posts: 99,
    comments: 120,
    reports: 0,
    updatedAt: '2025-12-29',
  },
]

export const techRequests: TechRequest[] = [
  {
    id: 'r1',
    name: 'Next.js',
    requestedBy: '주형',
    createdAt: '2025-12-30',
    status: 'pending',
  },
  {
    id: 'r2',
    name: 'Supabase',
    requestedBy: '주형2',
    createdAt: '2025-12-29',
    status: 'approved',
  },
]

export const techList: Tech[] = [
  {
    id: 't1',
    name: 'React',
    category: 'Frontend',
    createdAt: '2025-12-01',
  },
  {
    id: 't2',
    name: 'Next.js',
    category: 'Frontend',
    createdAt: '2025-12-02',
  },
]
