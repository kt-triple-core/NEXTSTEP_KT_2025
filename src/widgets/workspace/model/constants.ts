import { CustomNode } from './types'

export const NODE_STYLE = {
  default: {
    background: 'var(--color-primary)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    fontSize: '12px',
    border: '2px solid var(--color-primary)',
  },
  selected: {
    border: '2px solid var(--color-accent)',
  },
}

export const EDGE_STYLE = {
  stroke: 'var(--foreground)',
  strokeWidth: 1,
  markerEndColor: 'var(--foreground)',
}

export const initialNodes: CustomNode[] = [
  {
    id: '1',
    data: { label: 'Start' },
    position: { x: 0, y: 0 },
    style: { ...NODE_STYLE.default },
  },
]
