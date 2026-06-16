import { Outlet, NavLink, useLocation, useNavigate } from "@inertiajs/react";
import {
  Bell,
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  MessageSquare,
  Inbox,
  KanbanSquare,
  BarChart3,
  Search,
  User,
  Settings
} from "lucide-react";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTailor = location.pathname.startsWith('/tailor');

  const customerLinks = [
    { name: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
    { name: "Apparel Catalog", path: "/customer/catalog", icon: ShoppingBag },
    { name: "My Orders", path: "/customer/tracking/ORD-100", icon: ListOrdered },
    { name: "Messages", path: "#", icon: MessageSquare },
  ];

  const tailorLinks = [
    { name: "Dashboard", path: "/tailor/dashboard", icon: LayoutDashboard },
    { name: "Incoming Orders", path: "/tailor/incoming", icon: Inbox },
    { name: "All Orders", path: "/tailor/orders/ORD-100", icon: ListOrdered },
    { name: "Production Board", path: "/tailor/kanban", icon: KanbanSquare },
    { name: "Reports", path: "/tailor/reports", icon: BarChart3 },
  ];

  const links = isTailor ? tailorLinks : customerLinks;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white">
              T
            </div>
            Tailor-Ease
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-2 font-medium">Switch Role (Demo)</p>
            <div className="flex bg-white rounded-md border border-slate-200 p-0.5">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className={`flex-1 text-xs py-1.5 rounded-sm font-medium ${!isTailor ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Customer
              </button>
              <button
                onClick={() => navigate('/tailor/dashboard')}
                className={`flex-1 text-xs py-1.5 rounded-sm font-medium ${isTailor ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tailor
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex-1 flex items-center">
            <div className="max-w-md w-full lg:max-w-xs relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${isTailor ? 'Admin' : 'Customer'}&background=c7d2fe&color=3730a3`} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700">{isTailor ? 'Marcus Tailor' : 'Sarah Jensen'}</p>
                <p className="text-xs text-slate-500">{isTailor ? 'Tailor Admin' : 'Customer'}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
