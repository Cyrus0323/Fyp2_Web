import { MailOutlined } from '@ant-design/icons/lib/icons'
import { Button, Card, Form, Input, message, Space, Typography } from 'antd'
import { sendPasswordResetEmail } from 'firebase/auth'
import React from 'react'
import { Link } from 'react-router-dom'

import { auth } from '../../firebase/firebase'

const ForgotPasswordForm = () => {
  const [form] = Form.useForm()
  const { Title } = Typography

  const handleSubmit = (values) => {
    sendPasswordResetEmail(auth, values.email)
    message.success("Please check your email to reset password.")
  }

  return (
    <Card>
      <Space direction="vertical" size={0} style={{ display: 'flex', justifyContent: 'center' }}>
        <Title level={1} style={{ textAlign: 'center' }}>
          Forgot Password
        </Title>
        <img src="/logo.jpg" height="250" style={{ width: '100%' }} alt="logo" />
        <Title level={2} style={{ textAlign: 'center' }}>
          Heart Disease Assistant
        </Title>
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            key="email"
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Email is required' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="email"
              name="email"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ width: '100%' }} onClick={form.submit}>
              Reset Password
            </Button>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/">Already have an account?</Link>
          </div>
        </Form>
      </Space>
    </Card>
  )
}

export default ForgotPasswordForm
