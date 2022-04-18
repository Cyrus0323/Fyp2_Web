import React from 'react'
import Crontab from 'reactjs-crontab'
import { useSnapshot } from 'valtio'
import { db } from '../../../firebase/firebase'
import { onValue, ref, set } from 'firebase/database'
import globalStore from '../../../lib/store/global'
import moment from 'moment'
import { isEmpty } from 'lodash'

const PostAppointmentFollowUp = () => {
  const state = useSnapshot(globalStore)
  const appointmentFollowUp = () => {
    state.patientKey.forEach((patientKey) => {
      const appointmentRef = ref(db, `Users/${patientKey.key}/Appointment`)
      const dateNow = moment(moment().startOf('date').format('YYYY-MM-DD'))
      onValue(appointmentRef, snapshot => {
        snapshot.forEach(date => {
          const aDate = moment(date.key.toString())
          // console.log(dateNow, aDate)

          if (dateNow.isSameOrAfter(aDate)) {
            if (!snapshot.child(date.key.toString()).child('remarks').exists()) {
              const dateRef = ref(db, `Users/${patientKey.key}/Appointment/${date.key.toString()}/remarks`)
              set(dateRef, '')
            }
          }
        })
      }, {
        onlyOnce: true
      })
    })
  }

  const scheduler = [
    {
      fn: appointmentFollowUp,
      id: '1',
      config: '* * * * *',
      name: 'Appointment Follow-up',
      description: 'follow-up after appointment'
    }
  ]

  return (
    state.isLoggedIn &&
    state.patientKey && <Crontab tasks={scheduler} timeZone="local" dashboard={{ hidden: true }} />
  )
}

export default PostAppointmentFollowUp
