import { MarkerType, Node, Edge } from '@xyflow/react'

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

export const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: '루트 노드' },
    position: { x: 0, y: 0 },
    style: { ...NODE_STYLE.default },
  },
  {
    id: '2',
    data: { label: '자식 노드 1' },
    position: { x: 0, y: 0 },
    style: { ...NODE_STYLE.default },
  },
  {
    id: '3',
    data: { label: '자식 노드 2' },
    position: { x: 0, y: 0 },
    style: { ...NODE_STYLE.default },
  },
]

export const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'default',
    animated: true,
    style: { stroke: EDGE_STYLE.stroke, strokeWidth: EDGE_STYLE.strokeWidth },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_STYLE.markerEndColor,
    },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'default',
    animated: true,
    style: { stroke: EDGE_STYLE.stroke, strokeWidth: EDGE_STYLE.strokeWidth },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_STYLE.markerEndColor,
    },
  },
]
