import React from 'react'
import { Show } from '@refinedev/antd'
import { Tag, Descriptions, Button } from 'antd'
import { useShow } from '@refinedev/core'
import { useNavigate } from 'react-router-dom'
import { FileTextOutlined } from '@ant-design/icons'
import { User } from '../../types'

export const UserShow: React.FC = () => {
  const { queryResult } = useShow<User>()
  const { data, isLoading } = queryResult
  const user = data?.data
  const navigate = useNavigate()

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/logs?userId=${user?._id}`)}
          >
            View User Logs
          </Button>
        </>
      )}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID">{user?._id}</Descriptions.Item>
        <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
        <Descriptions.Item label="Display Name">{user?.display_name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Provider">{user?.provider}</Descriptions.Item>
        <Descriptions.Item label="Provider ID">{user?.provider_id}</Descriptions.Item>
        <Descriptions.Item label="Country Code">{user?.country_code || '-'}</Descriptions.Item>
        <Descriptions.Item label="DJ Mode">{user?.dj_mode ? 'Yes' : 'No'}</Descriptions.Item>
        <Descriptions.Item label="Roles">
          {user?.role?.map((role) => (
            <Tag key={role} color={role === 'admin' ? 'red' : 'blue'}>
              {role.toUpperCase()}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {user?.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  )
}
