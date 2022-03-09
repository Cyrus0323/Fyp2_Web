import { Pie } from '@antv/g2plot'
import { Card } from 'antd'
import { ref, onValue } from 'firebase/database'
import { useEffect, useState } from 'react'

import { db } from '../../../../firebase/firebase'

const SexPiePlot = ({ patientKey }) => {
  const [data, setData] = useState([])
  const patientRef = ref(db, `Users`)

  useEffect(() => {
    onValue(
      patientRef,
      (snapshot) => {
        let male = 0
        let female = 0
        const tmpData = []

        patientKey.forEach((p) => {
          if (snapshot.child(`${p.key}/Profile/gender`).val() === 'Male') male++
          else female++
        })

        tmpData.push({ sex: 'male', count: male })
        tmpData.push({ sex: 'female', count: female })
        setData(tmpData)
      },
      {
        onlyOnce: true
      }
    )
  }, [patientKey])

  useEffect(() => {
    document.getElementById('sexContainer').innerHTML = ''
    if (data.length > 0) {
      const piePlot = new Pie('sexContainer', {
        data,
        height: 250,
        angleField: 'count',
        colorField: 'sex',
        radius: 0.6,
        color: ['#1890ff', '#f04864'],
        label: false,
        interactions: [
          {
            type: 'element-active'
          }
        ]
      })

      piePlot.render()
    }
  }, [data])

  return (
    <>
      <Card title='Gender' style={{ display: 'block' }}>
        <div id="sexContainer"></div>
      </Card>
    </>
  )
}

export default SexPiePlot
