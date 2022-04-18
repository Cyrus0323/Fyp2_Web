import { SyncOutlined } from '@ant-design/icons/lib/icons'
import { Col, PageHeader, Row } from 'antd'
import { onAuthStateChanged } from 'firebase/auth'
import { off, onValue, ref } from 'firebase/database'
import { random } from 'lodash'
import { useEffect, useState, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { auth, db } from '../../../firebase/firebase'
import globalStore from '../../../lib/store/global'
import AppointmentReminder from './appointment_reminder'
import LiquidAvtiveMonitoring from './liquid_active_monitoring'
import SexPiePlot from './pie_sex'
import ThreeDaysMonitoringHours from './three_days_monitoring_hours'

const Dashboard = () => {
  const [key, setKey] = useState([])
  const [rerender, setRerender] = useState(0)
  const refresh = useRef(false)
  const state = useSnapshot(globalStore)

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

            refresh.current = false
            setKey(tmpKey)
          },
          {
            onlyOnce: true
          }
        )
      }
    })
  }, [rerender])

  return (
    <PageHeader
      title={
        <div>
          Dashboard{' '}
          <SyncOutlined
            spin={refresh.current}
            onClick={() => {
              setRerender(random())
              refresh.current = true
            }}
          />
        </div>
      }
    >
      <Row
        gutter={[
          { xs: 8, sm: 16, md: 24, lg: 32 },
          { xs: 8, sm: 16, md: 24, lg: 32 }
        ]}
      >
        <Col className="gutter-row" span={8}>
          <AppointmentReminder patientKey={state.patientKey} />
        </Col>
        <Col className="gutter-row" span={8}>
          <SexPiePlot patientKey={state.patientKey} />
        </Col>
        <Col className="gutter-row" span={8}>
          <LiquidAvtiveMonitoring patientKey={state.patientKey} />
        </Col>
        <Col className="gutter-row" span={12}>
          <ThreeDaysMonitoringHours patientKey={state.patientKey} />
        </Col>
      </Row>
    </PageHeader>
  )
}

export default Dashboard
