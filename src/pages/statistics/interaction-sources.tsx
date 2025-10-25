import React from 'react'
import { useCustom } from '@refinedev/core'
import { Card, Row, Col, Select, Spin, Typography, Table } from 'antd'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTimeRange } from '../../contexts/TimeRangeContext'
import { TIME_RANGE_OPTIONS, InteractionSourcesStats as InteractionSourcesStatsData, CombinationStats } from '../../types'

const { Title, Text } = Typography

// Generate random colors for chart lines
const COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
]

export const InteractionSourcesStats: React.FC = () => {
  const { timeRange, setTimeRange } = useTimeRange()

  // Fetch interaction sources statistics
  const statsQuery = useCustom<InteractionSourcesStatsData>({
    url: '/admin/statistics/interaction-sources',
    method: 'get',
    config: {
      query: { range: timeRange }
    }
  })

  const statsData = statsQuery.data
  const statsLoading = statsQuery.isLoading

  const combinations = statsData?.data?.combinations || []
  const timeSeries = statsData?.data?.timeSeries || []

  // Prepare data for line chart - show ratio over time for each combination
  const chartData = timeSeries.map(point => {
    const item: any = { date: point.date }

    // Add ratio for each combination
    combinations.forEach(combo => {
      const key = `${combo.sourceType}:${combo.inputType}`
      const ratioKey = `${key}:ratio`
      if (point[ratioKey] !== undefined) {
        item[`${combo.sourceLabel} - ${combo.inputLabel}`] = (point[ratioKey] as number * 100).toFixed(1)
      }
    })

    return item
  })

  // Prepare table data
  const tableColumns = [
    {
      title: 'Source',
      dataIndex: 'sourceLabel',
      key: 'sourceLabel',
      sorter: (a: CombinationStats, b: CombinationStats) => a.sourceLabel.localeCompare(b.sourceLabel)
    },
    {
      title: 'Input Type',
      dataIndex: 'inputLabel',
      key: 'inputLabel',
      sorter: (a: CombinationStats, b: CombinationStats) => a.inputLabel.localeCompare(b.inputLabel)
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      sorter: (a: CombinationStats, b: CombinationStats) => a.likes - b.likes,
      render: (value: number) => value.toLocaleString()
    },
    {
      title: 'Dislikes',
      dataIndex: 'dislikes',
      key: 'dislikes',
      sorter: (a: CombinationStats, b: CombinationStats) => a.dislikes - b.dislikes,
      render: (value: number) => value.toLocaleString()
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      sorter: (a: CombinationStats, b: CombinationStats) => a.total - b.total,
      render: (value: number) => value.toLocaleString()
    },
    {
      title: 'Like Ratio',
      dataIndex: 'ratio',
      key: 'ratio',
      sorter: (a: CombinationStats, b: CombinationStats) => a.ratio - b.ratio,
      defaultSortOrder: 'descend' as const,
      render: (value: number) => {
        const percentage = (value * 100).toFixed(1)
        const color = value >= 0.5 ? '#52c41a' : value >= 0.3 ? '#faad14' : '#f5222d'
        return <span style={{ color, fontWeight: 'bold' }}>{percentage}%</span>
      }
    }
  ]

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Interaction Source Performance</Title>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 200 }}
              options={TIME_RANGE_OPTIONS}
            />
          </div>
        </Col>
      </Row>

      {/* Top Performing Combinations */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {combinations.slice(0, 4).map((combo, index) => (
          <Col xs={24} sm={12} lg={6} key={`${combo.sourceType}:${combo.inputType}`}>
            <Card>
              <Spin spinning={statsLoading}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  #{index + 1} Best Ratio
                </Text>
                <Title level={4} style={{ margin: '8px 0' }}>
                  {combo.sourceLabel}
                </Title>
                <Text strong>{combo.inputLabel}</Text>
                <Title
                  level={2}
                  style={{
                    margin: '12px 0 4px',
                    color: combo.ratio >= 0.5 ? '#52c41a' : combo.ratio >= 0.3 ? '#faad14' : '#f5222d'
                  }}
                >
                  {(combo.ratio * 100).toFixed(1)}%
                </Title>
                <Text type="secondary">
                  {combo.likes.toLocaleString()} likes / {combo.dislikes.toLocaleString()} dislikes
                </Text>
              </Spin>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Line Chart - Like Ratio Over Time */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Like Ratio Over Time (%)">
            <Spin spinning={statsLoading}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      label={{ value: 'Like Ratio (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #434343',
                        borderRadius: '4px',
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${value}%`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {combinations.map((combo, index) => {
                      const key = `${combo.sourceLabel} - ${combo.inputLabel}`
                      return (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name={key}
                          connectNulls
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Text type="secondary">No data available for selected time range</Text>
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="All Source/Input Combinations">
            <Table
              dataSource={combinations}
              columns={tableColumns}
              loading={statsLoading}
              rowKey={(record) => `${record.sourceType}:${record.inputType}`}
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
