'use client';

import React from 'react';
import { useFlagVault } from '@/contexts/FlagVaultContext';

export function EnvironmentSwitcher() {
  const { environment, setEnvironment, isInitialized, sdk } = useFlagVault();

  if (!isInitialized) {
    return (
      <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <span className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!sdk) {
    return (
      <div className="inline-flex items-center p-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
        <span className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400">API Key Not Configured</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <button
        onClick={() => setEnvironment('test')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          environment === 'test'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        Test
      </button>
      <button
        onClick={() => setEnvironment('production')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          environment === 'production'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        Production
      </button>
    </div>
  );
}