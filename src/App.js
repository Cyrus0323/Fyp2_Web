import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import React, { Suspense } from 'react'
import { Space, Spin } from 'antd'

import './App.less'
import SignUp from './components/signUp'
import SignIn from './components/signIn'
import ScrollToTop from './lib/utils/ScrollToTop'
import AuthenticatedLayout from './layout/AuthenticatedLayout'
import Dashboard from './components/pages/dashboard'
import PatientManagement from './components/pages/management/patient'
import PatientData from './components/pages/management/patient/[patientData]'
import globalStore, { checkAuthorization } from './lib/store/global'
import { useSnapshot } from 'valtio'

function PrivateRoute({ children, redirectTo }) {
  const state = useSnapshot(globalStore)
  return state.isLoggedIn ? children : <Navigate to={redirectTo} />
}

function App() {
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
            </Route>
          </Route>
          <Route exact path="/" element={<SignIn />} />
          <Route exact path="/sign-up" element={<SignUp />} />
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
