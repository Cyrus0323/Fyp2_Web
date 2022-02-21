import { Layout } from 'antd'
import React from 'react'

import Gaps from '../misc/gaps'
import SignUpForm from './form'

const SignUp = () => {
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
        <SignUpForm />
      </Content>
    </Layout>
  )
}

export default SignUp
