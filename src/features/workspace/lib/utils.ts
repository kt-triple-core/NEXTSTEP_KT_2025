export const deselectAllNodes = <
  T extends { selected?: boolean; style?: React.CSSProperties },
>(
  nodes: T[]
): T[] => {
  return nodes.map((node) => ({
    ...node,
    selected: false,
    style: { ...node.style, border: '1px solid  var(--color-primary)' },
  }))
}
