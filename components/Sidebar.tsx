'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '/Icons/dashboard.svg',
    activeIcon: '/Icons/dashboard_active.svg',
  },
  {
    name: 'Reminders',
    href: '/reminders',
    icon: '/Icons/reminder.svg',
    activeIcon: '/Icons/reminder-active.svg',
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: '/Icons/calender.svg',
    activeIcon: '/Icons/calender-active.svg',
  },
  {
    name: 'Call History',
    href: '/call-history',
    icon: '/Icons/call-history.svg',
    activeIcon: '/Icons/call-history-active.svg',
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: '/Icons/patients.svg',
    activeIcon: '/Icons/patients-active.svg',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: '/Icons/settings.svg',
    activeIcon: '/Icons/settings-active.svg',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 z-50">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-gray-200">
          <Image
            src="/logo.svg"
            alt="ClinicBot"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Image
                      src={isActive ? item.activeIcon : item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Image
              src="/Icons/logout.svg"
              alt="Logout"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
