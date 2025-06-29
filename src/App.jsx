import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './Login'
import AdminDashboard from './AdminDash/AdminDashboard'
import Judge from './Judge'
import ClerkDashboard from './ClerkDashboard'
import ManageUsers from './AdminDash/ManageUsers'
import ManageCases from './AdminDash/ManageCases'
import ManageSchedules from './AdminDash/ManageSchedules'

function App() {
  

  return (
    <div>
      <BrowserRouter>
        <Routes>

          <Route path='/register' element={<Signup />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/judge' element={<Judge />}></Route>
          <Route path='/clerkdashboard' element={<ClerkDashboard />}></Route>
          <Route path='/AdminDashboard' element={<AdminDashboard />}></Route>
          <Route path='/ManageCases' element={<ManageCases />}></Route>
          <Route path='/ManageSchedules' element={<ManageSchedules />}></Route>

          {/* Admin Dashboard */}
          <Route path='/ManageUsers' element={<ManageUsers />}></Route>          
          <Route path='/' element={<Login />}></Route>
          <Route path='*' element={<h1>404 Not Found</h1>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
