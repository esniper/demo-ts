'use client';

import React from 'react';
import { useFlagVault } from '@/contexts/FlagVaultContext';

export function EnvironmentSwitcher() {
  const { environment, setEnvironment, isInitialized, sdk } = useFlagVault();

  if (!isInitialized) {
    return (
      <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
        <span className="px-3 py-1.5 text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!sdk) {
    return (
      <div className="inline-flex items-center p-1 bg-red-100 rounded-lg">
        <span className="px-3 py-1.5 text-sm text-red-600">API Key Not Configured</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => setEnvironment('test')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          environment === 'test'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Test
      </button>
      <button
        onClick={() => setEnvironment('production')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          environment === 'production'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Production
      </button>
    </div>
  );
}