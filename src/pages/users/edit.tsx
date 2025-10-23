import React from 'react'
import { Edit, useForm } from '@refinedev/antd'
import { Form, Input, Checkbox, Select } from 'antd'
import { User } from '../../types'

export const UserEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<User>()

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Email" name="email">
          <Input />
        </Form.Item>

        <Form.Item label="Display Name" name="display_name">
          <Input />
        </Form.Item>

        <Form.Item label="Country Code" name="country_code">
          <Input maxLength={2} placeholder="US" />
        </Form.Item>

        <Form.Item label="DJ Mode" name="dj_mode" valuePropName="checked">
          <Checkbox>Enable DJ Mode</Checkbox>
        </Form.Item>

        <Form.Item label="Roles" name="role">
          <Select
            mode="multiple"
            options={[
              { label: 'User', value: 'user' },
              { label: 'Admin', value: 'admin' }
            ]}
          />
        </Form.Item>
      </Form>
    </Edit>
  )
}
