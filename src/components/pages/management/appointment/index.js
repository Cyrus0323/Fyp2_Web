import { useState, useEffect } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, PageHeader } from 'antd'
import { onAuthStateChanged } from 'firebase/auth'
import { onValue, ref } from 'firebase/database'
import { useSnapshot } from 'valtio'
import { auth, db } from '../../../../firebase/firebase'
import globalStore from '../../../../lib/store/global'
import AppointmentForm from './form'
import AppointmentTable from './table'

const AppointmentManagement = () => {
  const { modalVisible, selectedRow } = useSnapshot(globalStore)
  const [form] = Form.useForm()
  const [key, setKey] = useState([])

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

            setKey(tmpKey)
          },
          {
            onlyOnce: true
          }
        )
      }
    })
  }, [])

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
        <PlusOutlined /> New Appointment
      </Button>
      {modalVisible && !selectedRow && (
        <AppointmentForm form={form} patientKey={key} action="add" />
      )}
    </>
  )

  return (
    <PageHeader title="Appointments Table" extra={primaryAction}>
      <Card>
        <AppointmentTable patientKey={key} />
      </Card>
    </PageHeader>
  )
}

export default AppointmentManagement
