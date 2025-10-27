import React from 'react'
import { useGetIdentity, useLogout } from '@refinedev/core'
import { Layout, Space, Avatar, Typography, Button } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'

const { Header: AntdHeader } = Layout
const { Text } = Typography

interface IIdentity {
  id: string
  name: string
  avatar?: string
  email: string
}

export const CustomHeader: React.FC = () => {
  const { data: identity } = useGetIdentity<IIdentity>()
  const { mutate: logout } = useLogout()

  const handleLogout = () => {
    logout()
  }

  return (
    <AntdHeader
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: '#141414',
        borderBottom: '1px solid #303030'
      }}
    >
      {identity && (
        <Space size="middle">
          <Space size="small">
            <Avatar
              size="small"
              src={identity.avatar}
              icon={!identity.avatar && <UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              {identity.name}
            </Text>
          </Space>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'rgba(255, 255, 255, 0.65)' }}
          >
            Logout
          </Button>
        </Space>
      )}
    </AntdHeader>
  )
}
