import { Refine, Authenticated } from '@refinedev/core'
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier
} from '@refinedev/react-router-v6'
import { BrowserRouter, Outlet, Route, Routes, Navigate } from 'react-router-dom'
import { ThemedLayoutV2, ThemedTitleV2, ErrorComponent } from '@refinedev/antd'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  BarChartOutlined
} from '@ant-design/icons'

import '@refinedev/antd/dist/reset.css'

import { authProvider } from './providers/authProvider'
import { dataProvider } from './providers/dataProvider'
import { TimeRangeProvider } from './contexts/TimeRangeContext'

// Pages
import { Dashboard } from './pages/dashboard'
import { UserList, UserShow, UserEdit } from './pages/users'
import { LogList, LogShow } from './pages/logs'
import { Health } from './pages/health'
import { Login } from './pages/login'
import { InteractionSourcesStats } from './pages/statistics'

// Components
import { CustomSider } from './components/Sider'

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
          token: {
            colorPrimary: '#1890ff',
            motion: false
          }
        }}
      >
        <AntdApp>
          <TimeRangeProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              routerProvider={routerBindings}
              resources={[
                {
                  name: 'dashboard',
                  list: '/',
                  meta: {
                    label: 'Dashboard',
                    icon: <DashboardOutlined />
                  }
                },
                {
                  name: 'users',
                  list: '/users',
                  show: '/users/show/:id',
                  edit: '/users/edit/:id',
                  meta: {
                    label: 'Users',
                    icon: <UserOutlined />
                  }
                },
                {
                  name: 'logs',
                  list: '/logs',
                  show: '/logs/show/:id',
                  meta: {
                    label: 'Logs',
                    icon: <FileTextOutlined />
                  }
                },
                {
                  name: 'interaction-sources',
                  list: '/statistics/interaction-sources',
                  meta: {
                    label: 'Interactions',
                    icon: <BarChartOutlined />
                  }
                },
                {
                  name: 'health',
                  list: '/health',
                  meta: {
                    label: 'System Health',
                    icon: <HeartOutlined />
                  }
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                title: { text: 'Groof Admin' }
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-layout"
                      fallback={<Navigate to="/login" replace />}
                    >
                      <ThemedLayoutV2
                        Title={({ collapsed }) => (
                          <ThemedTitleV2
                            collapsed={collapsed}
                            text="Groof Admin"
                          />
                        )}
                        Sider={() => <CustomSider />}
                      >
                        <Outlet />
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="/users">
                    <Route index element={<UserList />} />
                    <Route path="show/:id" element={<UserShow />} />
                    <Route path="edit/:id" element={<UserEdit />} />
                  </Route>
                  <Route path="/logs">
                    <Route index element={<LogList />} />
                    <Route path="show/:id" element={<LogShow />} />
                  </Route>
                  <Route path="/health" element={<Health />} />
                  <Route path="/statistics/interaction-sources" element={<InteractionSourcesStats />} />
                  <Route path="*" element={<ErrorComponent />} />
                </Route>

                <Route
                  element={<Login />}
                  path="/login"
                />
              </Routes>

              <UnsavedChangesNotifier />
              <DocumentTitleHandler
                handler={({ resource, action }) => {
                  const APP_NAME = 'Groof Admin'
                  const formatTitle = (parts: string[]) =>
                    [...parts.filter(Boolean), APP_NAME].join(' | ')

                  if (window.location.pathname === '/login') {
                    return formatTitle(['Welcome'])
                  }

                  if (resource) {
                    const resourceLabel = resource.label || resource.name || ''
                    const actionName = action === 'list' ? '' : (action || '')
                    return formatTitle([resourceLabel, actionName])
                  }

                  return APP_NAME
                }}
              />
            </Refine>
          </TimeRangeProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App
