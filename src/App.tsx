import { HashRouter, Route, Routes } from "react-router-dom"
import Loginpage from "./pages/Loginpage"
import { Slide, ToastContainer } from "react-toastify"
import AdminHomePage from "./pages/admin/AdminHomePage"
import HomePage from "./pages/HomePage"
import EmployPage from "./pages/admin/EmployPage"
import AgencyPage from "./pages/admin/AgencyPage"
//admin
import AdminLayout from "./layout/AdminLayout"
import AllLeadsPage from "./pages/admin/AllLeadsPage"
import AdminLeadPage from "./pages/admin/AdminLeadPage"




import AiLayout from "./layout/AiLayout"
import { Provider } from "react-redux"
import store from "./store/configstore"
import Imagegeneration from "./pages/ai/Imagegeneration"
import Chatgeneration from "./pages/ai/Chatgeneration"
import AiHomePage from "./pages/ai/AiHomePage"

/////EMP

import EmpLayout from "./layout/EmpLayout"
import CreateIntaPage from "./pages/emp/CreateIntaPage"
import AllInstaAcc from "./pages/emp/AllInstaAcc"

import InstaPage from "./pages/emp/InstaPage"
// import InstaPostPage from "./pages/emp/InstaPostPage"
import PostPAge from "./pages/emp/PostPAge"
import CreateInstaPost from "./pages/emp/CreateInstaPost"
import Messages from "./pages/emp/Messages"

////Agency
import AgencyLAyout from "./layout/AgencyLAyout"
import CreateLeads from "./pages/agency/CreateLeads"
import AllLeads from "./pages/agency/AllLeads"
import MyLeads from "./pages/agency/MyLeads"
import LeadPage from "./pages/agency/LeadPage"
import FollowUp from "./pages/agency/FollowUp"
import SettingPage from "./pages/agency/SettingPage"
import MessagePage from "./pages/MessagePage"
import Createmeet from "./pages/Createmeet"
import Meetingpage from "./pages/Meetingpage"


import DefaultMessage from "./components/DefaultMessage"
import MessageCompo from "./components/MessageCompo"

import TaskPage from "./pages/TaskPage"
function App(): React.JSX.Element {

  return (
    <>
    <ToastContainer
position="top-center"
autoClose={2000}
hideProgressBar
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition={Slide}
/>
<Provider store={store}>

   <HashRouter>

<Routes>
 <Route path="/meet/:roomid" element={<Meetingpage />} />
 <Route path="/login" element={<Loginpage />} />


 <Route path="/" element={<HomePage />} />
   <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHomePage />} />
 <Route path="message" element={<MessagePage />} >
   
<Route index  element={<DefaultMessage />} />
<Route path=":chatid" element={<MessageCompo />}  />



 </Route>

        <Route path="settings" element={<SettingPage />} />
        {/* <Route path="student" element={<StudentPage />} />*/}
        




        <Route path="employee" element={<EmployPage />} /> 
        <Route path="agency"  >
     <Route index element={<AgencyPage />} />
     <Route path="all-leads" element={<AllLeadsPage />} />
     <Route path="lead/:leadid" element={<AdminLeadPage />} />
   
        </Route> 
                                                        
  

      </Route>



<Route path="/emp" element={<EmpLayout />}>
<Route path="settings" element={<SettingPage />} />


<Route   path="insta/create"  element={<CreateIntaPage />}   />
<Route   path="insta/all"  element={<AllInstaAcc />}   />
<Route   path="insta/page/:id" element={<InstaPage />}    >
<Route  index  element={<PostPAge />}  />
<Route  path="messages"   element={<Messages />}   />



<Route   path="post/create"   element={<CreateInstaPost />}   />
{/* <Route   path="post/get/:postid" element={<InstaPostPage />}     /> */}



</Route>
   <Route path="message" element={<MessagePage />} >
<Route index  element={<DefaultMessage />} />
<Route path=":chatid" element={<MessageCompo />}  />


      </Route>

        {/* <Route index element={<AdminHomePage />} /> */}
        {/* <Route path="student" element={<StudentPage />} />*/}
        
        {/* <Route path="employee" element={<EmployPage />} />  */}
      </Route>
<Route path="/agency" element={<AgencyLAyout />}>
        {/* <Route index element={<AdminHomePage />} /> */}
        {/* <Route path="student" element={<StudentPage />} />*/}
        
      <Route path="create-leads" element={<CreateLeads />} /> 
      <Route path="all-leads" element={<AllLeads />} />
      <Route path="follow-up" element={<FollowUp />} />
      <Route path="tasks" element={<TaskPage />} />
      <Route path="my-leads" element={<MyLeads />} />
      <Route path="lead/:leadid" element={<LeadPage />} />
      <Route path="settings" element={<SettingPage />} />
      <Route path="createmeet"  element={<Createmeet />}  />

      
      <Route path="message" element={<MessagePage />} >
      <Route index  element={<DefaultMessage />} />
      <Route path=":chatid" element={<MessageCompo />}  />

      </Route>
      

      </Route>


<Route path="/ai"  element={<AiLayout />} >
 <Route index element={<AiHomePage />} />

<Route path="text-image" element={<Imagegeneration />} />
<Route path="chat" element={<Chatgeneration />} />





</Route>


</Routes>
   </HashRouter>
   </Provider>
    </>
  )
}

export default App
