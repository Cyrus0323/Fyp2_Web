import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons/lib/icons'
import { Button, Card, Form, Input, message, Space, Typography } from 'antd'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { push, ref, set } from 'firebase/database'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { auth, db } from '../../firebase/firebase'

const SignUpForm = () => {
  const [form] = Form.useForm()
  const { Title } = Typography
  const navigate = useNavigate()

  const handleSubmit = (values) => {
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        console.log(auth.currentUser.uid)
        const doctorRef = ref(db, 'Doctors/' + auth.currentUser.uid)
        const data = {
          fullName: values.fullName,
          email: values.email,
          role: 'doctor'
        }
        set(doctorRef, data)
          .then(() => {
            message.success('Create Account Successfully.')
            navigate('/')
          })
          .catch((error) => {
            message.error('Something wrong happened. Please try again later.')
          })
      })
      .catch((error) => {
        console.log(error.code)
        if (error.code === 'auth/email-already-in-use')
          message.error('The Email Address is already used')
        else message.error('Something wrong happened. Please try again later.')
      })
  }

  return (
    <Card>
      <Space direction="vertical" size={0} style={{ display: 'flex', justifyContent: 'center' }}>
        <Title level={1} style={{ textAlign: 'center' }}>
          Sign Up
        </Title>
        <img src="/logo.jpg" height="250" style={{ width: '100%' }} alt="logo" />
        <Title level={2} style={{ textAlign: 'center' }}>
          Heart Disease Assistant
        </Title>
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            key="fullName"
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Full Name is required' }]}
          >
            <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
          </Form.Item>
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
          <Form.Item
            key="password"
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ width: '100%' }} onClick={form.submit}>
              Sign Up
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

export default SignUpForm
