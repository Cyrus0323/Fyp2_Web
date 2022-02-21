import { Layout } from 'antd'
import React from 'react'

import Gaps from '../misc/gaps'
import SignInForm from './form'

const SignIn = () => {
  const { Content } = Layout

  return (
    <Layout
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundPosition: 'bottom',
        backgroundSize: 'cover'
      }}
    >
      <Content className="main">
        {/* <Gaps gaps={{ mobile: '4x', tablet: '', desktop: '' }} /> */}
        <SignInForm />
      </Content>
    </Layout>
  )
}

export default SignIn
