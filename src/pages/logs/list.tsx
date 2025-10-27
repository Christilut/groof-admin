import React, { useState, useEffect, useRef } from 'react'
import { List, useTable } from '@refinedev/antd'
import { Table, Space, Select, Input, Tag, Form, Descriptions, Typography, Button } from 'antd'
import { CrudFilters } from '@refinedev/core'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Log } from '../../types'
import { emailCache } from '../../services/emailCache'
import { fetchBatchEmails } from '../../services/userService'
import { getColorFromString } from '../../utils/colorHash'

const { Paragraph, Title } = Typography

const LOG_LEVEL_COLORS: Record<string, string> = {
  error: 'red',
  warn: 'orange',
  info: 'blue',
  debug: 'gray',
  http: 'default'
}

export const LogList: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false)
  const [userEmails, setUserEmails] = useState<Record<string, string>>({})
  const [realtimeEnabled] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { tableProps, searchFormProps, setFilters, filters, tableQuery } = useTable<Log>({
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

  // Realtime polling
  useEffect(() => {
    if (realtimeEnabled) {
      intervalRef.current = setInterval(() => {
        tableQuery?.refetch()
      }, 2000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [realtimeEnabled, tableQuery])

  // Fetch emails for user IDs in logs
  useEffect(() => {
    const logs = (tableProps.dataSource || []) as Log[]
    if (logs.length === 0) return

    // Extract unique user IDs from logs
    const userIds = [...new Set(logs.map(log => log.userId).filter(Boolean) as string[])]
    if (userIds.length === 0) return

    // Check which user IDs don't have cached emails
    const missingUserIds = emailCache.getMissing(userIds)

    // If there are missing emails, fetch them
    if (missingUserIds.length > 0) {
      fetchBatchEmails(missingUserIds).then(emails => {
        // Update cache
        emailCache.setMany(emails)
        // Update component state to trigger re-render
        setUserEmails(prev => ({ ...prev, ...emails }))
      })
    } else {
      // All emails are cached, populate state from cache
      const cachedEmails: Record<string, string> = {}
      userIds.forEach(userId => {
        const email = emailCache.get(userId)
        if (email) {
          cachedEmails[userId] = email
        }
      })
      setUserEmails(cachedEmails)
    }
  }, [tableProps.dataSource])

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
    const newFilters = filters.filter(f => 'field' in f && f.field !== fieldName)
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

  const renderMessage = (text: string, record: Log) => {
    // Only process HTTP logs
    if (record.level !== 'http') {
      return <span style={{ fontSize: '12px' }}>{text}</span>
    }

    // Parse HTTP log format: METHOD /path STATUSCODE (timing)
    const parts = text.split(' ')
    if (parts.length < 3) {
      return <span style={{ fontSize: '12px' }}>{text}</span>
    }

    const statusCode = parseInt(parts[2], 10)

    // If status code is 400 or higher, highlight it in red
    if (statusCode >= 400) {
      return (
        <span style={{ fontSize: '12px' }}>
          {parts[0]} {parts[1]} <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{parts[2]}</span> {parts.slice(3).join(' ')}
        </span>
      )
    }

    return <span style={{ fontSize: '12px' }}>{text}</span>
  }

  // Function to determine if a row should be highlighted based on HTTP status code
  const getRowClassName = (record: Log) => {
    if (record.level !== 'http') {
      return ''
    }

    // Parse HTTP log format: METHOD /path STATUSCODE (timing)
    const parts = record.message.split(' ')
    if (parts.length < 3) {
      return ''
    }

    const statusCode = parseInt(parts[2], 10)
    
    // Return CSS class name for rows with status code 400 or higher
    return statusCode >= 400 ? 'error-row' : ''
  }

  const expandedRowRender = (record: Log) => {
    const email = record.userId ? (userEmails[record.userId] || record.userId) : null
    const color = email && record.userId && userEmails[record.userId] ? getColorFromString(email) : '#1890ff'

    return (
      <div>
        <Descriptions size="small" column={2} bordered style={{ fontSize: '12px', marginBottom: 16 }}>
          <Descriptions.Item label="Log ID">{record._id}</Descriptions.Item>
          <Descriptions.Item label="User Email">
            {record.userId ? (
              <a
                href={`/users/show/${record.userId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color, fontWeight: 500 }}
              >
                {email}
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
  }

  return (
    <List title={<Title level={2}>Logs</Title>}>
      <style>
        {`
          .error-row {
            background-color: rgba(255, 77, 79, 0.1) !important;
          }
          .error-row:hover {
            background-color: rgba(255, 77, 79, 0.15) !important;
          }
        `}
      </style>
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
              <Select.Option value="http">HTTP</Select.Option>
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
        rowClassName={getRowClassName}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: (_expanded, record) => {
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
          render={(text, record: Log) => renderMessage(text, record)}
        />
        <Table.Column
          dataIndex="userId"
          title="User"
          width={200}
          render={(userId: string) => {
            if (!userId) return '-'
            const email = userEmails[userId] || 'Loading...'
            const color = email !== 'Loading...' ? getColorFromString(email) : '#1890ff'
            return (
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/users/show/${userId}`)}
                style={{ padding: 0, fontSize: '12px', color, fontWeight: 500 }}
              >
                {email}
              </Button>
            )
          }}
        />
      </Table>
    </List>
  )
}
