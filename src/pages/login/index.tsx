import { useLogin } from '@refinedev/core'
import { Button, Card, Typography, Alert, Space } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Title, Text } = Typography

export const Login = () => {
  const { mutate: login, isLoading } = useLogin()
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setError(null)
    login({}, {
      onError: (error: any) => {
        setError(error?.message || 'Failed to sign in')
      }
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              Groof Admin
            </Title>
            <Text type="secondary">
              Sign in with your Google account
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            loading={isLoading}
            block
          >
            Sign in with Google
          </Button>
        </Space>
      </Card>
    </div>
  )
}
