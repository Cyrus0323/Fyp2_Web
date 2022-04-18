import { Button, DatePicker, Form, Input, message, Modal, Select, TimePicker } from 'antd'
import { onValue, ref, set } from 'firebase/database'
import { isEmpty, random } from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import { db } from '../../../../firebase/firebase'

import globalStore from '../../../../lib/store/global'

const AppointmentForm = ({ form, patientKey = null, action }) => {
  const { modalVisible, isLoading, selectedRow } = useSnapshot(globalStore)
  const [patientList, setPatientList] = useState([])

  const handleSubmit = (values) => {
    const appointmentDate = values.date.format('YYYY-MM-DD').toString()
    const appointmentTime = values.time.format('HH:mm').toString()
    const appointmentRef = ref(db, `Users/${values.name}/Appointment/${appointmentDate}`)

    onValue(
      appointmentRef,
      (snapshot) => {
        globalStore.isLoading = true
        if (action === 'add') {
          if (snapshot.exists()) {
            message.warn('The patient already has an appointment on that day')
            globalStore.isLoading = false
            return
          } else {
            const dateNow = moment().format('YYYY-MM-DD HH:mm:ss').toString()
            set(appointmentRef, {
              time: appointmentTime,
              description: values.description ?? null,
              createdAt: dateNow,
              updatedAt: dateNow
            })
            
            message.success('Create appointment successfully')
          }
        } else {
          const dateNow = moment().format('YYYY-MM-DD HH:mm:ss').toString()
          const prevDate = moment(selectedRow.date).format('YYYY-MM-DD').toString()
          if (prevDate === appointmentDate) {
            const createdAt = snapshot.child('createdAt').val()
            set(appointmentRef, {
              time: appointmentTime,
              description: isEmpty(values.description) ? null : values.description,
              createdAt: createdAt,
              updatedAt: dateNow
            })
            message.success('Update appointment successfully')
          } else {
            const prevAppointmentRef = ref(db, `Users/${values.name}/Appointment/${prevDate}`)
            if (snapshot.exists()) {
              message.error('The patient already has an appointment on that day')
              globalStore.isLoading = false
              return
            } else {
              onValue(
                prevAppointmentRef,
                (snapshot) => {
                  console.log('update date')
                  const createdAt = snapshot.child('createdAt').val()
                  set(prevAppointmentRef, null)
                  set(appointmentRef, {
                    time: appointmentTime,
                    description: values.description,
                    createdAt: createdAt,
                    updatedAt: dateNow
                  })
                  message.success('Update appointment successfully')
                },
                {
                  onlyOnce: true
                }
              )
            }
          }
        }
        globalStore.isLoading = false
        globalStore.modalVisible = false
        globalStore.refresh = random(1, true)
      },
      {
        onlyOnce: true
      }
    )
  }

  const initialValues = {
    ...selectedRow,
    name: selectedRow ? selectedRow.patientKey : null,
    date: selectedRow ? moment(selectedRow.date, 'YYYY-MM-DD') : null,
    time: selectedRow ? moment(selectedRow.time, 'HH:mm:ss') : null
  }

  const resetForm = () => {
    form.resetFields()
  }

  const generatePatientNameList = () => {
    const tmpList = []
    patientKey.forEach((patient, index) => {
      const profileRef = ref(db, `Users/${patient.key}/Profile`)
      onValue(profileRef, (snapshot) => {
        const fullName = snapshot.child('fullName').val()

        tmpList.push({ value: patient.key, label: fullName })

        if (index === patientKey.length - 1) {
          setPatientList(tmpList)
        }
      })
    })
  }

  useEffect(() => {
    generatePatientNameList()
    resetForm()
  }, [])

  return (
    <Modal
      width="70vh"
      title={action === 'add' ? `Add New Appointment` : `Update Appointment`}
      onCancel={() => {
        globalStore.modalVisible = false
        globalStore.selectedRow = null
      }}
      centered={true}
      visible={modalVisible}
      footer={[
        <Button key="reset" onClick={resetForm} danger>
          Reset
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit} loading={isLoading}>
          Submit
        </Button>
      ]}
      maskClosable={false}
    >
      <Form form={form} onFinish={handleSubmit} initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Patient"
          rules={[{ required: action === 'add' ? true : false, message: 'Patient is required' }]}
        >
          {
            <Select
              listHeight={133}
              options={patientList}
              disabled={action === 'add' ? false : true}
            />
          }
        </Form.Item>
        <Form.Item
          key="date"
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Date is required' }]}
        >
          <DatePicker
            disabledDate={(current) => {
              const now = moment().startOf('date')

              return now.isAfter(current)
            }}
            format={'YYYY-MM-DD'}
            allowClear={false}
          />
        </Form.Item>
        <Form.Item
          key="time"
          name="time"
          label="Time"
          rules={[{ required: true, message: 'Time is required' }]}
        >
          <TimePicker format={'HH:mm'} allowClear={false} />
        </Form.Item>
        <Form.Item key="description" name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AppointmentForm
