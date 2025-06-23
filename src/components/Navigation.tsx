'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ToggleLeft, 
  GitBranch, 
  Code2, 
  Database, 
  AlertTriangle, 
  Zap, 
  Grid,
  TrendingUp
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/demo/basic', label: 'Basic Flags', icon: ToggleLeft },
  { href: '/demo/ab-testing', label: 'A/B Testing', icon: GitBranch },
  { href: '/demo/rollout', label: 'Percentage Rollout', icon: TrendingUp },
  { href: '/demo/hooks', label: 'React Hooks', icon: Code2 },
  { href: '/demo/cache', label: 'Cache Management', icon: Database },
  { href: '/demo/errors', label: 'Error Handling', icon: AlertTriangle },
  { href: '/demo/performance', label: 'Performance', icon: Zap },
  { href: '/demo/use-cases', label: 'Use Cases', icon: Grid },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-8">FlagVault Demo</h1>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}