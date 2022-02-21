import { Card, PageHeader } from 'antd'
import { useState } from 'react'
import PulseRateGraph from './graph'

const PatientData = () => {
  const [activeTab, setActiveTab] = useState('pulseRate')

  const tabList = [
    {
      key: 'pulseRate',
      tab: 'Pulse Rate'
    },
    {
      key: 'bloodPressureRate',
      tab: 'Blood Pressure Rate'
    }
  ]

  const contentList = {
    pulseRate: <PulseRateGraph />,
    bloodPressureRate: <p>Blood Pressure Rate</p>
  }

  return (
    <PageHeader title="Patient Monitoring">
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