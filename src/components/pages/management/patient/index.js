import { PlusOutlined } from '@ant-design/icons/lib/icons'
import { Button, Card, Form, PageHeader } from 'antd'
import { useSnapshot } from 'valtio'

import globalStore from '../../../../lib/store/global'
import RequestForm from './form'
import PatientTable from './table'

const PatientManagement = () => {
  const { modalVisible, selectedRow } = useSnapshot(globalStore)
  const [form] = Form.useForm()

  const primaryAction = (
    <>
      <Button key="add" type="primary" onClick={() => {
          globalStore.modalVisible = true
          globalStore.selectedRow = null
      }}>
        <PlusOutlined /> Send Request
      </Button>
      {modalVisible && !selectedRow && <RequestForm form={form} />}
    </>
  )

  return (
    <PageHeader title="Patients Table" extra={primaryAction}>
      <Card>
        <PatientTable />
      </Card>
    </PageHeader>
  )
}

export default PatientManagement
