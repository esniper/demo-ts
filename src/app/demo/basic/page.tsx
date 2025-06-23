'use client';

import React, { useState } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { FlagStatus } from '@/components/FlagStatus';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { RefreshCw } from 'lucide-react';

const basicFlagCode = `import FlagVaultSDK from '@flagvault/sdk';

const sdk = new FlagVaultSDK({
  apiKey: 'test_your-api-key-here'
});

// Check if a feature is enabled
const isEnabled = await sdk.isEnabled('my-feature-flag');

if (isEnabled) {
  // Feature is enabled
  showNewFeature();
} else {
  // Feature is disabled
  showOldFeature();
}`;

const gracefulErrorCode = `// No try/catch needed - errors are handled gracefully
const isEnabled = await sdk.isEnabled('my-feature-flag', false);

// On network error, you'll see:
// FlagVault: Failed to connect to API for flag 'my-feature-flag', using default: false

// On authentication error:
// FlagVault: Invalid API credentials for flag 'my-feature-flag', using default: false

// On missing flag:
// FlagVault: Flag 'my-feature-flag' not found, using default: false`;

export default function BasicDemo() {
  const { sdk } = useFlagVault();
  const [customFlagKey, setCustomFlagKey] = useState('');
  const [customFlagStatus, setCustomFlagStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkCustomFlag = async () => {
    if (!sdk || !customFlagKey) return;
    
    setIsChecking(true);
    try {
      const isEnabled = await sdk.isEnabled(customFlagKey, false);
      setCustomFlagStatus(isEnabled);
    } catch (error) {
      console.error('Error checking flag:', error);
      setCustomFlagStatus(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Basic Feature Flags</h1>
        <p className="text-lg text-gray-600">
          Learn how to use simple on/off feature toggles with FlagVault SDK
        </p>
      </div>

      <FeatureDemo
        title="Real-time Flag Status"
        description="These flags update automatically every 5 seconds"
        info="Create these flags in your FlagVault dashboard to see them in action"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">demo-feature</h3>
              <FlagStatus flagKey="demo-feature" showDetails />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">new-ui-design</h3>
              <FlagStatus flagKey="new-ui-design" showDetails />
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">beta-features</h3>
              <FlagStatus flagKey="beta-features" showDetails />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">maintenance-mode</h3>
              <FlagStatus flagKey="maintenance-mode" showDetails />
            </div>
          </div>
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Custom Flag Check"
        description="Enter your own flag key to check its status"
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={customFlagKey}
              onChange={(e) => setCustomFlagKey(e.target.value)}
              placeholder="Enter flag key (e.g., my-feature-flag)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={checkCustomFlag}
              disabled={!sdk || !customFlagKey || isChecking}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isChecking && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>Check Flag</span>
            </button>
          </div>
          {customFlagStatus !== null && customFlagKey && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Flag <code className="bg-white px-2 py-1 rounded">{customFlagKey}</code> is{' '}
                <span className={`font-medium ${customFlagStatus ? 'text-green-700' : 'text-red-700'}`}>
                  {customFlagStatus ? 'enabled' : 'disabled'}
                </span>
              </p>
            </div>
          )}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code snippets showing how to use feature flags"
      >
        <div className="space-y-6">
          <CodeExample
            title="Basic Usage"
            code={basicFlagCode}
            language="typescript"
          />
          <CodeExample
            title="Graceful Error Handling"
            code={gracefulErrorCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="How It Works"
        description="Understanding the feature flag lifecycle"
      >
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
            <span>SDK makes a GET request to <code className="bg-gray-100 px-2 py-1 rounded">https://api.flagvault.com/api/feature-flag/{'{flag-key}'}/enabled</code></span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
            <span>API validates your credentials and checks the flag status in the selected environment</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
            <span>Returns a boolean value indicating if the flag is enabled</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
            <span>On error, returns the default value you specified (graceful degradation)</span>
          </li>
        </ol>
      </FeatureDemo>
    </div>
  );
}