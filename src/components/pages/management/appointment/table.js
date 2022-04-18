import { InfoCircleTwoTone } from '@ant-design/icons'
import { Button, Form, message, Popconfirm, Spin, Table, Tooltip } from 'antd'
import { onValue, ref, set } from 'firebase/database'
import { random } from 'lodash'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { db } from '../../../../firebase/firebase'
import globalStore from '../../../../lib/store/global'
import AppointmentForm from './form'

const AppointmentTable = ({ patientKey }) => {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const state = useSnapshot(globalStore)
  const [form] = Form.useForm()

  const columns = [
    {
      title: 'Patient',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a?.name > b?.name
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      sorter: (a, b) => a?.date > b?.date
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
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (values, record) => {
        const recordDate = moment(record.date)
        const todate = moment().format('YYYY-MM-DD')

        return (
          !recordDate.isBefore(todate) && (
            <Popconfirm
              title="Are you sure want to remove this appointment?"
              onConfirm={(event) => {
                event.stopPropagation()
                set(ref(db, `Users/${record.patientKey}/Appointment/${record.date}`), null)
                message.success('Appointment is successfully deleted')
                globalStore.refresh = random(1, true)
              }}
              onCancel={(event) => {
                event.stopPropagation()
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                Delete
              </Button>
            </Popconfirm>
          )
        )
      }
    },
    {
      title: 'History',
      dataIndex: 'history',
      key: 'history',
      width: 50,
      fixed: 'right',
      render: (value, record) => {
        return (
          <Tooltip
            placement="left"
            title={
              <>
                <p>
                  <span style={{ color: 'yellow' }}>{`Created at `}</span>
                  <span style={{ fontWeight: 'bold' }}>{record?.createdAt ?? '-'}</span>
                </p>
                <p>
                  <span style={{ color: 'yellow' }}>{`Last updated at `}</span>
                  <span style={{ fontWeight: 'bold' }}>{record?.updatedAt ?? '-'}</span>
                </p>
              </>
            }
          >
            <div style={{ textAlign: 'center' }}>
              <InfoCircleTwoTone />
            </div>
          </Tooltip>
        )
      }
    }
  ]

  useEffect(() => {
    if (patientKey.length > 0) {
      const tmpData = []
      let key = 1
      patientKey.forEach((patient, index) => {
        const patientRef = ref(db, `Users/${patient.key}`)
        onValue(
          patientRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const fullName = snapshot.child('Profile/fullName').val()

              snapshot.child('Appointment').forEach((date) => {
                const appointmentDate = date.key
                const values = date.val()

                tmpData.push({
                  key: key++,
                  patientKey: patient.key,
                  name: fullName,
                  date: appointmentDate,
                  time: values.time,
                  description: values.description,
                  createdAt: values.createdAt,
                  updatedAt: values.updatedAt
                })
              })

              if (index === patientKey.length - 1) {
                tmpData.sort((a, b) => {
                  const A = moment(a.createdAt)
                  const B = moment(b.createdAt)

                  if (A < B) {
                    return 1
                  } else if (A > B) {
                    return -1
                  }

                  return 0
                })
                setRows(tmpData)
              }
            }
          },
          {
            onlyOnce: true
          }
        )
      })
    }
  }, [patientKey, state.refresh])

  return (
    <>
      {rows ? (
        <>
          <Table
            columns={columns}
            dataSource={rows}
            onChange={(pagination, filters, sorter) => {
              setPage(pagination.current)
            }}
            onRow={(record, dataIndex) => {
              const recordDate = moment(record.date)
              const todate = moment().format('YYYY-MM-DD')

              if (!recordDate.isBefore(todate)) {
                return {
                  onClick: (e) => {
                    globalStore.selectedRow = record
                    globalStore.modalVisible = true
                  }
                }
              }
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
            <AppointmentForm form={form} patientKey={patientKey} action="update" />
          )}
        </>
      ) : (
        <Spin />
      )}
    </>
  )
}

export default AppointmentTable
