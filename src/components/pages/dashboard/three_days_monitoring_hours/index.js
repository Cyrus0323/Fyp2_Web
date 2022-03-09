import { Column } from '@antv/g2plot'
import { Card } from 'antd'
import { onValue, ref } from 'firebase/database'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { db } from '../../../../firebase/firebase'

const ThreeDaysMonitoringHours = ({ patientKey }) => {
  const [data, setData] = useState([])
  const patientRef = ref(db, `Users`)
  const threeDate = []

  for (let i = 0; i < 3; i++) {
    threeDate.push(moment().startOf('date').subtract(i, 'day').format('YYYY-MM-DD').toString())
  }

  useEffect(() => {
    if (patientKey.length > 0) {
      onValue(
        patientRef,
        (snapshot) => {
          let tmpData = []
          patientKey.forEach((p) => {
            threeDate.forEach((date) => {
              const name = snapshot.child(`${p.key}/Profile/fullName`).val() // get name
              const count = snapshot.child(`${p.key}/Connection/Pulse/Readings/${date}`).size // record count
              // Each record 1s, so count/60/60 to get in hours
              const hours = count / 60 / 60
              tmpData.push({ patient: name, date: date, hours: parseFloat(hours.toFixed(3)) })
            })
          })

          setData(tmpData)
        },
        {
          onlyOnce: true
        }
      )
    }
  }, [patientKey])

  useEffect(() => {
    document.getElementById('monitoringHoursContainer').innerHTML = ''
    if (data.length > 0) {
      const columnPlot = new Column('monitoringHoursContainer', {
        data,
        height: 250,
        isGroup: true,
        xField: 'patient',
        yField: 'hours',
        seriesField: 'date',
        label: {
          position: 'middle',
          layout: [
            {
              type: 'interval-adjust-position'
            }
          ]
        },
        brush: {
          enabled: true,
          type: 'x-rect',
          action: 'filter'
        }
      })

      columnPlot.render()
    }
  }, [data])

  return (
    <>
      <Card title="3-Days Monitoring in Hours" style={{ display: 'block' }}>
        <div id="monitoringHoursContainer"></div>
      </Card>
    </>
  )
}

export default ThreeDaysMonitoringHours
