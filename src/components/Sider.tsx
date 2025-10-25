import React from 'react'
import { useMenu } from '@refinedev/core'
import { Layout, Menu } from 'antd'
import { useLocation, Link } from 'react-router-dom'

const { Sider: AntdSider } = Layout

export const CustomSider: React.FC = () => {
  const { menuItems, selectedKey } = useMenu()
  const location = useLocation()

  const items = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.route ? (
      <Link to={item.route}>{item.label}</Link>
    ) : (
      item.label
    ),
  }))

  // Determine selected key based on current path
  const currentKey = selectedKey || location.pathname

  return (
    <AntdSider width={200}>
      <Menu
        mode="inline"
        selectedKeys={[currentKey]}
        items={items}
        style={{ height: '100%', borderRight: 0 }}
        className="custom-sider-menu"
      />
      <style>{`
        .custom-sider-menu .ant-menu-item-selected a,
        .custom-sider-menu .ant-menu-item-selected span {
          color: white !important;
        }
      `}</style>
    </AntdSider>
  )
}
