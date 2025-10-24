'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import FlagVaultSDK from '@flagvault/sdk';

interface FlagVaultContextType {
  sdk: FlagVaultSDK | null;
  environment: 'test' | 'production';
  setEnvironment: (env: 'test' | 'production') => void;
  isInitialized: boolean;
}

const FlagVaultContext = createContext<FlagVaultContextType | undefined>(undefined);

export const FlagVaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [environment, setEnvironment] = useState<'test' | 'production'>('test');
  const [sdk, setSdk] = useState<FlagVaultSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const apiKey = environment === 'production' 
      ? process.env.NEXT_PUBLIC_FLAGVAULT_LIVE_API_KEY 
      : process.env.NEXT_PUBLIC_FLAGVAULT_TEST_API_KEY;

    if (!apiKey || apiKey.includes('your_')) {
      console.error('FlagVault API key not configured. Please set NEXT_PUBLIC_FLAGVAULT_TEST_API_KEY and NEXT_PUBLIC_FLAGVAULT_LIVE_API_KEY in .env.local');
      setIsInitialized(true);
      return;
    }

    const newSdk = new FlagVaultSDK({
      apiKey: apiKey,
      baseUrl: process.env.NEXT_PUBLIC_FLAGVAULT_BASE_URL,
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
        maxSize: 1000,
        refreshInterval: 0, // Disable automatic background refresh to avoid rate limiting
      },
    });

    setSdk(newSdk);
    setIsInitialized(true);

    // Cleanup on unmount or environment change
    return () => {
      newSdk.destroy();
    };
  }, [environment]);

  return (
    <FlagVaultContext.Provider value={{ sdk, environment, setEnvironment, isInitialized }}>
      {children}
    </FlagVaultContext.Provider>
  );
};

export const useFlagVault = () => {
  const context = useContext(FlagVaultContext);
  if (context === undefined) {
    throw new Error('useFlagVault must be used within a FlagVaultProvider');
  }
  return context;
};