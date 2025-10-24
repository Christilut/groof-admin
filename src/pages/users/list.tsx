import React from 'react'
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField
} from '@refinedev/antd'
import { Table, Space, Input, Tag, Form, Typography } from 'antd'
import { User } from '../../types'

const { Title } = Typography

export const UserList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<User>({
    resource: 'users',
    onSearch: (values: any) => {
      return [
        {
          field: 'search',
          operator: 'eq',
          value: values.search
        }
      ]
    }
  })

  return (
    <List title={<Title level={2}>Users</Title>}>
      <Form {...searchFormProps} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="search">
          <Input.Search
            placeholder="Search by email or name"
            onSearch={() => searchFormProps?.form?.submit()}
            style={{ width: 300 }}
            allowClear
          />
        </Form.Item>
      </Form>

      <Table {...tableProps} rowKey="_id">
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="display_name" title="Name" />
        <Table.Column
          dataIndex="role"
          title="Roles"
          render={(roles: string[]) => (
            <>
              {roles?.map((role) => (
                <Tag key={role} color={role === 'admin' ? 'red' : 'blue'}>
                  {role.toUpperCase()}
                </Tag>
              ))}
            </>
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          render={(value) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          dataIndex="updated_at"
          title="Updated At"
          render={(value) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: User) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record._id} />
              <EditButton hideText size="small" recordItemId={record._id} />
              <DeleteButton hideText size="small" recordItemId={record._id} />
            </Space>
          )}
        />
      </Table>
    </List>
  )
}
