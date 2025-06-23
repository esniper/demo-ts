'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ToggleLeft, 
  GitBranch, 
  Code2, 
  Database, 
  AlertTriangle, 
  Zap, 
  Grid,
  ArrowRight
} from 'lucide-react';
import { FlagStatus } from '@/components/FlagStatus';

const demos = [
  {
    href: '/demo/basic',
    title: 'Basic Feature Flags',
    description: 'Simple on/off toggles with real-time status updates',
    icon: ToggleLeft,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    href: '/demo/ab-testing',
    title: 'A/B Testing',
    description: 'Switch between different UI designs and layouts',
    icon: GitBranch,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    href: '/demo/hooks',
    title: 'React Hooks',
    description: 'useFeatureFlag and useFeatureFlagCached examples',
    icon: Code2,
    color: 'text-green-600 bg-green-50',
  },
  {
    href: '/demo/cache',
    title: 'Cache Management',
    description: 'Real-time cache statistics and performance metrics',
    icon: Database,
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    href: '/demo/errors',
    title: 'Error Handling',
    description: 'Graceful degradation and fallback behaviors',
    icon: AlertTriangle,
    color: 'text-yellow-600 bg-yellow-50',
  },
  {
    href: '/demo/performance',
    title: 'Performance',
    description: 'Response times, bulk evaluation, and load testing',
    icon: Zap,
    color: 'text-orange-600 bg-orange-50',
  },
  {
    href: '/demo/use-cases',
    title: 'Use Cases Gallery',
    description: 'Kill switches, beta features, and more',
    icon: Grid,
    color: 'text-pink-600 bg-pink-50',
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FlagVault Demo</h1>
        <p className="text-lg text-gray-600">
          Explore the capabilities of FlagVault SDK through interactive demonstrations
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Demo Feature Flag</p>
            <FlagStatus flagKey="demo-feature" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Beta Features</p>
            <FlagStatus flagKey="beta-features" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Maintenance Mode</p>
            <FlagStatus flagKey="maintenance-mode" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <Link
              key={demo.href}
              href={demo.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${demo.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {demo.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{demo.description}</p>
                  <div className="mt-3 flex items-center text-sm font-medium text-blue-600">
                    View Demo
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h2>
        <p className="text-sm text-gray-600 mb-4">
          To use this demo, you'll need to configure your FlagVault API keys in the <code className="bg-white px-2 py-1 rounded">.env.local</code> file:
        </p>
        <pre className="bg-white rounded-md p-4 text-sm overflow-x-auto">
          <code>{`NEXT_PUBLIC_FLAGVAULT_TEST_API_KEY=test_your_api_key_here
NEXT_PUBLIC_FLAGVAULT_LIVE_API_KEY=live_your_api_key_here`}</code>
        </pre>
        <p className="text-sm text-gray-600 mt-4">
          Get your API keys from the <a href="https://flagvault.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">FlagVault Dashboard</a>
        </p>
      </div>
    </div>
  );
}