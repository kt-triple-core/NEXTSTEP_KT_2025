import { CustomNode } from './types'

export const NODE_STYLE = {
  default: {
    background: 'var(--color-primary)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    fontSize: '12px',
    border: '1px solid var(--color-primary)',
  },
  selected: {
    border: '1px solid var(--color-accent)',
  },
}

export const initialNodes: CustomNode[] = [
  {
    id: '1',
    data: { label: 'Start' },
    position: { x: 0, y: 0 },
    style: { ...NODE_STYLE.default },
  },
]
