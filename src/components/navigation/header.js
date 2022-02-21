import {
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons/lib/icons'
import { Avatar, Breadcrumb, Dropdown, Layout, Menu, message, Space } from 'antd'
import { capitalize } from 'lodash'
import randomColor from 'randomcolor'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { auth } from '../../firebase/firebase'
import globalStore from '../../lib/store/global'

const LayoutHeader = ({ collapsed, setCollapsed }) => {
  const { Header } = Layout
  const [breadcrumbList, setBreadcrumbList] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  const toggle = () => {
    setCollapsed(!collapsed)
  }

  const menu = (
    <Menu>
      <Menu.Item
        key="/accounts/edit"
        onClick={() => {
          message.error('To be completed')
        }}
      >
        <>
          <UserOutlined />
          <span className="nav-text">Edit Account</span>
        </>
      </Menu.Item>
      <Menu.Item
        key="/accounts/change_password"
        onClick={() => {
          message.error('To be completed')
        }}
      >
        <>
          <LockOutlined />
          <span className="nav-text">Change Password</span>
        </>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={() => {
        auth.signOut()
        message.success('Logout Successfully')
        globalStore.isLoggedIn = false
        navigate('/')
      }}>
        <LogoutOutlined />
        <span className="nav-text">Logout</span>
      </Menu.Item>
    </Menu>
  )

  const generateBreadcrumbList = () => {
    let tmpList = []
    const part = location.pathname.split('/')

    for (let i = 2; i < part.length; i++) {
      let path = '/healthcare'
      for (let j = 2; j <= i; j++) {
        path = path + '/' + part[j]
      }

      if (part[i - 1] === 'patients') part[i] = 'monitoring'

      if (part[i]) {
        // capitalize first letter of each word
        let words = part[i].replace('_', ' ').split(' ')
        words = words.map((word) => {
          return capitalize(word)
        })
        tmpList.push({ path: path, name: words.join(' ') })
      }
    }
    setBreadcrumbList(tmpList)
  }

  useEffect(() => {
    generateBreadcrumbList()
  }, [location])

  return (
    <>
      <Header>
        <Space direction="horizontal" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space direction="horizontal">
            {collapsed ? (
              <MenuUnfoldOutlined onClick={toggle} />
            ) : (
              <MenuFoldOutlined onClick={toggle} />
            )}
            <Breadcrumb separator=">">
              {breadcrumbList.map((breadcrumb, i) => {
                return i === 0 ? (
                  <Breadcrumb.Item key={breadcrumb.name} style={{ color: 'black' }}>
                    {breadcrumb.name}
                  </Breadcrumb.Item>
                ) : i === breadcrumbList.length - 1 ? (
                  <Breadcrumb.Item key={breadcrumb.name} style={{ color: 'white' }}>
                    {breadcrumb.name}
                  </Breadcrumb.Item>
                ) : (
                  <Breadcrumb.Item key={breadcrumb.name}>
                    <Link to={breadcrumb.path}>{breadcrumb.name}</Link>
                  </Breadcrumb.Item>
                )
              })}
            </Breadcrumb>
          </Space>
          <Dropdown key="dropdown" overlay={menu} placement="bottomCenter">
            <Avatar style={{ backgroundColor: randomColor() }}>H</Avatar>
          </Dropdown>
        </Space>
      </Header>
    </>
  )
}

export default LayoutHeader
