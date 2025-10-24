'use client';

import React, { useState } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { useFeatureFlag, useFeatureFlagCached } from '@flagvault/sdk';
import { CheckCircle, XCircle, Loader2, Timer, Database } from 'lucide-react';

const basicHookCode = `import { useFeatureFlag } from '@flagvault/sdk';

function MyComponent() {
  const { isEnabled, isLoading, error } = useFeatureFlag(
    sdk, 
    'new-feature', 
    false // default value
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return isEnabled ? <NewFeature /> : <OldFeature />;
}`;

const cachedHookCode = `import { useFeatureFlagCached } from '@flagvault/sdk';

function MyComponent() {
  const { isEnabled, isLoading } = useFeatureFlagCached(
    sdk,
    'premium-feature',
    false,      // default value
    300000,     // 5 minutes cache TTL
    'user-123'  // context for percentage rollouts
  );

  return isEnabled ? <PremiumFeature /> : <BasicFeature />;
}`;

const performanceComparisonCode = `// Without cache - API call every render
function SlowComponent() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    sdk.isEnabled('feature').then(setIsEnabled);
  }, []);
  
  return <div>{isEnabled ? 'On' : 'Off'}</div>;
}

// With cache - API call once, cached for TTL
function FastComponent() {
  const { isEnabled } = useFeatureFlagCached(sdk, 'feature', false, 300000);
  return <div>{isEnabled ? 'On' : 'Off'}</div>;
}`;

// Hook Demo Component
function HookDemo({ hookType, flagKey, cacheTTL }: {
  hookType: 'basic' | 'cached';
  flagKey: string;
  cacheTTL?: number;
}) {
  const { sdk } = useFlagVault();

  // Use hooks conditionally based on hookType
  const cachedHookResult = hookType === 'cached' && sdk ? useFeatureFlagCached(
    sdk,
    flagKey,
    false,
    cacheTTL || 10000 // 10 seconds for demo
  ) : { isEnabled: false, isLoading: false, error: null };

  const basicHookResult = hookType === 'basic' && sdk ? useFeatureFlag(sdk, flagKey, false) : { isEnabled: false, isLoading: false, error: null };

  const { isEnabled, isLoading, error } = hookType === 'cached' ? cachedHookResult : basicHookResult;

  if (!sdk) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">SDK not initialized</span>
        </div>
      </div>
    );
  }

  if (hookType === 'cached') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Flag: {flagKey}
          </span>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <span className="text-xs text-blue-600 dark:text-blue-400">Cached</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : isEnabled ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            isLoading ? 'text-gray-500 dark:text-gray-400' : isEnabled ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {isLoading ? 'Loading...' : isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">Error: {error.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Flag: {flagKey}
        </span>
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Real-time</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        ) : isEnabled ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <span className={`text-sm font-medium ${
          isLoading ? 'text-gray-500 dark:text-gray-400' : isEnabled ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
        }`}>
          {isLoading ? 'Loading...' : isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">Error: {error.message}</p>
      )}
    </div>
  );
}

export default function HooksDemo() {
  const [customFlag, setCustomFlag] = useState('demo-feature');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">React Hooks</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Use React hooks for seamless feature flag integration
        </p>
      </div>

      <FeatureDemo
        title="useFeatureFlag Hook"
        description="Basic hook with loading states and error handling"
        info="This hook fetches the flag status on component mount and provides loading/error states"
      >
        <div className="space-y-4">
          <HookDemo hookType="basic" flagKey="demo-feature" />
          <HookDemo hookType="basic" flagKey="beta-features" />
          <HookDemo hookType="basic" flagKey="maintenance-mode" />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="useFeatureFlagCached Hook"
        description="Enhanced hook with caching for better performance"
        info="This hook caches flag values to reduce API calls and improve performance"
      >
        <div className="space-y-4">
          <HookDemo hookType="cached" flagKey="demo-feature" cacheTTL={10000} />
          <HookDemo hookType="cached" flagKey="new-ui-design" cacheTTL={15000} />
          <HookDemo hookType="cached" flagKey="premium-features" cacheTTL={20000} />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Custom Flag Test"
        description="Test any flag key with the useFeatureFlag hook"
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={customFlag}
              onChange={(e) => setCustomFlag(e.target.value)}
              placeholder="Enter flag key"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          {customFlag && <HookDemo hookType="basic" flagKey={customFlag} />}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code snippets showing how to use the hooks"
      >
        <div className="space-y-6">
          <CodeExample
            title="Basic useFeatureFlag Hook"
            code={basicHookCode}
            language="typescript"
          />
          <CodeExample
            title="Cached Hook with TTL"
            code={cachedHookCode}
            language="typescript"
          />
          <CodeExample
            title="Performance Comparison"
            code={performanceComparisonCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Hook Features"
        description="Key benefits of using FlagVault React hooks"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">useFeatureFlag</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Real-time updates when flags change
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Loading and error states included
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Automatic cleanup on unmount
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                TypeScript support with full types
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">useFeatureFlagCached</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Configurable cache TTL
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Reduced API calls for better performance
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Instant loading for cached values
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                Context support for percentage rollouts
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>
    </div>
  );
}