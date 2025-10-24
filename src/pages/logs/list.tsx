import React, { useState, useEffect } from 'react'
import { List, useTable } from '@refinedev/antd'
import { Table, Space, Select, Input, Tag, Form, Descriptions, Typography, Button } from 'antd'
import { CrudFilters } from '@refinedev/core'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Log } from '../../types'

const { Paragraph, Title } = Typography

const LOG_LEVEL_COLORS: Record<string, string> = {
  error: 'red',
  warn: 'orange',
  info: 'blue',
  debug: 'gray'
}

export const LogList: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false)

  const { tableProps, searchFormProps, tableQueryResult, setFilters, filters } = useTable<Log>({
    resource: 'logs',
    pagination: {
      pageSize: 1000
    },
    onSearch: (values: any): CrudFilters => {
      const filters: CrudFilters = []

      if (values.level) {
        filters.push({ field: 'level', operator: 'eq', value: values.level } as const)
      }

      if (values.search) {
        filters.push({ field: 'search', operator: 'eq', value: values.search } as const)
      }

      if (values.userId) {
        filters.push({ field: 'userId', operator: 'eq', value: values.userId } as const)
      }

      if (values.dateRange) {
        filters.push({ field: 'startDate', operator: 'eq', value: values.dateRange[0].toISOString() } as const)
        filters.push({ field: 'endDate', operator: 'eq', value: values.dateRange[1].toISOString() } as const)
      }

      return filters
    }
  })

  // Pre-fill userId from URL parameter
  useEffect(() => {
    const userIdParam = searchParams.get('userId')
    if (userIdParam && searchFormProps?.form && !hasProcessedUrlParam) {
      searchFormProps.form.setFieldsValue({ userId: userIdParam })
      searchFormProps.form.submit()
      setHasProcessedUrlParam(true)
      // Remove the parameter from URL after using it
      setSearchParams({})
    }
  }, [searchParams, searchFormProps?.form, hasProcessedUrlParam, setSearchParams])

  const toggleExpanded = (recordId: string) => {
    setExpandedRowKeys((prev) => {
      if (prev.includes(recordId)) {
        return prev.filter((key) => key !== recordId)
      }
      return [...prev, recordId]
    })
  }

  const formatDate = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const clearFilter = (fieldName: string) => {
    searchFormProps?.form?.resetFields([fieldName])
    const newFilters = filters.filter(f => f.field !== fieldName)
    setFilters(newFilters, 'replace')
  }

  const ClearIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <span
      style={{
        cursor: 'pointer',
        padding: '0 8px',
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'color 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#ff0000'}
      onMouseLeave={(e) => e.currentTarget.style.color = ''}
      onClick={onClick}
    >×</span>
  )

  const expandedRowRender = (record: Log) => (
    <div>
      <Descriptions size="small" column={2} bordered style={{ fontSize: '12px', marginBottom: 16 }}>
        <Descriptions.Item label="Log ID">{record._id}</Descriptions.Item>
        <Descriptions.Item label="User ID">
          {record.userId ? (
            <a
              href={`/users/show/${record.userId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1890ff' }}
            >
              {record.userId}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
      </Descriptions>
      <Paragraph style={{ margin: 0 }}>
        <pre style={{ margin: 0, fontSize: '11px', backgroundColor: '#1f1f1f', padding: '12px', borderRadius: '4px' }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      </Paragraph>
    </div>
  )

  return (
    <List title={<Title level={2}>Logs</Title>}>
      <Form {...searchFormProps} layout="inline" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Form.Item name="level">
            <Select
              placeholder="Filter by level"
              allowClear
              style={{ width: 150 }}
              clearIcon={<ClearIcon onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                clearFilter('level')
              }} />}
              onChange={(value) => {
                if (value) {
                  searchFormProps?.form?.submit()
                } else {
                  clearFilter('level')
                }
              }}
            >
              <Select.Option value="error">Error</Select.Option>
              <Select.Option value="warn">Warn</Select.Option>
              <Select.Option value="info">Info</Select.Option>
              <Select.Option value="debug">Debug</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="search">
            <Input.Search
              placeholder="Search message"
              style={{ width: 300 }}
              onSearch={() => searchFormProps?.form?.submit()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  clearFilter('search')
                }
              }}
              allowClear={{
                clearIcon: <ClearIcon onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  clearFilter('search')
                }} />
              }}
            />
          </Form.Item>

          <Form.Item name="userId">
            <Input
              placeholder="User ID"
              style={{ width: 200 }}
              onPressEnter={() => searchFormProps?.form?.submit()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  clearFilter('userId')
                }
              }}
              allowClear={{
                clearIcon: <ClearIcon onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  clearFilter('userId')
                }} />
              }}
            />
          </Form.Item>
        </Space>
      </Form>

      <Table
        {...tableProps}
        rowKey="_id"
        size="small"
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            toggleExpanded(record._id)
          }
        }}
        onRow={(record) => ({
          onClick: (e) => {
            // Don't expand if clicking on a link or button
            const target = e.target as HTMLElement
            if (target.tagName === 'A' || target.closest('a') || target.tagName === 'BUTTON' || target.closest('button')) {
              return
            }
            // Toggle expansion
            toggleExpanded(record._id)
          },
          style: { cursor: 'pointer' }
        })}
        style={{ fontSize: '12px' }}
      >
        <Table.Column
          dataIndex="level"
          title="Level"
          width={80}
          render={(level: string) => (
            <Tag color={LOG_LEVEL_COLORS[level]} style={{ fontSize: '11px', margin: 0 }}>
              {level.toUpperCase()}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="timestamp"
          title="Timestamp"
          width={140}
          render={(value) => <span style={{ fontSize: '12px' }}>{formatDate(value)}</span>}
        />
        <Table.Column
          dataIndex="message"
          title="Message"
          ellipsis
          render={(text) => <span style={{ fontSize: '12px' }}>{text}</span>}
        />
        <Table.Column
          dataIndex="userId"
          title="User"
          width={200}
          render={(userId: string) => {
            if (!userId) return '-'
            return (
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/users/show/${userId}`)}
                style={{ padding: 0, fontSize: '12px' }}
              >
                {userId}
              </Button>
            )
          }}
        />
      </Table>
    </List>
  )
}
