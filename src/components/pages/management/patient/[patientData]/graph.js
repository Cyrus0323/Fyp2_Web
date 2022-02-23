import { Line } from '@antv/g2plot'
import { ref, onValue, off } from 'firebase/database'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DatePicker, Space } from 'antd'

import { db } from '../../../../../firebase/firebase'
import moment from 'moment'

const PulseRateGraph = () => {
  const param = useParams()
  const [data, setData] = useState([])
  const [date, setDate] = useState(moment().startOf('date'))
  const patientPulseDataRef = ref(
    db,
    `Users/${param.key}/Connection/Pulse/Readings/${date.format('YYYY-MM-DD').toString()}`
  )
  console.log(patientPulseDataRef.toString())

  const disabledDate = (current) => {
    const now = moment().startOf('date')
    const ninetyDaysAgo = moment().subtract(90, 'days').startOf('date') // today minus 90 days

    return ninetyDaysAgo.isAfter(current.startOf('date')) || now.isBefore(current.startOf('date'))
  }

  useEffect(() => {
    onValue(patientPulseDataRef, (snapshot) => {
      const tmpData = []
      if (snapshot.exists()) {
        snapshot.forEach((reading) => {
          const time = reading.key
          tmpData.push({ time: time, bpm: reading.val() })
        })

        // console.log(tmpData)
      }
      setData(tmpData)
    })
  }, [date])

  useEffect(() => {
    document.getElementById('pulseGraph').innerHTML = ''
    console.log(data)
    // if (data.length > 0) {
    const line = new Line('pulseGraph', {
      data,
      padding: 'auto',
      xField: 'time',
      yField: 'bpm' // 'Beats Per Minute',
    })

    line.render()
    // } else {
    // document.getElementById("pulseGraph").innerHTML = "No data"
    // }
  }, [data])

  return (
    <>
      <DatePicker
        style={{ marginBottom: '35px' }}
        disabledDate={disabledDate}
        onChange={(selectedDate) => {
          off(patientPulseDataRef)
          setDate(selectedDate)
        }}
        defaultValue={date}
        allowClear={false}
      />

      <div id="pulseGraph"></div>
    </>
  )
}

export default PulseRateGraph
