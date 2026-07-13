import React, { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Globe2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { io_url } from "../components/utlis";

const SubClientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { client, user, token, isUser } = useSelector(
    (state) => state.subuser
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * Redux state is removed after browser reload.
   * Therefore, the sub-user is redirected to the login page.
   */
  useEffect(() => {
    if (
      !isUser ||
      !token ||
      !user ||
      user.role !== "sub_user"
    ) {
      navigate("/loginclient", {
        replace: true,
      });
    }
  }, [isUser, token, user, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const hasAccess = (permission) => {
    return Array.isArray(user?.access)
      ? user.access.includes(permission)
      : false;
  };

  const menuItems = useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        path: "/sub-client",
        icon: LayoutDashboard,
        show: true,
        end: true,
      },
      {
        title: "Create Leads",
        path: "/sub-client/create-leads",
        icon: Users,
        show:
        
          hasAccess("lead.create") 
        
      },
      
        {
        title: "Leads",
        path: "/sub-client/my-leads",
        icon: Users,
        show:
        
          hasAccess("lead.view") 
        
      },
    //   {
    //     title: "Leads",
    //     path: "/subclient/leads",
    //     icon: Users,
    //     show:
    //       hasAccess("lead.view") ||
    //       hasAccess("lead.create") ||
    //       hasAccess("lead.update") ||
    //       hasAccess("lead.delete"),
    //   },

      {
        title: "Website",
        path: "/subclient/website",
        icon: Globe2,
        show:
          client?.website &&
          (hasAccess("website.view") ||
            hasAccess("website.manage")),
      },
    //   {
    //     title: "My Profile",
    //     path: "/subclient/profile",
    //     icon: UserRound,
    //     show: true,
    //   },
    ];

    return items.filter((item) => item.show);
  }, [user?.access, client?.website]);

  const handleLogout = () => {
    /*
     * Clear your Redux sub-user state here.
     *
     * Example:
     * dispatch(logoutSubUser());
     */

    navigate("/loginclient", {
      replace: true,
    });
  };

  if (
    !isUser ||
    !token ||
    !user ||
    user.role !== "sub_user"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <ClientLogo
              logo={client?.logo}
              agencyName={client?.agencyname}
            />

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">
                {client?.agencyname || "Client Panel"}
              </h1>

              <p className="truncate text-xs text-slate-500">
                Sub-user dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Logged-in user */}
        <div className="px-4 py-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
                {getInitial(user?.name)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {user?.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-blue-100 pt-3 text-xs font-medium text-blue-700">
              <ShieldCheck size={15} />
              Authorized sub-user
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-5">
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Navigation
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3">
                        <Icon
                          size={19}
                          className={
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-700"
                          }
                        />

                        {item.title}
                      </span>

                      <ChevronRight
                        size={16}
                        className={`transition-transform group-hover:translate-x-0.5 ${
                          isActive
                            ? "text-blue-100"
                            : "text-slate-300"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Sub-user panel
              </p>

              <h2 className="text-lg font-bold text-slate-900">
                {getPageTitle(location.pathname)}
              </h2>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                {client?.agencyname}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {getInitial(user?.name)}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SubClientLayout;

const ClientLogo = ({ logo, agencyName }) => {
  const imageUrl = getImageUrl(logo);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={agencyName || "Agency logo"}
        className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 font-bold text-white">
      {getInitial(agencyName)}
    </div>
  );
};

const getInitial = (name) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
};

const getPageTitle = (pathname) => {
  if (pathname.includes("/leads")) {
    return "Leads";
  }

  if (pathname.includes("/website")) {
    return "Website";
  }

  if (pathname.includes("/profile")) {
    return "My Profile";
  }

  return "Dashboard";
};

const getImageUrl = (path) => {
  if (!path) {
    return "dummy.webp";
  }

 return `${io_url}${path}`
};

