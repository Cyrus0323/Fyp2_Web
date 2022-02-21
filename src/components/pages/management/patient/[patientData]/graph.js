import { Line } from '@antv/g2plot'
import { ref, onValue } from 'firebase/database'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { db, auth } from '../../../../../firebase/firebase'
import { getTodayDateInString } from '../../../../../lib/utils/extra'

const PulseRateGraph = () => {
  const param = useParams()
  const patientPulseDataRef = ref(db, `Users/${param.key}/Connection/Pulse/Readings`)
  const [data, setData] = useState([])
  const today = getTodayDateInString()
  console.log(today)
  // const data = []

  useEffect(() => {
    onValue(patientPulseDataRef, (snapshot) => {
      const tmpData = []
      if (snapshot.exists()) {
        // setIsLoading(true)

        snapshot.forEach((reading) => {
          const key = reading.key // date
          const part = key.split(' ')
          const day = part[2]
          const month = part[1]
          const year = part[5]
          const time = part[3]

          tmpData.push({ time: time, bpm: reading.val() })
        })

        // console.log(tmpData)
        setData(tmpData)
      }
    })
  }, [])

  useEffect(() => {
    document.getElementById("pulseGraph").innerHTML = ""
    if (data.length > 0) {
      const line = new Line('pulseGraph', {
        data,
        padding: 'auto',
        xField: 'time',
        yField: 'bpm' // 'Beats Per Minute',
      })

      line.render()
    } else {
      document.getElementById("pulseGraph").innerHTML = "No data"
    }
  }, [data])

  return <div id="pulseGraph"></div>
}

export default PulseRateGraph
