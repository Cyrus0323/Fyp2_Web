import { InfoCircleTwoTone } from '@ant-design/icons'
import {
  Button,
  Card,
  Form,
  Image,
  message,
  PageHeader,
  Popconfirm,
  Spin,
  Table,
  Tooltip
} from 'antd'
import { onValue, ref, set } from 'firebase/database'
import { random } from 'lodash'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import { db } from '../../../../../firebase/firebase'
import globalStore from '../../../../../lib/store/global'
import MedicationForm from './medication_form'

const MedicationTable = () => {
  const params = useParams()
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const state = useSnapshot(globalStore)
  const [form] = Form.useForm()

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 150,
      render: (value, record) => {
        if (value?.startsWith('http')) {
          return (
            <Image
              src={value}
              width={100}
              preview={false}
              onClick={(event) => event.stopPropagation()}
            />
          )
        } else return <></>
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      sorter: (a, b) => a?.name > b?.name
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      width: 100,
      sorter: (a, b) => a?.volume > b?.volume
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
        return (
          <Popconfirm
            title="Are you sure want to remove this medication?"
            onConfirm={(event) => {
              event.stopPropagation()
              set(ref(db, `Users/${params.key}/Medication/${record.key}`), null)
              message.success('Medication is successfully deleted')
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
    const tmpData = []
    const patientRef = ref(db, `Users/${params.key}/Medication`)
    onValue(
      patientRef,
      (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((medication) => {
            // const appointmentDate = medication.key
            const values = medication.val()

            tmpData.push({
              key: medication.key,
              name: values.name,
              image_url: values.image_url,
              volume: values.volume,
              description: values.description,
              createdAt: values.createdAt,
              updatedAt: values.updatedAt
            })
          })

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
      },
      {
        onlyOnce: true
      }
    )
  }, [state.refresh])

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
            <MedicationForm form={form} patientKey={params.key} action="update" />
          )}
        </>
      ) : (
        <Spin />
      )}
    </>
  )
}

export default MedicationTable
