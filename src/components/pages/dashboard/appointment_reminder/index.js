import { Card, List, Space } from 'antd'
import { onValue, ref } from 'firebase/database'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { db } from '../../../../firebase/firebase'
import globalStore from '../../../../lib/store/global'

const AppointmentReminder = ({ patientKey }) => {
  const [activeTab, setActiveTab] = useState('today')

  const tabList = [
    {
      key: 'today',
      tab: 'Today'
    },
    {
      key: 'tommorow',
      tab: 'Tommorow'
    }
  ]

  const contentList = {
    today: <AppointmentList patientKey={patientKey} activeTab={activeTab} />,
    tommorow: <AppointmentList patientKey={patientKey} activeTab={activeTab} />
  }

  return (
    <Card
      className='appointment-card'
      style={{ display: 'block' }}
      title="Appointment Reminder"
      tabList={tabList}
      activeTabKey={activeTab}
      onTabChange={(key) => {
        setActiveTab(key)
      }}
    >
      {contentList[activeTab]}
    </Card>
  )
}

const AppointmentList = ({ activeTab }) => {
  const [list, setList] = useState([])
  const state = useSnapshot(globalStore)

  useEffect(() => {
    if (state.patientKey.length > 0) {
      const tmpData = []
      let date = null
      if (activeTab === 'today') {
        date = moment().startOf('date').format('YYYY-MM-DD').toString()
      } else if (activeTab === 'tommorow') {
        date = moment().add(1, 'day').startOf('date').format('YYYY-MM-DD').toString()
      }
      state.patientKey.forEach((patient, index) => {
        const patientRef = ref(db, `Users/${patient.key}`)
        onValue(
          patientRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const fullName = snapshot.child('Profile/fullName').val()

              if (snapshot.child(`Appointment/${date}`).exists()) {
                const values = snapshot.child(`Appointment/${date}`).val()

                tmpData.push({
                  patientKey: patient.key,
                  name: fullName,
                  date: date,
                  time: values.time,
                  description: values.description,
                  createdAt: values.createdAt,
                  updatedAt: values.updatedAt
                })
              }

              if (index === state.patientKey.length - 1) {
                tmpData.sort((a, b) => {
                  const A = moment(a.date + ' ' + a.time)
                  const B = moment(b.date + ' ' + b.time)

                  if (A < B) {
                    return -1
                  } else if (A > B) {
                    return 1
                  }

                  return 0
                })

                setList(tmpData)
              }
            }
          },
          {
            onlyOnce: true
          }
        )
      })
    }
  }, [state.patientKey, activeTab])

  return (
    <List
      className="appointment-list"
      itemLayout="horizontal"
      dataSource={list}
      renderItem={(item) => {
        console.log(item)
        return (
          <List.Item>
            <List.Item.Meta
              title={`${item.name} ${item.date} ${item.time}`}
              description={item.description ?? 'No description'}
            />
          </List.Item>
        )
      }}
    />
  )
}

export default AppointmentReminder
