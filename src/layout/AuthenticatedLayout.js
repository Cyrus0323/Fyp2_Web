import { BookOutlined, DashboardOutlined, SolutionOutlined } from '@ant-design/icons/lib/icons'
import { Layout, Menu, notification, Space } from 'antd'
import { onAuthStateChanged } from 'firebase/auth'
import { limitToLast, onValue, query, ref } from 'firebase/database'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'

import LayoutHeader from '../components/navigation/header'
import { auth, db } from '../firebase/firebase'

const AuthenticatedLayout = () => {
  const { Content, Footer, Sider } = Layout
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState([])
  const [pkey, setPkey] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  function within60s(recordTime, now) {
    const [recordHour, recordMinute, recordSecond] = recordTime.split(':')
    const [nowHour, nowMinute, nowSecond] = now.split(':')

    const rTime =
      parseInt(recordHour) * 60 * 60 + parseInt(recordMinute) * 60 + parseInt(recordSecond)
    const nTime = parseInt(nowHour) * 60 * 60 + parseInt(nowMinute) * 60 + parseInt(nowSecond)

    if (nTime > rTime && nTime - rTime <= 60) {
      return true
    }

    return false
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const doctorRef = ref(db, `Doctors/${user.uid}/attach`)

        onValue(
          doctorRef,
          (snapshot) => {
            const tmpKey = []
            snapshot.forEach((patientKey) => {
              tmpKey.push({ key: patientKey.val() })
            })

            setPkey(tmpKey)
          },
          {
            onlyOnce: true
          }
        )
      }
    })
  }, [])

  useEffect(() => {
    if (pkey.length > 0) {
      pkey.forEach((patient) => {
        const profileRef = ref(db, `Users/${patient.key}/Profile`)
        const toDate = moment().startOf('date').format('YYYY-MM-DD').toString()
        const patientRef = ref(db, `Users/${patient.key}/Connection/Pulse/Alert/${toDate}`)

        onValue(profileRef, (snapshot) => {
          const fullName = snapshot.child('fullName').val()
          let displayed = null

          onValue(query(patientRef, limitToLast(1)), (snapshot) => {
            if (snapshot.exists()) {
              const timeNow = moment().format('HH:mm:ss')
              console.log(timeNow)
              snapshot.forEach((period) => {
                if (within60s(period.key, timeNow) && period.size >= 10) {
                  if (displayed !== period.key) {
                    notification.info({
                      message: `${period.key}`,
                      description: `${fullName}'s pulse rate is unstable. Go have a look!`,
                      placement: 'bottomRight',
                      onClick: (e) => {
                        sessionStorage.setItem('notiSelectedDate', toDate)
                        sessionStorage.setItem(
                          'notiPath',
                          `/healthcare/management/patients/${patient.key}`
                        )
                        navigate(`/healthcare/management/patients/${patient.key}`)
                      }
                    })

                    displayed = period.key
                  }
                }
              })
            }
          })
        })
      })
    }
  }, [pkey])

  useEffect(() => {
    const key = location.pathname
    setSelectedMenu([key])

    if (key !== sessionStorage.getItem('notiPath')) {
      sessionStorage.removeItem('notiSelectedDate')
      sessionStorage.removeItem('notiPath')
    }
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
