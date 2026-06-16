import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, LayoutDashboard, Users, Package, ShoppingCart, Banknote, CheckSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { user, activeOrganization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">BusinessOS</h1>
        </div>
        <div className="px-6 py-4 flex flex-col gap-1 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modules</div>
          <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavLink to="/employees" icon={<Users size={18} />} label="Employees" />
          <NavLink to="/customers" icon={<Users size={18} />} label="Customers" />
          <NavLink to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavLink to="/sales" icon={<ShoppingCart size={18} />} label="Sales" />
          <NavLink to="/expenses" icon={<Banknote size={18} />} label="Expenses" />
          <NavLink to="/tasks" icon={<CheckSquare size={18} />} label="Tasks" />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{activeOrganization?.name}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <h2 className="text-lg font-semibold">{activeOrganization?.name} Workspace</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/org-select")} className="text-sm text-blue-600 hover:underline">
              Switch Organization
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
