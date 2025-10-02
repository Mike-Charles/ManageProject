// import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import "bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './Login'
import ClerkDashboard from './ClerkDashboard/ClerkDashboard'
import RegistrarDashboard from './RegistrarDashboard/RegistrarDashboard'
import JudgeDashboard from './JudgeDashboard/JudgeDashboard'
import AdminDashboard from './AdminDashboard/Admindashboard'
import ManageUsers from './AdminDashboard/ManageUsers'
import CreateUser from './AdminDashboard/CreateUser'
import AssignedCases from './RegistrarDashboard/AssignedCases'
import CasesAssigned from './JudgeDashboard/CasesAssigned'
import ScheduleHearing from './JudgeDashboard/ScheduleHearing'
import ScheduleNewHearing from './JudgeDashboard/ScheduleNewHearing'
import Progress from './JudgeDashboard/Progress'
import JudgementHistory from './JudgeDashboard/JudgementHistory'
import PlaceJudgment from './JudgeDashboard/PlaceJudgement'
import Notification from './JudgeDashboard/Notification'
import CaseRegistration from './ClerkDashboard/CaseRegistration'
import CaseForm from './ClerkDashboard/CaseForm'
import SubmittedCase from './RegistrarDashboard/SubmittedCase'
import ApprovedCases from './RegistrarDashboard/ApprovedCases'
import DisapprovedCases from './RegistrarDashboard/DisapprovedCases'




function App() {
  

  return (
    <div>
      <BrowserRouter>
        <Routes>
        

          {/* Clerk routes */}
          <Route path='/caseregistration' element={<CaseRegistration />}></Route>
          <Route path='/clerkdashboard' element={<ClerkDashboard />}></Route>
          <Route path='/caseform' element={<CaseForm />}></Route>
          



          <Route path='/' element={<Login />}></Route>
          <Route path='/login' element={<Login />}></Route>
          
          {/* Judge Routes */}
          <Route path='/judgedashboard' element={<JudgeDashboard />}></Route>
          <Route path='/casesassigned' element={<CasesAssigned />}></Route>
          <Route path='/schedulehearing' element={<ScheduleHearing />}></Route>
          <Route path='/schedulenewhearing' element={<ScheduleNewHearing />}></Route>
          <Route path='/progress' element={<Progress />}></Route>
          <Route path='/judgmenthistory' element={<JudgementHistory />}></Route>
          <Route path='/placejudgment/:caseId' element={<PlaceJudgment />}></Route>
          <Route path='/notification' element={<Notification />}></Route>



          {/* Registrar Routes */}
          <Route path='/registrardashboard' element={<RegistrarDashboard />}></Route>
          <Route path='/assignedcases' element={<AssignedCases />}></Route>
          <Route path='/submittedcase' element={<SubmittedCase />}></Route>
          <Route path='/approvedcases' element={<ApprovedCases />}></Route>
          <Route path='/disapprovedcases' element={<DisapprovedCases />}></Route>


          {/* Admin Routes */}
          <Route path='/admindashboard' element={<AdminDashboard />}></Route>
          <Route path='/manageusers' element={<ManageUsers />}></Route>
          <Route path='/createuser' element={<CreateUser />}></Route>

          {/* Fallback Route */}
          <Route path='*' element={<Login />}></Route>





        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
