import { Button, Form, Input, message, Modal } from 'antd'
import { ref, set } from 'firebase/database'
import { random } from 'lodash'
import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { db } from '../../../../../firebase/firebase'
import globalStore from '../../../../../lib/store/global'

const RemarksForm = ({ form, patientKey = null }) => {
  const { modalVisible, isLoading, selectedRow } = useSnapshot(globalStore)

  const handleSubmit = (values) => {
    const appointmentDate = values.date
    const appointmentTime = values.time
    const appointmentRef = ref(db, `Users/${patientKey}/Appointment/${appointmentDate}`)
    
    globalStore.isLoading = true
    set(appointmentRef, {
      date: appointmentDate,
      time: appointmentTime,
      description: values.description ?? null,
      remarks: values.remarks
    })
    message.success('Update appointment successfully')
    globalStore.isLoading = false
    globalStore.modalVisible = false
    globalStore.refresh = random(1, true)
  }

  const initialValues = {
    ...selectedRow,
    date: selectedRow.key
  }

  const resetForm = () => {
    form.resetFields()
  }

  useEffect(() => {
    resetForm()
  }, [])

  return (
    <Modal
      width="70vh"
      title={`Update Appointment Remarks`}
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
        <Form.Item key="key" name="date" label="Date">
          <Input readOnly bordered={false} />
        </Form.Item>
        <Form.Item key="time" name="time" label="Time">
          <Input readOnly bordered={false} />
        </Form.Item>
        <Form.Item key="description" name="description" label="Description">
          <Input.TextArea readOnly />
        </Form.Item>
        <Form.Item key="remarks" name="remarks" label="Remarks">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RemarksForm
