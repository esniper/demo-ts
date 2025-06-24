'use client';

import React, { useEffect, useState } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { Database, RefreshCw, Trash2, BarChart3 } from 'lucide-react';

const cacheConfigCode = `const sdk = new FlagVaultSDK({
  apiKey: 'test_your-api-key',
  cache: {
    enabled: true,
    ttl: 300,           // 5 minutes
    maxSize: 1000,      // max cached flags
    refreshInterval: 60, // background refresh every minute
    fallbackBehavior: 'default' // return default on cache miss
  }
});`;

const cacheStatsCode = `// Get cache statistics
const stats = sdk.getCacheStats();

console.log({
  size: stats.size,              // current cached flags
  hitRate: stats.hitRate,        // cache hit rate (0-1)
  expiredEntries: stats.expiredEntries,
  memoryUsage: stats.memoryUsage // estimated bytes
});

// Debug specific flag
const flagInfo = sdk.debugFlag('my-feature');
console.log({
  cached: flagInfo.cached,
  value: flagInfo.value,
  timeUntilExpiry: flagInfo.timeUntilExpiry
});`;

export default function CacheDemo() {
  const { sdk } = useFlagVault();
  const [stats, setStats] = useState<any>(null);
  const [flagDebugInfo, setFlagDebugInfo] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    if (!sdk) return;
    
    const cacheStats = sdk.getCacheStats();
    setStats(cacheStats);

    // Debug some common flags
    const flags = ['demo-feature', 'beta-features', 'maintenance-mode', 'new-ui-design'];
    const debugInfo = flags.map(flag => ({
      flag,
      ...sdk.debugFlag(flag)
    }));
    setFlagDebugInfo(debugInfo);
  };

  const clearCache = () => {
    if (!sdk) return;
    sdk.clearCache();
    refreshStats();
  };

  const forceRefresh = async () => {
    if (!sdk) return;
    
    setIsRefreshing(true);
    // Force some API calls to populate cache
    await Promise.all([
      sdk.isEnabled('demo-feature'),
      sdk.isEnabled('beta-features'),
      sdk.isEnabled('maintenance-mode'),
      sdk.isEnabled('new-ui-design')
    ]);
    refreshStats();
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshStats();
  }, [sdk]);

  if (!sdk) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-300">SDK not initialized. Please configure your API keys.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cache Management</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Monitor and manage FlagVault SDK caching for optimal performance
        </p>
      </div>

      <FeatureDemo
        title="Cache Statistics"
        description="Real-time cache performance metrics"
        info="Cache statistics update every 2 seconds to show current performance"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Cache Size</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats?.size || 0}</p>
            <p className="text-xs text-gray-500">cached flags</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Hit Rate</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats ? Math.round(stats.hitRate * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500">cache hits</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Expired</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats?.expiredEntries || 0}</p>
            <p className="text-xs text-gray-500">expired entries</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {stats ? Math.round(stats.memoryUsage / 1024) : 0}KB
            </p>
            <p className="text-xs text-gray-500">estimated usage</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={forceRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Populate Cache</span>
          </button>
          <button
            onClick={clearCache}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cache</span>
          </button>
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Flag Debug Information"
        description="Detailed cache status for individual flags"
      >
        <div className="space-y-3">
          {flagDebugInfo.map((info) => (
            <div key={info.flag} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{info.flag}</span>
                <div className="flex items-center space-x-2">
                  {info.cached ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Cached</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Not Cached</span>
                  )}
                </div>
              </div>
              
              {info.cached && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <span className={`ml-2 font-medium ${
                      info.value ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {info.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cached:</span>
                    <span className="ml-2 text-gray-700">
                      {info.cachedAt ? new Date(info.cachedAt).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <span className="ml-2 text-gray-700">
                      {info.expiresAt ? new Date(info.expiresAt).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">TTL:</span>
                    <span className="ml-2 text-gray-700">
                      {info.timeUntilExpiry ? Math.round(info.timeUntilExpiry / 1000) + 's' : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="How to configure and use caching"
      >
        <div className="space-y-6">
          <CodeExample
            title="Cache Configuration"
            code={cacheConfigCode}
            language="typescript"
          />
          <CodeExample
            title="Cache Statistics & Debugging"
            code={cacheStatsCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Cache Benefits"
        description="Why caching improves performance"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Performance Gains</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Reduce API calls by 80-95%
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Sub-millisecond response times for cached flags
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Background refresh keeps cache warm
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Graceful degradation on cache miss
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Cache Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Configurable TTL (time-to-live)
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                LRU eviction for memory management
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Real-time statistics and debugging
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Context-aware caching for rollouts
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>
    </div>
  );
}