import React, { useState, useEffect } from 'react'
import { useCustom } from '@refinedev/core'
import { Card, Row, Col, Spin, Tag, Descriptions, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { Health as HealthType } from '../../types'

const { Title } = Typography

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'healthy') {
    return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
  } else if (status === 'unhealthy') {
    return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
  }
  return <WarningOutlined style={{ color: '#faad14', fontSize: 24 }} />
}

export const Health: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const { data, isLoading } = useCustom<HealthType>({
    url: '/admin/health',
    method: 'get',
    queryOptions: {
      queryKey: ['health', refreshKey]
    }
  })

  const health = data?.data

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>System Health</Title>
            <Tag color={health?.status === 'healthy' ? 'green' : 'red'}>
              {health?.status?.toUpperCase()}
            </Tag>
          </div>
        </Col>
      </Row>

      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>MongoDB</span>
                  <StatusIcon status={health?.mongodb.status || ''} />
                </div>
              }
            >
              <Descriptions column={1}>
                <Descriptions.Item label="Status">
                  <Tag color={health?.mongodb.connected ? 'green' : 'red'}>
                    {health?.mongodb.connected ? 'Connected' : 'Disconnected'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Database Size">
                  {health?.mongodb.databaseSize?.toFixed(2)} MB
                </Descriptions.Item>
                <Descriptions.Item label="Collections">
                  {health?.mongodb.collections && (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {Object.entries(health.mongodb.collections).map(([name, count]) => (
                        <li key={name}>
                          {name}: {count} documents
                        </li>
                      ))}
                    </ul>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Redis</span>
                  <StatusIcon status={health?.redis.status || ''} />
                </div>
              }
            >
              <Descriptions column={1}>
                <Descriptions.Item label="Status">
                  <Tag color={health?.redis.connected ? 'green' : 'red'}>
                    {health?.redis.connected ? 'Connected' : 'Disconnected'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Memory Used">
                  {health?.redis.memoryUsed?.toFixed(2)} MB
                </Descriptions.Item>
                <Descriptions.Item label="Total Keys">
                  {health?.redis.keyCount || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Uptime">
                  {health?.redis.uptime
                    ? `${Math.floor(health.redis.uptime / 3600)} hours`
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Typography.Text type="secondary">
              Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : '-'}
              {' • '}
              Auto-refreshes every 30 seconds
            </Typography.Text>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}
