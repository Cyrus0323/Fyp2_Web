import { Spin, Table } from 'antd'
import { ref, onValue } from 'firebase/database'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { auth, db } from '../../../../firebase/firebase'

const PatientTable = () => {
  const patientRef = ref(db, 'Users')
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  let data = []

  const columns = [
    {
      title: 'Patient',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => a?.fullName > b?.fullName
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 100,
      fixed: 'left'
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 50,
      sorter: (a, b) => a?.age > b?.age
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
      sorter: (a, b) => a?.gender > b?.gender
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      width: 60
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (value, record) => {
        return (
          <>
            <Link style={{color: '#37D8FD'}} to={`/healthcare/management/patients/${record.key}`}>View</Link>
          </>
        )
      }
    }
  ]

  useEffect(() => {
    onValue(patientRef, (snapshot) => {
      data = []
      snapshot.forEach((patient) => {
        if (patient.val().Profile.attach === auth.currentUser.uid) {
          data.push(patient.val().Profile)
        }
      })
      setRows(data)
    })
  }, [])

  return (
    <>
      {rows ? (
        <Table
          columns={columns}
          dataSource={rows}
          onChange={(pagination, filters, sorter) => {
            console.log(pagination)
          }}
          pagination={{ total: rows.length, pageSize: limit, current: page }}
          scroll={{ x: 570 }}
          sticky
        />
      ) : (
        <Spin />
      )}
    </>
  )
}

export default PatientTable
