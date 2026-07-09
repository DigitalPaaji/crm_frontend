import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  MessageSquareText,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  WavesHorizontal,
} from "lucide-react";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { base_url, io_url } from "../components/utlis";
import { toast } from "react-toastify";

const ClientLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetails] = useState(null);

  const { token } = useSelector((state) => state.token);
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/client",
      icon: LayoutDashboard,
    },
     {
      title: "Leads Req.",
      path: "/client/leads-requi",
      icon: WavesHorizontal,
    },
    {
      title: "Create Leads",
      path: "/client/create-leads",
      icon: GraduationCap,
    },
    { 
      title: "Reports",
      path: "/client/reports",
      icon: FileText,
    },
    {
      title: "Requests",
      path: "/client/requests",
      icon: MessageSquareText,
    },
    {
      title: "Profile",
      path: "/client/profile",
      icon: UserRound,
    },
    {
      title: "Settings",
      path: "/client/settings",
      icon: Settings,
    },
  ];

  const clientLogo = userDetail?.logo
    ? `${io_url}${userDetail.logo}`
    : "/logo.webp";

  const clientName = userDetail?.agencyname || userDetail?.ownername || "Client";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/loginclient", { replace: true });
  };

  const fetchClient = async () => {
    try {
      setLoading(true);

      if (!token) {
        navigate("/loginclient", { replace: true });
        return;
      }

      const response = await fetch(`${base_url}/client/verifyclient`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserDetails(data.user);
      } else {
        toast.error(data.message || "Please login again");
        navigate("/loginclient", { replace: true });
      }
    } catch (error) {
      toast.error("Session expired. Please login again");
      navigate("/loginclient", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [token]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static left-0 top-0 z-40 h-full w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-300 ${
          openSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 p-2 shrink-0 overflow-hidden">
                <img
                  src="/logo.webp"
                  alt="Digital Paaji"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 truncate">
                  Digital Paaji
                </h1>
                <p className="text-xs text-slate-500">Client Panel</p>
              </div>
            </div>

            <button
              onClick={() => setOpenSidebar(false)}
              className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Client Info */}
          <div className="px-4 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <div className="h-12 w-12 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                <img
                  src={clientLogo}
                  alt={clientName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {clientName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {userDetail?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/client"}
                  onClick={() => setOpenSidebar(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Card */}
          <div className="p-4 border-t border-slate-200">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-4">
              <p className="text-sm font-semibold text-slate-800">
                Need Support?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Contact Digital Paaji team for help.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenSidebar(true)}
              className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Client Dashboard
              </h2>
              <p className="text-xs text-slate-500">
                Welcome, {clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">
                {userDetail?.ownername}
              </p>
              <p className="text-xs text-slate-500">
                {userDetail?.active ? "Active Client" : "Inactive Client"}
              </p>
            </div>

            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 overflow-hidden">
              <img
                src={clientLogo}
                alt={clientName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6">
          <Outlet context={{ userDetail }} />
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;