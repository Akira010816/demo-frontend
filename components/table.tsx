import React, { ReactElement } from 'react'
import { Col, Space, Table as ADTable } from 'antd'
import { TableProps as ADTableProps } from 'antd/lib/table'
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'

// eslint-disable-next-line @typescript-eslint/ban-types
export type TableProps<T extends object> = {
  addable?: boolean
  onAddRow?: (row: T | undefined, index: number) => void
  onDeleteRow?: (row: T | undefined, index: number) => void
  width?: string
  extraSmall?: boolean
  showFullWithAddble?: boolean
} & ADTableProps<T>

// eslint-disable-next-line @typescript-eslint/ban-types
const Table = <T extends object>({
  addable,
  onAddRow,
  onDeleteRow,
  bordered = true,
  showFullWithAddble,
  ...props
}: TableProps<T>): ReactElement => {
  const columns: ColumnsType<T> | undefined = !addable
    ? props.columns
    : props.columns
    ? [
        ...props.columns,
        {
          title: (
            <div
              style={
                !showFullWithAddble
                  ? { backgroundColor: 'white' }
                  : { backgroundColor: 'white', borderBottom: 'none' }
              }
            />
          ),
          key: 'addables',
          fixed: 'right',
          render: (_, __, index) => {
            const isLast =
              props.dataSource?.length === 1 || index === (props.dataSource?.length ?? 0) - 1
            const hasOnlyOne = props.dataSource && props.dataSource.length === 1

            return {
              props: {
                style: !showFullWithAddble
                  ? {
                      backgroundColor: 'white',
                      width: '60px',
                    }
                  : {
                      backgroundColor: 'white',
                      width: '60px',
                      borderBottom: 'none',
                    },
                className: 'addable-controls',
              },
              children: (
                <Col key={`addable-${index}`} span={4}>
                  <Space>
                    <PlusSquareOutlined
                      style={{
                        fontSize: '25px',
                        cursor: 'pointer',
                        pointerEvents: isLast ? 'initial' : 'none',
                        opacity: isLast ? 1 : 0,
                      }}
                      onClick={() => {
                        onAddRow?.(props.dataSource?.[index], index)
                      }}
                    />
                    <MinusSquareOutlined
                      style={{
                        fontSize: '25px',
                        cursor: 'pointer',
                        pointerEvents: hasOnlyOne ? 'none' : 'initial',
                        opacity: hasOnlyOne ? 0 : 1,
                      }}
                      onClick={() => {
                        onDeleteRow?.(props.dataSource?.[index], index)
                      }}
                    />
                  </Space>
                </Col>
              ),
            }
          },
        },
      ]
    : []

  return (
    <div className={`p2table ${addable ? 'addable' : ''} ${props.extraSmall ? 'extraSmall' : ''}`}>
      <style jsx>{`
        .p2table {
          width: ${props.width || '100%'};
        }
        .p2table :global(th.ant-table-cell.ant-table-cell-ellipsis) {
          background-color: #1a77d4;
        }
        .p2table :global(th.ant-table-cell) {
          background-color: #1a77d4;
        }
        .p2table :global(.ant-table-wrapper .ant-table-column-sorters) {
          padding: 0;
        }
        .p2table :global(.ant-table-wrapper .ant-table-container) {
          border: 0;
          ${bordered ? 'border-left: 1px solid rgb(223, 223, 223);' : ''}
          border-radius: 0;
        }
        .p2table :global(.ant-table-wrapper .ant-table .ant-table-container table) {
          border-radius: 0;
        }
        .p2table
          :global(.ant-table-wrapper .ant-table-container .ant-table-content table thead tr th) {
          height: 32px;
          font-weight: normal;
          text-align: center;
          padding: 0;
          border-color: rgb(223, 223, 223);
          border-top-width: 1px;
          border-top-style: solid;
        }
        .p2table :global(.ant-table-cell) {
          border-color: rgb(223, 223, 223) !important;
          ${bordered ? '' : 'border: none;'}
        }
        .p2table :global(th.ant-table-cell) {
          ${bordered ? 'border-top: 1px solid rgb(223, 223, 223);' : 'border: none;'}
        }
        .p2table :global(.ant-table-cell .ant-row) {
          overflow-y: scroll;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .p2table :global(.ant-table-cell .ant-row::-webkit-scrollbar) {
          display: none;
        }
        .p2table
          :global(.ant-table.ant-table-bordered
            > .ant-table-container
            > .ant-table-content
            > table
            > thead
            > tr
            > th:last-child) {
          border-right-color: rgba(223, 223, 223);
        }
        .p2table :global(.ant-table-row.inactive),
        .p2table :global(.ant-table-row.inactive:hover > td) {
          background: #f4f4f4;
        }
        .p2table.addable
          :global(.ant-table.ant-table-bordered
            > .ant-table-container
            > .ant-table-content
            > table
            > thead
            > tr
            > th:nth-last-child(2)) {
          border-right: 1px solid rgb(223, 223, 223) !important;
        }
        .p2table.addable :global(.ant-table-container table > tbody > tr > td:nth-last-child(2)) {
          border-right: 1px solid rgb(223, 223, 223) !important;
        }
        ${showFullWithAddble
          ? ''
          : `.p2table.addable
          :global(.ant-table-container table > thead > tr:first-child th:last-child) {
          background-color: white !important;
          border-bottom: 0 !important;
          border-right: 0 !important;
          border-top: 0 !important;
        }`}
        .p2table.addable :global(.ant-table-cell.addable-controls) {
          border-right: 0 !important;
        }
        .p2table.extraSmall
          :global(.ant-table.ant-table-bordered
            > .ant-table-container
            > .ant-table-content
            > table
            > tbody
            > tr
            > td) {
          padding: 2px 8px;
        }
      `}</style>
      <ADTable {...props} style={{ whiteSpace: 'pre' }} columns={columns} bordered={bordered}>
        {props.children}
      </ADTable>
    </div>
  )
}
export default Table
