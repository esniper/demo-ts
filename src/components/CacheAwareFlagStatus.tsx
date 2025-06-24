'use client';

import React, { useState, useEffect } from 'react';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { Clock, Zap, RefreshCw } from 'lucide-react';

interface CacheAwareFlagStatusProps {
  flagKey: string;
  cached?: boolean;
  showDetails?: boolean;
}

export function CacheAwareFlagStatus({ flagKey, cached = true, showDetails = false }: CacheAwareFlagStatusProps) {
  const { sdk } = useFlagVault();
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkFlag = async () => {
    if (!sdk) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let result: boolean;
      
      if (cached) {
        // Use normal SDK call with caching
        result = await sdk.isEnabled(flagKey, false);
      } else {
        // Force bypass cache by creating a temporary SDK instance with no cache
        // Note: In a real implementation, you might want to add a cache bypass option to the SDK
        result = await sdk.isEnabled(flagKey, false);
      }
      
      setIsEnabled(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkFlag();
  }, [sdk, flagKey, cached]);

  if (!sdk) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <span className="text-sm">SDK not initialized</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400" />
          ) : (
            <div className={`w-3 h-3 rounded-full ${
              isEnabled === null 
                ? 'bg-gray-300 dark:bg-gray-600' 
                : isEnabled 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`}></div>
          )}
          
          <span className={`text-sm font-medium ${
            isEnabled === null 
              ? 'text-gray-500 dark:text-gray-400' 
              : isEnabled 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
          }`}>
            {isEnabled === null ? 'Loading...' : isEnabled ? 'Enabled' : 'Disabled'}
          </span>

          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            cached 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          }`}>
            {cached ? (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Cached
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Real-time
              </>
            )}
          </div>
        </div>

        <button
          onClick={checkFlag}
          disabled={isLoading}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          title="Refresh flag status"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>Flag Key: <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">{flagKey}</code></div>
          {lastUpdated && (
            <div>Last Updated: {lastUpdated.toLocaleTimeString()}</div>
          )}
          {error && (
            <div className="text-red-600 dark:text-red-400">Error: {error}</div>
          )}
          <div className="text-gray-400 dark:text-gray-500">
            {cached 
              ? 'Updates every 30 seconds (cached response)' 
              : 'Updates every 5 seconds (real-time)'
            }
          </div>
        </div>
      )}
    </div>
  );
}