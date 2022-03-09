import { Liquid, Pie } from '@antv/g2plot'
import { Card } from 'antd'
import { ref, onValue, off } from 'firebase/database'
import { useEffect, useState } from 'react'

import { db } from '../../../../firebase/firebase'

const LiquidAvtiveMonitoring = ({ patientKey }) => {
  const [data, setData] = useState([{ active: 0, inactive: 0, total: 0 }])
  const patientRef = ref(db, `Users`)
  useEffect(() => {
    onValue(
      patientRef,
      (snapshot) => {
        let active = 0
        let inactive = 0
        const tmpData = []
        patientKey.forEach((p) => {
          if (snapshot.child(`${p.key}/Connection/Pulse/Device/monitoring`).val() === true) active++
          else inactive++
        })

        tmpData.push({ active: active, inactive: inactive, total: active + inactive })
        setData(tmpData)
      },
      {
        onlyOnce: true
      }
    )
  }, [patientKey])

  useEffect(() => {
    document.getElementById('avtiveMonitoringContainer').innerHTML = ''
    if (data.length > 0) {
      const liquidPlot = new Liquid('avtiveMonitoringContainer', {
        percent: data[0].active / data[0].total,
        outline: {
          border: 4
        },
        wave: {
          length: 128
        },
        height: 250,
        statistic: {
          content: {
            style: {
              fontSize: 'vw'
            },
            formatter: (percent) => {
              const active = data[0].active
              const total = data[0].total

              return `${active} out of ${total} in monitoring`
            }
          }
        },
        liquidStyle: ({ percent }) => {
          return {
            fill: percent < 0.5 ? '#FAAD14' : '#5B8FF9',
            stroke: percent < 0.5 ? '#FAAD14' : '#5B8FF9'
          }
        }
      })

      liquidPlot.render()
    }
  }, [data])

  return (
    <>
      <Card title="Active Monitoring" style={{ display: 'block' }}>
        <div id="avtiveMonitoringContainer"></div>
      </Card>
    </>
  )
}

export default LiquidAvtiveMonitoring
