// DashboardLayout.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

interface DashboardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  title,
  description,
  children,
}: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore(); // Pull in theme state and toggle function
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block transition-colors duration-200">
          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">QueuePlus</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monitoring Dashboard</p>
          </div>

          <div className="p-4">
            <nav className="space-y-2">
              <SidebarLink to="/profile">My Profile</SidebarLink>
              {(user?.role === "admin" || user?.role === "staff") && (
                <SidebarLink to="/">Dashboard</SidebarLink>
              )}
              {user?.role === "user" && (
                <SidebarLink to="/my-queues">My Queues</SidebarLink>
              )}
              {(user?.role === "admin" || user?.role === "staff") && (
                <SidebarLink to="/queues">Queue Board</SidebarLink>
              )}
              {user?.role === "admin" && (
                <>
                  <SidebarLink to="/branches">Branches</SidebarLink>
                  <SidebarLink to="/services">Services</SidebarLink>
                </>
              )}
              {(user?.role === "admin" || user?.role === "staff") && (
                <>
                  <SidebarLink to="/health">Health Check</SidebarLink>
                  <SidebarLink to="/monitor/system">System Monitor</SidebarLink>
                  <SidebarLink to="/monitor/runtime">Runtime Monitor</SidebarLink>
                </>
              )}
            </nav>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {user?.name || user?.email}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Role: {user?.role}</p>

              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 transition-colors duration-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* THEME TOGGLE BUTTON */}
                <button
                  onClick={toggleTheme}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition"
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>

                <div className="rounded-xl bg-slate-50 px-4 py-2 text-right dark:bg-slate-700/50">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 text-slate-900 dark:text-white">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-blue-600 text-white dark:bg-blue-500"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
        }`
      }
    >
      {children}
    </NavLink>
  );
}