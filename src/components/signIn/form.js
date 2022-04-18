import { LockOutlined, UserOutlined } from '@ant-design/icons/lib/icons'
import { Button, Card, Form, Input, message, Space, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'

import { db, auth } from '../../firebase/firebase'
import {
  browserSessionPersistence,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth'
import globalStore from '../../lib/store/global'
import { useSnapshot } from 'valtio'

const SignInForm = () => {
  const [form] = Form.useForm()
  const { Title } = Typography
  const [isRedirect, setIsRedirect] = useState(false)
  const { isLoggedIn } = useSnapshot(globalStore)

  const handleSubmit = (values) => {
    // validate the role='doctor' with email
    const doctorRef = ref(db, 'Doctors')
    let validEmail = []
    onValue(doctorRef, (snapshot) => {
      snapshot.forEach((doctor) => {
        validEmail.push(doctor.val().email)
      })

      if (!validEmail.includes(values.email)) {
        message.error('Email/Password is incorrect.')
        return
      }

      signInWithEmailAndPassword(auth, values.email, values.password)
        .then(async () => {
          if (!auth.currentUser.emailVerified) {
            await sendEmailVerification(auth.currentUser)
            message.success('Please check your email to validate your account.')
          } else {
            setPersistence(auth, browserSessionPersistence)
            globalStore.isLoggedIn = true
          }
        })
        .catch((error) => {
          console.log(error)
          if (error.code === 'auth/too-many-requests') {
            message.error('Please try again later')
          } else if (error.code === 'auth/wrong-password')
            message.error('Email/Password is incorrect.')
        })
    })
  }

  useEffect(() => {
    if (isLoggedIn) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const doctorPath = ref(db, `Doctors/${user.uid}/attach`)
          onValue(doctorPath, (snapshot) => {
            const tmpKey = []
            snapshot.forEach((patientKey) => {
              tmpKey.push({ key: patientKey.val() })
            })

            globalStore.patientKey = tmpKey
            setIsRedirect(true)
          })
        }
      })
    }
  }, [isLoggedIn])

  if (isRedirect) {
    return <Navigate to="/healthcare/dashboard" />
  }

  return (
    <Card>
      <Space direction="vertical" size={0} style={{ display: 'flex', justifyContent: 'center' }}>
        <Title level={1} style={{ textAlign: 'center' }}>
          Sign In
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
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
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
            <Button type="primary" style={{ width: '100%' }} onClick={() => form.submit()}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Link to="/sign-up">Register?</Link>
          </div>
          <div>
            <Link to="/">Forgot Password</Link>
          </div>
        </div>
      </Space>
    </Card>
  )
}

export default SignInForm
