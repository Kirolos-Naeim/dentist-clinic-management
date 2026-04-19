import { Activity, Boxes, CreditCard, FileBarChart2, LayoutDashboard, Stethoscope, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/services', label: 'Services', icon: Stethoscope },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/expenses', label: 'Expenses', icon: Activity },
];

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-6 py-8 text-white lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Clinic OS</p>
            <h2 className="mt-3 text-2xl font-bold">Dentist Management</h2>
            <p className="mt-2 text-sm text-slate-400">Offline-first local system for clinic operations.</p>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">
          <div className="mb-6 rounded-2xl bg-white px-5 py-4 shadow-soft lg:hidden">
            <h2 className="text-lg font-bold">Dentist Management</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isActive ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
