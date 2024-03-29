import { Card, PageHeader } from 'antd'
import { onValue, ref } from 'firebase/database'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../../../../firebase/firebase'
import AppointmentRemarks from './appointment_remarks'
import PulseRateGraph from './graph'
import RealtimePulseRateGraph from './graph_realtime'
import MedicationManagement from './medication_index'

const PatientData = () => {
  const param = useParams()
  const [activeTab, setActiveTab] = useState('pulseRateRealtime')
  const [name, setName] = useState('')

  useEffect(() => {
    onValue(ref(db, `Users/${param.key}/Profile`), (snapshot) => {
      const name = snapshot.child('fullName').val()
      setName(name)
    })
  }, [])

  const tabList = [
    {
      key: 'pulseRateRealtime',
      tab: 'Real-time - Pulse Rate'
    },
    {
      key: 'pulseRate',
      tab: 'Pulse Rate'
    },
    {
      key: 'medication',
      tab: 'Medication'
    },
    {
      key: 'appointment',
      tab: 'Appointment Follow-up'
    }
  ]

  const contentList = {
    pulseRateRealtime: <RealtimePulseRateGraph />,
    pulseRate: <PulseRateGraph />,
    medication: <MedicationManagement />,
    appointment: <AppointmentRemarks />
  }

  return (
    <PageHeader title={`Patient Monitoring (${name})`}>
      <Card
        tabList={tabList}
        activeTabKey={activeTab}
        onTabChange={(key) => {
          setActiveTab(key)
        }}
      >
        {contentList[activeTab]}
      </Card>
    </PageHeader>
  )
}

export default PatientData
