import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import React, { Suspense } from 'react'
import { Space, Spin } from 'antd'
import { useSnapshot } from 'valtio'

import './App.less'
import SignUp from './components/signUp'
import SignIn from './components/signIn'
import ScrollToTop from './lib/utils/ScrollToTop'
import AuthenticatedLayout from './layout/AuthenticatedLayout'
import Dashboard from './components/pages/dashboard'
import PatientManagement from './components/pages/management/patient'
import PatientData from './components/pages/management/patient/[patientData]'
import globalStore, { checkAuthorization } from './lib/store/global'
import AppointmentManagement from './components/pages/management/appointment'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase/firebase'
import { onValue, ref } from 'firebase/database'
import PostAppointmentFollowUp from './components/crontab/appointment'
import ForgotPassword from './components/forgot_password'

function PrivateRoute({ children, redirectTo }) {
  const state = useSnapshot(globalStore)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const doctorRef = ref(db, `Doctors/${user.uid}/attach`)
      onValue(doctorRef, (snapshot) => {
        const tmpKey = []
        snapshot.forEach((patientKey) => {
          tmpKey.push({ key: patientKey.val() })
        })

        globalStore.patientKey = tmpKey
      })
    }
  })

  return state.isLoggedIn ? children : <Navigate to={redirectTo} />
}

function App() {
  const state = useSnapshot(globalStore)

  return (
    <Suspense
      fallback={
        <Space align="center" style={{ width: '100vw', height: '100vh', justifyContent: 'center' }}>
          <Spin />
        </Space>
      }
    >
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            path="/healthcare"
            element={
              <PrivateRoute redirectTo="/">
                {state.isLoggedIn && state.patientKey.length > 0 && <PostAppointmentFollowUp />}
                <AuthenticatedLayout />
              </PrivateRoute>
            }
          >
            <Route exact path="dashboard" element={<Dashboard />} />
            <Route path="management">
              <Route path="patients">
                <Route exact path="" element={<PatientManagement />} />
                <Route exact path=":key" element={<PatientData />} />
              </Route>
              <Route exact path="appointments" element={<AppointmentManagement />} />
            </Route>
          </Route>
          <Route exact path="/" element={<SignIn />} />
          <Route exact path="/sign-up" element={<SignUp />} />
          <Route exact path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
    </Suspense>
  )
}

new Promise(() => {
  checkAuthorization()
}).catch((error) => {
  console.log(error)
})

export default App
