import { Line } from '@antv/g2plot'
import { ref, onValue, off } from 'firebase/database'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DatePicker, Space, Tooltip } from 'antd'

import { db } from '../../../../../firebase/firebase'
import moment from 'moment'
import { InfoCircleTwoTone } from '@ant-design/icons/lib/icons'

const PulseRateGraph = () => {
  const param = useParams()
  const [data, setData] = useState([])
  const [date, setDate] = useState(
    sessionStorage.getItem('notiSelectedDate')
      ? moment(sessionStorage.getItem('notiSelectedDate'))
      : moment().startOf('date')
  )
  
  const patientPulseDataRef = ref(
    db,
    `Users/${param.key}/Connection/Pulse/Readings/${date.format('YYYY-MM-DD').toString()}`
  )
  let line = null

  const disabledDate = (current) => {
    const now = moment().startOf('date')
    const ninetyDaysAgo = moment().subtract(90, 'days').startOf('date') // today minus 90 days

    return ninetyDaysAgo.isAfter(current.startOf('date')) || now.isBefore(current.startOf('date'))
  }

  useEffect(() => {
    onValue(
      patientPulseDataRef,
      (snapshot) => {
        const tmpData = []
        if (snapshot.exists()) {
          snapshot.forEach((reading) => {
            const time = reading.key
            tmpData.push({ time: time, bpm: reading.val() })
          })
        }

        setData(tmpData)
      },
      {
        onlyOnce: true
      }
    )
  }, [date])

  useEffect(() => {
    document.getElementById('pulseGraph').innerHTML = ''

    line = new Line('pulseGraph', {
      data: data,
      renderer: 'svg',
      padding: 'auto',
      xField: 'time',
      yField: 'bpm', // 'Beats Per Minute',
      connectNulls: false,
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
      // slider: {},
      annotations: [
        // {
        //   type: 'regionFilter',
        //   start: ['min', 59],
        //   end: ['max', 0],
        //   color: '#F4664A'
        // },
        {
          type: 'region',
          start: ['min', 59],
          end: ['max', 0]
        },
        {
          type: 'line', // min bpm
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
          type: 'line', // max bpm
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
      interactions: [
        {
          type: 'brush-x'
        }
      ]
    })

    line.render()
  }, [data])

  return (
    <>
      <Space direction="horizontal" size="small" style={{ marginBottom: '35px', display: 'flex' }}>
        <DatePicker
          disabledDate={disabledDate}
          onChange={(selectedDate) => {
            off(patientPulseDataRef)
            setDate(selectedDate)
          }}
          defaultValue={date}
          allowClear={false}
        />
        <Tooltip
          placement="right"
          title={
            <p style={{ textAlign: 'center' }}>
              Highlight a specific time range to zoom-in.<p>Double click to reset view.</p>
            </p>
          }
        >
          <InfoCircleTwoTone />
        </Tooltip>
      </Space>
      <div id="pulseGraph"></div>
    </>
  )
}

export default PulseRateGraph
