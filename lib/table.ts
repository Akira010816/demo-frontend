import { RowProps } from 'antd/es/grid'

const parentElement = (element: (Node & ParentNode) | null): (Node & ParentNode) | null => {
  let current = element
  while (current) {
    current = current.parentNode
    if (current?.nodeName === 'TR') {
      return current
    }
  }
  return null
}

export const onTableInputFocus = (tableSelector: string): RowProps['onFocus'] => ({ target }) => {
  const parentTr = parentElement(target)
  if (!parentTr) return

  const rect = target.getBoundingClientRect()
  const fixedLeftColumns = parentTr.querySelectorAll('.ant-table-cell-fix-left')
  const fixedLeftsWidth = [...fixedLeftColumns].reduce((acc, left) => acc + left.clientWidth, 0)
  const tableContent = document.querySelector(`${tableSelector} .ant-table-content`)
  const fixedRect = fixedLeftColumns?.[0]?.getBoundingClientRect()

  if (!fixedRect || rect.right <= fixedRect.left) return

  const scrollOffset = fixedRect?.left - rect.right
  if (tableContent) {
    tableContent.scrollLeft -= scrollOffset + fixedLeftsWidth * 2 - target.clientWidth
  }
}
