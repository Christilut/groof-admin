import { AuthPage } from '@refinedev/antd'

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title="Groof Admin"
      formProps={{
        initialValues: {
          email: '',
          password: ''
        }
      }}
    />
  )
}
