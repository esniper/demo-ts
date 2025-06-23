'use client';

import React, { useState } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { AlertTriangle, Wifi, Key, Server, RefreshCw } from 'lucide-react';

const gracefulErrorCode = `// No try/catch needed - errors are handled gracefully
const isEnabled = await sdk.isEnabled('my-feature-flag', false);

// On network error, you'll see:
// FlagVault: Failed to connect to API for flag 'my-feature-flag', using default: false

// On authentication error:
// FlagVault: Invalid API credentials for flag 'my-feature-flag', using default: false

// On missing flag:
// FlagVault: Flag 'my-feature-flag' not found, using default: false`;

const explicitErrorHandlingCode = `import { 
  FlagVaultError,
  FlagVaultAuthenticationError,
  FlagVaultNetworkError,
  FlagVaultAPIError 
} from '@flagvault/sdk';

try {
  const isEnabled = await sdk.isEnabled('my-feature-flag');
  // Use the flag value
} catch (error) {
  if (error instanceof FlagVaultAuthenticationError) {
    // Handle authentication errors (401, 403)
    console.error('Check your API credentials');
  } else if (error instanceof FlagVaultNetworkError) {
    // Handle network errors (timeouts, connection issues)
    console.error('Network connection problem');
  } else if (error instanceof FlagVaultAPIError) {
    // Handle API errors (500, malformed responses, etc.)
    console.error('API error occurred');
  } else {
    // Handle invalid input (empty flag_key, etc.)
    console.error('Invalid input provided');
  }
}`;

const fallbackPatternCode = `// Robust fallback pattern
async function getFeatureConfig() {
  try {
    const hasNewUI = await sdk.isEnabled('new-ui', false);
    const hasAdvancedFeatures = await sdk.isEnabled('advanced-features', false);
    
    return {
      ui: hasNewUI ? 'modern' : 'classic',
      features: hasAdvancedFeatures ? 'full' : 'basic'
    };
  } catch (error) {
    // Return safe defaults if everything fails
    return {
      ui: 'classic',
      features: 'basic'
    };
  }
}`;

interface ErrorSimulation {
  type: 'network' | 'auth' | 'notfound' | 'server' | 'timeout';
  flagKey: string;
  result: string | null;
  isLoading: boolean;
}

export default function ErrorsDemo() {
  const { sdk } = useFlagVault();
  const [simulations, setSimulations] = useState<ErrorSimulation[]>([]);

  const simulateError = async (type: ErrorSimulation['type']) => {
    if (!sdk) return;

    const simulation: ErrorSimulation = {
      type,
      flagKey: `simulate-${type}-error`,
      result: null,
      isLoading: true
    };

    setSimulations(prev => [...prev, simulation]);

    try {
      // These will trigger different error scenarios
      const flagKey = `non-existent-flag-${Date.now()}`;
      const result = await sdk.isEnabled(flagKey, false);
      
      setSimulations(prev => 
        prev.map(s => 
          s === simulation 
            ? { ...s, result: `Default returned: ${result}`, isLoading: false }
            : s
        )
      );
    } catch (error) {
      setSimulations(prev => 
        prev.map(s => 
          s === simulation 
            ? { ...s, result: `Error: ${error instanceof Error ? error.message : 'Unknown'}`, isLoading: false }
            : s
        )
      );
    }
  };

  const clearSimulations = () => {
    setSimulations([]);
  };

  const errorTypes = [
    {
      type: 'network' as const,
      title: 'Network Error',
      description: 'Simulate connection failure',
      icon: Wifi,
      color: 'text-red-600 bg-red-50'
    },
    {
      type: 'auth' as const,
      title: 'Authentication Error',
      description: 'Invalid API credentials',
      icon: Key,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      type: 'notfound' as const,
      title: 'Flag Not Found',
      description: 'Non-existent flag key',
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      type: 'server' as const,
      title: 'Server Error',
      description: 'API server error (500)',
      icon: Server,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Handling</h1>
        <p className="text-lg text-gray-600">
          Learn how FlagVault SDK handles errors gracefully and provides fallback mechanisms
        </p>
      </div>

      <FeatureDemo
        title="Graceful Error Handling"
        description="FlagVault SDK automatically handles errors and returns default values"
        info="The SDK logs warnings to console but never throws exceptions for network/API errors"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {errorTypes.map((errorType) => {
              const Icon = errorType.icon;
              return (
                <button
                  key={errorType.type}
                  onClick={() => simulateError(errorType.type)}
                  disabled={!sdk}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <div className={`p-2 rounded-lg ${errorType.color} mb-2`}>
                    <Icon className="h-5 w-5 mx-auto" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{errorType.title}</h4>
                  <p className="text-xs text-gray-600">{errorType.description}</p>
                </button>
              );
            })}
          </div>

          {simulations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Error Simulation Results</h4>
                <button
                  onClick={clearSimulations}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
              
              {simulations.map((sim, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {sim.type.toUpperCase()} Error
                      </span>
                      <code className="text-xs bg-white px-2 py-1 rounded">
                        {sim.flagKey}
                      </code>
                    </div>
                    {sim.isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
                  </div>
                  {sim.result && (
                    <p className="text-sm text-gray-600 mt-1">{sim.result}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Error Types & Handling"
        description="Different error scenarios and how they're handled"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Automatic Handling</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Wifi className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Network Errors</p>
                  <p className="text-gray-600">Connection timeouts, DNS failures → Returns default value</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Authentication Errors</p>
                  <p className="text-gray-600">Invalid API keys, forbidden access → Returns default value</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Missing Flags</p>
                  <p className="text-gray-600">Flag doesn't exist in dashboard → Returns default value</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Server className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Server Errors</p>
                  <p className="text-gray-600">API downtime, 500 errors → Returns default value</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Exception Types</h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 rounded">
                <p className="font-medium text-red-800">FlagVaultAuthenticationError</p>
                <p className="text-red-600">401/403 HTTP responses</p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded">
                <p className="font-medium text-yellow-800">FlagVaultNetworkError</p>
                <p className="text-yellow-600">Connection failures, timeouts</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded">
                <p className="font-medium text-blue-800">FlagVaultAPIError</p>
                <p className="text-blue-600">Server errors, malformed responses</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-800">Error</p>
                <p className="text-gray-600">Invalid parameters (empty flag key)</p>
              </div>
            </div>
          </div>
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code examples for error handling patterns"
      >
        <div className="space-y-6">
          <CodeExample
            title="Graceful Error Handling (Recommended)"
            code={gracefulErrorCode}
            language="typescript"
          />
          <CodeExample
            title="Explicit Error Handling"
            code={explicitErrorHandlingCode}
            language="typescript"
          />
          <CodeExample
            title="Robust Fallback Pattern"
            code={fallbackPatternCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Best Practices"
        description="Recommendations for handling errors in production"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">✅ Do</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Always provide meaningful default values
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Use graceful degradation (recommended approach)
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Monitor console warnings in production
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Test with invalid flag keys during development
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">❌ Don't</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                Assume flags will always be available
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                Ignore network failures in your error handling
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                Use empty strings or null as default values
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                Catch and swallow all errors without logging
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>
    </div>
  );
}