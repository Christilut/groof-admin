import React from 'react'
import { useCustom } from '@refinedev/core'
import { Card, Row, Col, Select, Spin, Typography } from 'antd'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTimeRange } from '../../contexts/TimeRangeContext'
import { TIME_RANGE_OPTIONS, UserGrowth, TrackInteraction, Statistics } from '../../types'

const { Title } = Typography

export const Dashboard: React.FC = () => {
  const { timeRange, setTimeRange } = useTimeRange()

  // Fetch overview statistics
  const statsQuery = useCustom<Statistics>({
    url: '/admin/statistics',
    method: 'get'
  })

  // Fetch user growth
  const userGrowthQuery = useCustom<{
    data: UserGrowth[]
  }>({
    url: '/admin/statistics/users',
    method: 'get',
    config: {
      query: { range: timeRange }
    }
  })

  // Fetch track statistics
  const trackStatsQuery = useCustom<{
    interactions: TrackInteraction[]
    totalTracks: number
  }>({
    url: '/admin/statistics/tracks',
    method: 'get',
    config: {
      query: { range: timeRange }
    }
  })

  const statsData = statsQuery.data
  const statsLoading = statsQuery.isLoading
  const userGrowthData = userGrowthQuery.data
  const userGrowthLoading = userGrowthQuery.isLoading
  const trackStatsData = trackStatsQuery.data
  const trackStatsLoading = trackStatsQuery.isLoading

  const statistics = statsData?.data
  const userGrowth = userGrowthData?.data?.data || []
  const interactions = trackStatsData?.data?.interactions || []

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Dashboard</Title>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 200 }}
              options={TIME_RANGE_OPTIONS}
            />
          </div>
        </Col>
      </Row>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Title level={4}>Total Users</Title>
              <Title level={2}>{statistics?.totals.users || 0}</Title>
              <Typography.Text type="secondary">
                +{statistics?.last24Hours.newUsers || 0} last 24h
              </Typography.Text>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Title level={4}>Total Tracks</Title>
              <Title level={2}>{statistics?.totals.tracks || 0}</Title>
              <Typography.Text type="secondary">
                +{statistics?.last24Hours.newTracks || 0} last 24h
              </Typography.Text>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Title level={4}>Total Interactions</Title>
              <Title level={2}>{statistics?.totals.interactions || 0}</Title>
              <Typography.Text type="secondary">
                +{statistics?.last24Hours.newInteractions || 0} last 24h
              </Typography.Text>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={statsLoading}>
              <Title level={4}>Likes / Dislikes</Title>
              <Title level={2}>
                {statistics?.totals.likes || 0} / {statistics?.totals.dislikes || 0}
              </Title>
              <Typography.Text type="secondary">
                total
              </Typography.Text>
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="User Growth">
            <Spin spinning={userGrowthLoading}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1f1f',
                      border: '1px solid #434343',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="newUsers" stroke="#1890ff" name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Track Interactions (Likes vs Dislikes)">
            <Spin spinning={trackStatsLoading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interactions}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#1f1f1f',
                      border: '1px solid #434343',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="likes" stackId="a" fill="#52c41a" name="Likes" />
                  <Bar dataKey="dislikes" stackId="a" fill="#ff4d4f" name="Dislikes" />
                </BarChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
