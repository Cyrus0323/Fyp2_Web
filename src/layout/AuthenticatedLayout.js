import { BookOutlined, DashboardOutlined, SolutionOutlined } from '@ant-design/icons/lib/icons'
import { Layout, Menu, Space } from 'antd'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import LayoutHeader from '../components/navigation/header'

const AuthenticatedLayout = () => {
  const { Content, Footer, Sider } = Layout
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState([])
  const location = useLocation()

  useEffect(() => {
    const key = location.pathname
    setSelectedMenu([key])
  }, [location])

  return (
    <Layout hasSider={true}>
      <Sider trigger={null} width={220} collapsedWidth={0} collapsible={true} collapsed={collapsed}>
        <Space
          className="sider__space"
          direction="vertical"
          style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
        >
          <Link to="/healthcare/dashboard">
            <div className="logo" style={{ display: 'block' }}>
              <img src="/logo192.png" style={{ width: '100%' }} alt="logo" />
            </div>
          </Link>
          <Menu mode="inline" selectable={true} selectedKeys={selectedMenu}>
            <Menu.Item key="/healthcare/dashboard">
              <Link to="/healthcare/dashboard">
                <DashboardOutlined />
                <span>Dashboard</span>
              </Link>
            </Menu.Item>
            <Menu.SubMenu
              key="/healthcare/management"
              title={
                <>
                  <BookOutlined />
                  <span>Management</span>
                </>
              }
            >
              <Menu.Item key="/healthcare/management/patients">
                <Link to="/healthcare/management/patients">
                  <SolutionOutlined />
                  <span>Patient Management</span>
                </Link>
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </Space>
      </Sider>
      <Layout>
        <LayoutHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content>
          <Outlet />
        </Content>
        <Footer></Footer>
      </Layout>
    </Layout>
  )
}

export default AuthenticatedLayout
