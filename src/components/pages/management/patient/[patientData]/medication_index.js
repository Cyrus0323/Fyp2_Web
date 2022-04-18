import { useState, useEffect } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, PageHeader } from 'antd'
import { useSnapshot } from 'valtio'
import MedicationTable from './medication_table'
import globalStore from '../../../../../lib/store/global'
import MedicationForm from './medication_form'

const MedicationManagement = () => {
  const { modalVisible, selectedRow } = useSnapshot(globalStore)
  const [form] = Form.useForm()
  const [key, setKey] = useState([])

  const primaryAction = (
    <>
      <Button
        key="add"
        type="primary"
        onClick={() => {
          globalStore.modalVisible = true
          globalStore.selectedRow = null
        }}
      >
        <PlusOutlined /> New Medication
      </Button>
      {modalVisible && !selectedRow && (
        <MedicationForm form={form} action="add" />
      )}
    </>
  )

  return (
    <PageHeader title="Medications Table" extra={primaryAction}>
      <Card>
        <MedicationTable />
      </Card>
    </PageHeader>
  )
}

export default MedicationManagement
