'use client';

import React, { useEffect, useState } from 'react';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FlagStatusProps {
  flagKey: string;
  showDetails?: boolean;
  defaultValue?: boolean;
}

export function FlagStatus({ flagKey, showDetails = false, defaultValue = false }: FlagStatusProps) {
  const { sdk } = useFlagVault();
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sdk) {
      setIsLoading(false);
      setError('SDK not initialized');
      return;
    }

    let mounted = true;

    const checkFlag = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const enabled = await sdk.isEnabled(flagKey, defaultValue);
        if (mounted) {
          setIsEnabled(enabled);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsEnabled(defaultValue);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkFlag();

    return () => {
      mounted = false;
    };
  }, [sdk, flagKey, defaultValue]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 text-gray-400 dark:text-gray-500 animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Checking...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isEnabled ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <div>
        <span className={`text-sm font-medium ${isEnabled ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </span>
        {showDetails && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Flag: {flagKey}
          </p>
        )}
      </div>
    </div>
  );
}