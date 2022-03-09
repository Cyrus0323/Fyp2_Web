import { Line } from '@antv/g2plot'
import { limitToLast, onValue, query, ref } from 'firebase/database'
import moment from 'moment'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../../../../firebase/firebase'

const RealtimePulseRateGraph = () => {
  let firstTry = true
  const param = useParams()
  const patientPulseDataRef = ref(
    db,
    `Users/${param.key}/Connection/Pulse/Readings/${moment()
      .startOf('date')
      .format('YYYY-MM-DD')
      .toString()}`
  )
  let line = null

  //   for (let i = 0; i < 10; i++) {
  //     data.push({ time: 0, bpm: 0 })
  //   }

  useEffect(() => {
    line = new Line('realtimePulseGraph', {
      data: [],
      padding: 'auto',
      xField: 'time',
      yField: 'bpm',
      smooth: false,
      point: {},
      xAxis: {
        title: {
          text: 'Time',
          style: {
            fontWeight: 'bold'
          }
        },
        label: {
          style: {
            fontWeight: 'bold'
          }
        }
      },
      yAxis: {
        title: {
          text: 'Beats Per Minute (bpm)',
          style: {
            fontWeight: 'bold'
          }
        },
        label: {
          style: {
            fontWeight: 'bold'
          }
        }
      },
      annotations: [
        {
          type: 'region',
          start: ['min', 59],
          end: ['max', 0]
        },
        {
          type: 'line',
          start: ['min', 60],
          end: ['max', 60],
          style: {
            stroke: '#F4664A',
            lineDash: [2, 2]
          }
        },
        {
          type: 'text',
          position: ['min', 60],
          content: 'min bpm',
          offsetY: -4,
          style: {
            textBaseline: 'bottom'
          }
        },
        {
          type: 'region',
          start: ['min', 'max'],
          end: ['max', 101]
        },
        // {
        //   type: 'regionFilter',
        //   start: ['min', 'max'],
        //   end: ['max', 101],
        //   color: '#F4664A'
        // },
        {
          type: 'line',
          start: ['min', 100],
          end: ['max', 100],
          style: {
            stroke: '#F4664A',
            lineDash: [2, 2]
          }
        },
        {
          type: 'text',
          position: ['min', 100],
          content: 'max bpm',
          offsetY: -4,
          style: {
            textBaseline: 'bottom'
          }
        }
      ],
    //   interactions: [
    //     {
    //       type: 'brush-x'
    //     }
    //   ]
    })

    line.render()
  }, [])

  onValue(query(patientPulseDataRef, limitToLast(1)), (snapshot) => {
    if (snapshot.exists() && !firstTry) {
      snapshot.forEach((reading) => {
        let newData = null
        if (line.options.data.length === 20) {
            newData = line.options.data.slice(1).concat({ time: reading.key, bpm: reading.val() })
        } else {
            newData = line.options.data.concat({ time: reading.key, bpm: reading.val() })
        }
        line.changeData(newData)
      })
    } else {
      firstTry = false
    }
  })

  return (
    <>
      <div id="realtimePulseGraph"></div>
    </>
  )
}

export default RealtimePulseRateGraph
