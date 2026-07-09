import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Settings, 
  LogOut,
  Menu,
  BrainCircuit,
  CircleFadingPlus,
  GalleryHorizontalEnd,
  MessagesSquare,
  
} from 'lucide-react';
import { base_url } from '../components/utlis';
import { getUser } from '../store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import GetImage from '../components/GetImage';

const EmpLayout = () => {
   const location = useLocation();
const navigation = useNavigate()
const dispach = useDispatch()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
const {info,isLoading,isError}= useSelector(state=>state.user)
  const navItems = [
    { name: 'Dashboard', path: '/emp', icon: LayoutDashboard },
    { name: 'Students', path: '/emp/student', icon: GraduationCap },
    { name: 'Create Instagram', path: '/emp/insta/create', icon:CircleFadingPlus },
    { name: 'All Instagram', path: '/emp/insta/all', icon:GalleryHorizontalEnd },
      { name: 'Message', path:'/emp/message', icon: MessagesSquare },
  ];
  const handelLogout = async()=>{
  localStorage.clear("token");
navigation("/")
}



  useEffect(()=>{
 
 dispach(getUser())
 if(info && info.role){

  navigation(`/${info.role}`)
}

     },[])


useEffect(()=>{
if(info && info.role){

  navigation(`/${info.role}`)
}



},[info?.role])

useEffect(()=>{

  if(isError){
  navigation("/login") 
  }


},[isError])


  return (
     <div className="flex h-screen bg-gray-100 overflow-hidden">
          
          {/* Sidebar */}
          <div 
            className={`bg-gray-900 text-gray-300 flex flex-col shadow-xl transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'w-64' : 'w-20'
            }`}
          >
            
            {/* Sidebar Header */}
            <div className="h-16 flex items-center px-5 gap-3 border-b border-gray-800 transition-all duration-300">
              {isSidebarOpen ? (
                <>
   {info?.profile ? <GetImage profile={info.profile } heigth={"h-12"} />  : ""
              
}

 <h2 className="text-xl font-bold text-white tracking-wide whitespace-nowrap">
               {info?.name}
                </h2>
</>
              ) : (
                <>
                {info?.profile ? <GetImage profile={info.profile } heigth={"h-12"} />  :<h2 className="text-xl font-bold text-blue-500 tracking-wide">
                  AP
                </h2>
              
}

                </>
              )}
            </div>
    
            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
    
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={!isSidebarOpen ? item.name : ""} // Shows tooltip when collapsed
                    className={`flex items-center rounded-lg transition-all duration-200 ${
                      isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3 px-0'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="min-w-[20px]" />
                    {isSidebarOpen && (
                      <span className="font-medium whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
    
            {/* Bottom actions (Settings/Logout) */}
            <div className="p-4 border-t border-gray-800 space-y-2">
              <Link 
                to="/ai" 
                title={!isSidebarOpen ? "Ai" : ""}
                className={`flex items-center rounded-lg hover:bg-gray-800 hover:text-white transition-colors ${
                  isSidebarOpen ? 'gap-3 px-4 py-2' : 'justify-center py-2 px-0'
                }`}
              >
                <BrainCircuit size={20} className="min-w-[20px]" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">Ai Mode</span>}
              </Link>
                <Link 
                to="/emp/settings" 
                title={!isSidebarOpen ? "Settings" : ""}
                className={`flex items-center rounded-lg hover:bg-gray-800 hover:text-white transition-colors ${
                  isSidebarOpen ? 'gap-3 px-4 py-2' : 'justify-center py-2 px-0'
                }`}
              >
                <Settings size={20} className="min-w-[20px]" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
              </Link>
              
              <button 
                title={!isSidebarOpen ? "Logout" : ""}
                onClick={()=>handelLogout()}
                className={`flex items-center w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors ${
                  isSidebarOpen ? 'gap-3 px-4 py-2 text-left' : 'justify-center py-2 px-0'
                }`}
              >
                <LogOut size={20} className="min-w-[20px]" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">Logout</span>}
              </button>
            </div>
          </div>
    
          {/* Main Content */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            
            {/* Top Header Bar with Hamburger Menu */}
            <header className="h-16 bg-white shadow-sm flex items-center px-6 border-b border-gray-200 z-10">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle Sidebar"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            </header>
            
            {/* Page Content */}
            <main className="flex-1 h-full  overflow-x-hidden overflow-y-auto bg-gray-100 ">
              <Outlet />
            </main>
          </div>
    
        </div>
  )
}

export default EmpLayout