'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ClockIcon, TargetIcon, CogIcon } from './Icons';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Tableau de bord', icon: HomeIcon },
    { href: '/reminders', label: 'Rappels', icon: ClockIcon },
    { href: '/goals', label: 'Objectifs', icon: TargetIcon },
    { href: '/settings', label: 'Paramètres', icon: CogIcon },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">GoalRemind</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex justify-around">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center py-2 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
