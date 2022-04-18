import { useSnapshot } from 'valtio'
import { useState, useEffect } from 'react'
import globalStore from '../../../../../lib/store/global'
import { onValue, ref } from 'firebase/database'
import { db } from '../../../../../firebase/firebase'
import { useParams } from 'react-router-dom'
import { Card, Form, PageHeader, Spin, Table } from 'antd'
import RemarksForm from './appointment_form'
import moment from 'moment'

const AppointmentRemarks = () => {
  const param = useParams()
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [form] = Form.useForm()
  const state = useSnapshot(globalStore)
  const patientAppointmentRef = ref(db, `Users/${param.key}/Appointment`)

  const columns = [
    {
      title: 'Date',
      dataIndex: 'key',
      key: 'key',
      width: 100,
      sorter: (a, b) => a?.key > b?.key
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 100,
      sorter: (a, b) => a?.time > b?.time
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200
    }
  ]

  useEffect(() => {
    const tmpData = []
    onValue(patientAppointmentRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((date) => {
          if (date.child('remarks').exists()) {
            const appointmentDate = date.key
            const values = date.val()

            tmpData.push({
              key: appointmentDate,
              time: values.time,
              description: values.description,
              remarks: values.remarks
            })
          }
        })

        tmpData.sort((a, b) => {
          const A = moment(a.key)
          const B = moment(b.key)

          if (A < B) {
            return 1
          } else if (A > B) {
            return -1
          }

          return 0
        })

        setRows(tmpData)
      }
    })
  }, [state.refresh])

  return (
    <>
      <PageHeader title="Appointments Follow-up Table">
        <Card>
          {rows ? (
            <>
              <Table
                columns={columns}
                dataSource={rows}
                onChange={(pagination, filters, sorter) => {
                  setPage(pagination.current)
                }}
                onRow={(record, dataIndex) => {
                  const recordDate = moment(record.key)
                  const todate = moment().format('YYYY-MM-DD')

                  // if (!recordDate.isBefore(todate)) {
                  return {
                    onClick: (e) => {
                      globalStore.selectedRow = record
                      globalStore.modalVisible = true
                    }
                  }
                  // }
                }}
                pagination={{
                  total: rows.length,
                  pageSize: limit,
                  current: page,
                  position: ['none', 'bottomCenter']
                }}
                scroll={{ x: 900 }}
                sticky
              />
              {state.modalVisible && state.selectedRow && (
                <RemarksForm form={form} patientKey={param.key} />
              )}
            </>
          ) : (
            <Spin />
          )}
        </Card>
      </PageHeader>
    </>
  )
}

export default AppointmentRemarks
