import { CustomNodeType } from './types'

export const START_NODE_STYLE = {
  default: {
    background: 'var(--color-primary)',
    borderRadius: '8px',
    fontSize: '12px',
    border: '1px solid var(--color-primary)',
    width: '80px',
    height: '30px',
  },
}

export const NODE_STYLE = {
  default: {
    background: 'var(--color-primary)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    fontSize: '12px',
    border: '1px solid var(--color-primary)',
    width: 'auto',
    minWidth: '80px',
    height: '40px',
    padding: '0px 10px',
  },
  selected: {
    border: '1px solid var(--color-accent)',
  },
}

export const initialNodes: CustomNodeType[] = [
  {
    id: '1',
    data: { techId: 'start', label: 'Start' },
    position: { x: 0, y: 0 },
    style: { ...START_NODE_STYLE.default },
  },
]
