import { Button, Form, Input, message, Modal } from 'antd'
import { push, ref, set, get } from 'firebase/database'
import { useEffect } from 'react'
import { useSnapshot } from 'valtio'

import { auth, db } from '../../../../firebase/firebase'
import globalStore from '../../../../lib/store/global'

const RequestForm = ({ form }) => {
  const { modalVisible, isLoading } = useSnapshot(globalStore)

  const handleRequest = (values) => {
    globalStore.isLoading = true
    if (auth.currentUser.email === values.email) {
      message.error('Cannot add yourself as patient')
      globalStore.isLoading = false
      return
    }
    // validate user email
    const userRef = ref(db, 'Users')
    const doctorRef = ref(db, 'Doctors')
    const requestRef = ref(db, 'Requests')
    let key = null
    let data = {}
    get(userRef).then((snapshot) => {
      snapshot.forEach((user) => {
        if (user.val().Profile.email === values.email) {
          if (user.val().attach != null) {
            message.error('This patient is already under another doctor')
            globalStore.isLoading = false
            return
          } else {
            key = push(requestRef)
            let doctorKey
            get(doctorRef).then((snapshot) => {
              snapshot.forEach((doctor) => {
                if (doctor.val().email === auth.currentUser.email) {
                  doctorKey = doctor.key
                  data = {
                    userKey: user.key,
                    doctorKey: doctorKey,
                    status: 'pending',
                    timeStamp: Date.now()
                  }
                }
              })

              get(requestRef).then((snapshot) => {
                if (snapshot.exists()) { // Requests table is not empty
                  let requestCount = 0
                  snapshot.forEach((request) => {
                    requestCount++
                    if (
                      request.val().userKey === data.userKey &&
                      request.val().doctorKey === data.doctorKey
                    ) { // if the same userKey and doctorKey is found
                      if (request.val().status === 'pending') {
                        message.error('The request is still in pending.')
                        globalStore.isLoading = false
                        return
                      } else if (request.val().status === 'accepted') {
                        message.success('This patient is already under your supervise.')
                        globalStore.isLoading = false
                        return
                      } else if (request.val().status === 'declined') {
                        const curRequestRef = ref(db, `Requests/${request.key}`)
                        set(curRequestRef, data)
                        message.success('Send request successfully')
                        globalStore.isLoading = false
                        globalStore.modalVisible = false
                        return
                      }
                    }

                    if (snapshot.size === requestCount) { // When last request has done compared and still havent return
                      set(key, data)
                      message.success('Send request successfully')
                      globalStore.isLoading = false
                      globalStore.modalVisible = false
                    }
                  })
                } else { // Only when Requests table is empty
                  set(key, data)
                  message.success('Send request successfully')
                  globalStore.isLoading = false
                  globalStore.modalVisible = false
                }
              })
            })
          }
        }
      })

      if (key === null) {
        message.error('Patient not found')
        globalStore.isLoading = false
        return
      }
    })
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
      title={`Add New Patient Request`}
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
          Send
        </Button>
      ]}
      maskClosable={false}
    >
      <Form form={form} onFinish={handleRequest}>
        <Form.Item
          key="email"
          name="email"
          label="Patient's email"
          rules={[{ required: true, message: "Patient's email is required" }]}
        >
          <Input type="email" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RequestForm
