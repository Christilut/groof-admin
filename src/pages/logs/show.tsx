import React from 'react'
import { Show } from '@refinedev/antd'
import { Typography, Tag, Descriptions } from 'antd'
import { useShow } from '@refinedev/core'
import { Log } from '../../types'

const { Title, Paragraph } = Typography

const LOG_LEVEL_COLORS: Record<string, string> = {
  error: 'red',
  warn: 'orange',
  info: 'blue',
  debug: 'gray'
}

export const LogShow: React.FC = () => {
  const { queryResult } = useShow<Log>()
  const { data, isLoading } = queryResult
  const log = data?.data

  return (
    <Show isLoading={isLoading}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID">{log?._id}</Descriptions.Item>
        <Descriptions.Item label="Timestamp">
          {log?.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Level">
          <Tag color={log?.level ? LOG_LEVEL_COLORS[log.level] : 'gray'}>
            {log?.level?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Message">{log?.message}</Descriptions.Item>
        <Descriptions.Item label="Method">{log?.method || '-'}</Descriptions.Item>
        <Descriptions.Item label="Path">{log?.path || '-'}</Descriptions.Item>
        <Descriptions.Item label="Status Code">{log?.statusCode || '-'}</Descriptions.Item>
        <Descriptions.Item label="Duration">{log?.durationMs ? `${log.durationMs}ms` : '-'}</Descriptions.Item>
        <Descriptions.Item label="User ID">{log?.userId || '-'}</Descriptions.Item>
      </Descriptions>

      {log?.meta && (
        <>
          <Title level={4} style={{ marginTop: 24 }}>Metadata</Title>
          <Paragraph>
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
              {JSON.stringify(log.meta, null, 2)}
            </pre>
          </Paragraph>
        </>
      )}
    </Show>
  )
}
