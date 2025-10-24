"use client";

import React, { useState } from "react";
import { FeatureDemo } from "@/components/FeatureDemo";
import { FlagStatus } from "@/components/FlagStatus";
import { CacheAwareFlagStatus } from "@/components/CacheAwareFlagStatus";
import { CodeExample } from "@/components/CodeExample";
import { useFlagVault } from "@/contexts/FlagVaultContext";
import { RefreshCw, Clock, Zap } from "lucide-react";

const cachedFlagCode = `import FlagVaultSDK from '@flagvault/sdk';

// SDK with caching enabled (recommended for most use cases)
const sdk = new FlagVaultSDK({
  apiKey: 'test_your-api-key-here',
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes cache
    maxSize: 1000,
    refreshInterval: 60 // 1 minute background refresh
  }
});

// Cached flag evaluation - fast but may be slightly stale
const isEnabled = await sdk.isEnabled('demo-feature');

if (isEnabled) {
  showNewFeature();
} else {
  showOldFeature();
}`;

const realtimeFlagCode = `import FlagVaultSDK from '@flagvault/sdk';

// SDK with minimal caching for real-time updates
const realtimeSdk = new FlagVaultSDK({
  apiKey: 'test_your-api-key-here',
  cache: {
    enabled: false // Disable cache for immediate updates
  }
});

// Real-time flag evaluation - slower but always current
const isMaintenanceMode = await realtimeSdk.isEnabled('maintenance-mode');

if (isMaintenanceMode) {
  showMaintenancePage();
} else {
  showNormalApplication();
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
  const [customFlagKey, setCustomFlagKey] = useState("");
  const [customFlagStatus, setCustomFlagStatus] = useState<boolean | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const checkCustomFlag = async () => {
    if (!sdk || !customFlagKey) return;

    setIsChecking(true);
    try {
      const isEnabled = await sdk.isEnabled(customFlagKey, false);
      setCustomFlagStatus(isEnabled);
    } catch (error) {
      console.error("Error checking flag:", error);
      setCustomFlagStatus(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Basic Feature Flags
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Learn how to use simple on/off feature toggles with FlagVault SDK
        </p>
      </div>

      <FeatureDemo
        title="Cached vs Real-time Flag Evaluation"
        description="Compare how caching affects flag response behavior"
        info="The cached flags use HTTP cache headers and SDK cache, while real-time flags bypass caching for immediate updates"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cached Flags Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cached Flags
              </h3>
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                5 min TTL
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300 mb-4">
              <strong>These flags are cached:</strong> Changes in your dashboard
              may take up to 5 minutes to reflect here. This improves
              performance but reduces real-time accuracy.
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  demo-feature
                </h4>
                <CacheAwareFlagStatus
                  flagKey="demo-feature"
                  cached={true}
                  showDetails
                />
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  beta-features
                </h4>
                <CacheAwareFlagStatus
                  flagKey="beta-features"
                  cached={true}
                  showDetails
                />
              </div>
            </div>
          </div>

          {/* Real-time Flags Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Real-time Flags
              </h3>
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                No Cache
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-green-800 dark:text-green-300 mb-4">
              <strong>These flags update immediately:</strong> Changes in your
              dashboard will reflect within seconds. This provides real-time
              accuracy but may be slower.
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  new-ui-design
                </h4>
                <FlagStatus flagKey="new-ui-design" showDetails />
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  maintenance-mode
                </h4>
                <FlagStatus flagKey="maintenance-mode" showDetails />
              </div>
            </div>
          </div>
        </div>

        {/* Cache Strategy Explanation */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            When to Use Each Strategy
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                ✅ Use Cached Flags For:
              </h5>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• High-traffic features</li>
                <li>• Performance-critical code paths</li>
                <li>• Features that don&apos;t need instant updates</li>
                <li>• Reduced API costs</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">
                ⚡ Use Real-time Flags For:
              </h5>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Emergency kill switches</li>
                <li>• Security-related features</li>
                <li>• Critical user-facing changes</li>
                <li>• A/B test result accuracy</li>
              </ul>
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
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <button
              onClick={checkCustomFlag}
              disabled={!sdk || !customFlagKey || isChecking}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isChecking && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>Check Flag</span>
            </button>
          </div>
          {customFlagStatus !== null && customFlagKey && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Flag{" "}
                <code className="bg-white dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {customFlagKey}
                </code>{" "}
                is{" "}
                <span
                  className={`font-medium ${
                    customFlagStatus
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {customFlagStatus ? "enabled" : "disabled"}
                </span>
              </p>
            </div>
          )}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code snippets showing how to implement cached vs real-time flag evaluation"
      >
        <div className="space-y-6">
          <CodeExample
            title="Cached Flag Evaluation (Recommended)"
            code={cachedFlagCode}
            language="typescript"
          />
          <CodeExample
            title="Real-time Flag Evaluation (Critical Features)"
            code={realtimeFlagCode}
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
        <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              1
            </span>
            <span>
              SDK makes a GET request to{" "}
              <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded font-mono">
                https://api.flagvault.com/api/feature-flag/{"{flag-key}"}
                /enabled
              </code>
            </span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              2
            </span>
            <span>
              API validates your credentials and checks the flag status in the
              selected environment
            </span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              3
            </span>
            <span>
              Returns a boolean value indicating if the flag is enabled
            </span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              4
            </span>
            <span>
              On error, returns the default value you specified (graceful
              degradation)
            </span>
          </li>
        </ol>
      </FeatureDemo>
    </div>
  );
}
