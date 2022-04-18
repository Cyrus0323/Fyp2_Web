import {
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SyncOutlined
} from '@ant-design/icons/lib/icons'
import { Avatar, Breadcrumb, DatePicker, Dropdown, Layout, List, Menu, message, Space } from 'antd'
import { onAuthStateChanged } from 'firebase/auth'
import { onValue, ref } from 'firebase/database'
import { capitalize, random } from 'lodash'
import moment from 'moment'
import randomColor from 'randomcolor'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { auth, db } from '../../firebase/firebase'
import globalStore from '../../lib/store/global'

const LayoutHeader = ({ collapsed, setCollapsed }) => {
  const { Header } = Layout
  const [breadcrumbList, setBreadcrumbList] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const [pkey, setPkey] = useState([])
  const [date, setDate] = useState(moment().startOf('date'))
  const [notiList, setNotiList] = useState(['No Message'])
  const [refresh, setRefresh] = useState(0)

  const toggle = () => {
    setCollapsed(!collapsed)
  }

  const disabledDate = (current) => {
    const now = moment().startOf('date')
    const ninetyDaysAgo = moment().subtract(90, 'days').startOf('date') // today minus 90 days

    return ninetyDaysAgo.isAfter(current.startOf('date')) || now.isBefore(current.startOf('date'))
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
      <Menu.Item
        key="logout"
        onClick={() => {
          auth.signOut()
          message.success('Logout Successfully')
          globalStore.isLoggedIn = false
          navigate('/')
        }}
      >
        <LogoutOutlined />
        <span className="nav-text">Logout</span>
      </Menu.Item>
    </Menu>
  )

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
      const tmpData = []

      pkey.forEach((patient, index) => {
        const profileRef = ref(db, `Users/${patient.key}/Profile`)

        onValue(
          profileRef,
          (snapshot) => {
            const fullName = snapshot.child('fullName').val()
            const alertRef = ref(
              db,
              `Users/${patient.key}/Connection/Pulse/Alert/${date.format('YYYY-MM-DD').toString()}`
            )

            onValue(
              alertRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  snapshot.forEach((period) => {
                    if (period.size >= 10) {
                      tmpData.push({ key: patient.key, name: fullName, time: period.key })
                    }
                  })
                }

                if (index === pkey.length - 1) {
                  tmpData.sort((a, b) => {
                    const [hourA, minuteA, secondA] = a.time.split(':')
                    const [hourB, minuteB, secondB] = b.time.split(':')

                    if (parseInt(hourA) < parseInt(hourB)) {
                      return 1
                    } else if (parseInt(hourA) > parseInt(hourB)) {
                      return -1
                    } else if (parseInt(minuteA) < parseInt(minuteB)) {
                      return 1
                    } else if (parseInt(minuteA) > parseInt(minuteB)) {
                      return -1
                    } else if (parseInt(secondA) < parseInt(secondB)) {
                      return 1
                    } else if (parseInt(secondA) > parseInt(secondB)) {
                      return -1
                    }

                    return 0
                  })

                  setNotiList(tmpData)
                }
              },
              {
                onlyOnce: true
              }
            )
          },
          {
            onlyOnce: true
          }
        )
      })
    } else {
      setNotiList(['No Message'])
    }
  }, [pkey, date, refresh])

  const notificationList = (
    <>
      <List
        className="notification-list"
        style={{ background: '#fff' }}
        header={
          <div>
            <DatePicker
              disabledDate={disabledDate}
              onChange={(selectedDate) => {
                // off(patientPulseDataRef)
                setDate(selectedDate)
              }}
              defaultValue={date}
              allowClear={false}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <SyncOutlined
              style={{ color: '#1890ff' }}
              onClick={() => setRefresh(random(1, true))}
            />
          </div>
        }
        bordered
        dataSource={notiList}
        renderItem={(item) => (
          <List.Item
            style={{ width: '300px' }}
            onClick={(e) => {
              sessionStorage.setItem('notiSelectedDate', date.format('YYYY-MM-DD'))
              sessionStorage.setItem('notiPath', `/healthcare/management/patients/${item.key}`)
              navigate(`/healthcare/management/patients/${item.key}`)
            }}
          >
            <Space direction="vertical">
              <p>{item.time}</p>
              <p>{`${item.name}'s pulse rate is unstable. Go have a look!`}</p>
            </Space>
          </List.Item>
        )}
      ></List>
    </>
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
          <Space direction="horizontal" style={{ marginLeft: 25 }}>
            {/* {collapsed ? (
              <MenuUnfoldOutlined onClick={toggle} />
            ) : (
              <MenuFoldOutlined onClick={toggle} />
            )} */}
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
          <Space direction="horizontal">
            <Dropdown
              key="noti"
              overlay={notificationList}
              placement="bottomLeft"
              trigger={['click']}
            >
              <BellOutlined
                style={{ display: 'flex', alignSelf: 'center', color: '#fff' }}
                onClick={() => setRefresh(random(1, true))}
              />
            </Dropdown>
            <Dropdown key="dropdown" overlay={menu} placement="bottomCenter" trigger={['click']}>
              <Avatar style={{ backgroundColor: randomColor() }}>H</Avatar>
            </Dropdown>
          </Space>
        </Space>
      </Header>
    </>
  )
}

export default LayoutHeader
