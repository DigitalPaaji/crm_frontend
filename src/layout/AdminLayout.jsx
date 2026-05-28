import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Settings, 
  LogOut,
  Menu,
  BrainCircuit,
  ChartNetwork,
  Users,
  ChevronDown,
  Circle,
  ZodiacLeo
} from 'lucide-react';
import { base_url } from '../components/utlis';
import { getUser } from '../store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import GetImage from '../components/GetImage';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
 const dispach = useDispatch()
 
const {info,isLoading,isError}= useSelector(state=>state.user)
console.log(info,isLoading,isError)

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: LayoutDashboard,
      exact: true 
    },
    { 
      name: 'Students', 
      icon: GraduationCap,
      links: [
        { name: "All Students", path: "/admin/student", icon: Users }
      ] 
    },
    { 
      name: 'Employees', 
      icon: Briefcase,
      links: [
        { name: "All Employees", path: "/admin/employee", icon: Users }
      ]
    },
    { 
      name: 'Agency',  
      icon: ChartNetwork,
      links: [
        { name: "All Agencies", path: "/admin/agency/", icon: Users },
        { name: "All Leads", path: "/admin/agency/all-leads", icon: ZodiacLeo }
      ]
  
    },
  ];


// const fetchUser= async(token)=>{
//     try {
//     const response = await fetch(`${base_url}/auth/user/verify`,{
//         method:"GET",
//          headers: {
//     Authorization: `Bearer ${token}`,
//   },
//     })    

//  const data  = await response.json();

//  if(data.success){

// navigate(`/${data.user.role}`)
// // dispach(getUser())

//  }else{
// navigate("/login")
//  }





    
//     } catch (error) {
//        navigation("/login") 
//     }
// }

 useEffect(()=>{

dispach(getUser())
if(info && info.role){

  navigate(`/${info.role}`)
}
    },[ ])
 
  
  useEffect(() => {
    navItems.forEach(item => {
      if (item.links?.some(link => location.pathname.includes(link.path))) {
        setActiveDropdown(item.name);
      }
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.clear("token");
    navigate("/");
  };

  const toggleDropdown = (itemName) => {
    // If sidebar is closed, open it when clicking a dropdown
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setActiveDropdown(itemName);
      return;
    }
    setActiveDropdown(prev => prev === itemName ? null : itemName);
  };



useEffect(()=>{

if(info && info.role){

  navigate(`/${info.role}`)
}


},[info?.role])

useEffect(()=>{

  if(isError){
  navigate("/login") 
  }


},[isError])


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div 
        className={`bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl transition-all duration-300 ease-in-out z-20 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800 transition-all duration-300">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold text-white tracking-wide whitespace-nowrap flex items-center gap-2">
              {info?.profile ? <GetImage profile={info.profile } heigth={"h-12"} />  :  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              
             
                <span className="text-white text-sm">AP</span>
              </div>
}
              Admin Panel
            </h2>
          ) : (
            <>   {info?.profile ? <GetImage profile={info.profile } heigth={"h-12"} />  :
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AP</span>
            </div>}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasLinks = item.links && item.links.length > 0;
            
            // Check if main path is active OR if any sublink is active
            const isMainActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.includes(item.path);
              
            const isChildActive = hasLinks && item.links.some(link => location.pathname.includes(link.path));
            const isActive = isMainActive || isChildActive;
            const isOpen = activeDropdown === item.name;

            return (
              <div key={item.name} className="flex flex-col">
                {/* Main Menu Item */}
                {hasLinks ? (
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    title={!isSidebarOpen ? item.name : ""}
                    className={`flex items-center justify-between rounded-xl transition-all duration-200 w-full group ${
                      isSidebarOpen ? 'px-4 py-3' : 'justify-center py-3 px-0'
                    } ${
                      isActive && !isOpen
                        ? 'bg-blue-600/10 text-blue-500 font-medium'
                        : isOpen 
                        ? 'bg-slate-800 text-white' 
                        : 'hover:bg-slate-800/50 hover:text-slate-100'
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
                      <Icon size={20} className={`min-w-[20px] transition-colors ${isActive && !isOpen ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'}`} />
                      {isSidebarOpen && (
                        <span className="whitespace-nowrap tracking-wide">{item.name}</span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    title={!isSidebarOpen ? item.name : ""}
                    className={`flex items-center rounded-xl transition-all duration-200 group ${
                      isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3 px-0'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium'
                        : 'hover:bg-slate-800/50 hover:text-slate-100'
                    }`}
                  >
                    <Icon size={20} className={`min-w-[20px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className="whitespace-nowrap tracking-wide">{item.name}</span>
                    )}
                  </Link>
                )}

                {/* Submenu Items (Dropdown) */}
                {hasLinks && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen && isSidebarOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-11 pr-3 py-1 space-y-1 border-l-2 border-slate-800 ml-6 my-1">
                      {item.links.map((subLink) => {
                        const SubIcon = subLink.icon || Circle;
                        const isSubActive = location.pathname==subLink.path;
              
                        return (
                          <Link 
                            key={subLink.name} 
                            to={subLink.path} 
                            className={`flex gap-3 items-center py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                              isSubActive 
                                ? 'bg-blue-600/20 text-blue-400 font-medium' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            <SubIcon size={14} className={isSubActive ? 'text-blue-400' : ''} /> 
                            {subLink.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions (Settings/Logout) */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-[#0f172a]">
          <Link 
            to="/ai" 
            title={!isSidebarOpen ? "Ai Mode" : ""}
            className={`flex items-center rounded-xl hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-all duration-200 group ${
              isSidebarOpen ? 'gap-3 px-4 py-2.5' : 'justify-center py-2.5 px-0'
            }`}
          >
            <BrainCircuit size={20} className="min-w-[20px]" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Ai Mode</span>}
          </Link>

          <Link 
            to="/admin/settings" 
            title={!isSidebarOpen ? "Settings" : ""}
            className={`flex items-center rounded-xl hover:bg-slate-800 hover:text-white text-slate-400 transition-all duration-200 group ${
              isSidebarOpen ? 'gap-3 px-4 py-2.5' : 'justify-center py-2.5 px-0'
            }`}
          >
            <Settings size={20} className="min-w-[20px]" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
          </Link>
          
          <button 
            title={!isSidebarOpen ? "Logout" : ""}
            onClick={handleLogout}
            className={`flex items-center w-full rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 group ${
              isSidebarOpen ? 'gap-3 px-4 py-2.5 text-left' : 'justify-center py-2.5 px-0'
            }`}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center px-6 border-b border-slate-200 z-10 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 capitalize hidden sm:block">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </h1>
          </div>

          {/* Optional: Add user profile placeholder here in the future */}
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-700 font-semibold shadow-sm">
            A
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 h-full overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;