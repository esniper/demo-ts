'use client';

import React, { useState, useEffect } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Clock, Database, RefreshCw } from 'lucide-react';

const bulkEvaluationCode = `// Preload all flags for better performance
await sdk.preloadFlags();

// Now all flag checks are cached and super fast
const config = {
  newUI: await sdk.isEnabled('new-ui'),
  darkMode: await sdk.isEnabled('dark-mode'),
  premiumFeatures: await sdk.isEnabled('premium-features'),
  betaFeatures: await sdk.isEnabled('beta-features')
};

// All subsequent calls are sub-millisecond from cache`;

const performanceOptimizationCode = `// Configure caching for optimal performance
const sdk = new FlagVaultSDK({
  apiKey: 'test_your-api-key',
  cache: {
    enabled: true,
    ttl: 300,              // 5 minutes
    maxSize: 1000,         // cache up to 1000 flags
    refreshInterval: 60,   // refresh in background every minute
    fallbackBehavior: 'default'
  }
});

// Preload critical flags at app startup
await sdk.preloadFlags();`;

const responsiveLoadingCode = `function FeatureComponent() {
  const { isEnabled, isLoading } = useFeatureFlag(sdk, 'new-feature', false);
  
  // Show loading state while checking flag
  if (isLoading) {
    return <Skeleton />;
  }
  
  return isEnabled ? <NewFeature /> : <OldFeature />;
}`;

interface PerformanceMetric {
  timestamp: number;
  responseTime: number;
  cached: boolean;
  flagKey: string;
}

export default function PerformanceDemo() {
  const { sdk } = useFlagVault();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<{
    cached: number;
    uncached: number;
    improvement: number;
  } | null>(null);

  const runPerformanceTest = async () => {
    if (!sdk || isRunningTest) return;
    
    setIsRunningTest(true);
    setMetrics([]);
    
    const testFlags = ['demo-feature', 'beta-features', 'maintenance-mode', 'new-ui-design'];
    
    // Clear cache first
    sdk.clearCache();
    
    // Test uncached performance
    const uncachedTimes: number[] = [];
    for (const flag of testFlags) {
      const start = performance.now();
      await sdk.isEnabled(flag);
      const end = performance.now();
      const responseTime = end - start;
      uncachedTimes.push(responseTime);
      
      setMetrics(prev => [...prev, {
        timestamp: Date.now(),
        responseTime,
        cached: false,
        flagKey: flag
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for visualization
    }
    
    // Test cached performance (run same flags again)
    const cachedTimes: number[] = [];
    for (const flag of testFlags) {
      const start = performance.now();
      await sdk.isEnabled(flag);
      const end = performance.now();
      const responseTime = end - start;
      cachedTimes.push(responseTime);
      
      setMetrics(prev => [...prev, {
        timestamp: Date.now(),
        responseTime,
        cached: true,
        flagKey: flag
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const avgUncached = uncachedTimes.reduce((a, b) => a + b, 0) / uncachedTimes.length;
    const avgCached = cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length;
    const improvement = ((avgUncached - avgCached) / avgUncached) * 100;
    
    setTestResults({
      cached: avgCached,
      uncached: avgUncached,
      improvement
    });
    
    setIsRunningTest(false);
  };

  const preloadFlags = async () => {
    if (!sdk) return;
    await sdk.preloadFlags();
  };

  // Prepare chart data
  const chartData = metrics.map((metric, index) => ({
    index: index + 1,
    responseTime: metric.responseTime,
    cached: metric.cached,
    flagKey: metric.flagKey
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance</h1>
        <p className="text-lg text-gray-600">
          Optimize FlagVault SDK performance with caching and bulk operations
        </p>
      </div>

      <FeatureDemo
        title="Performance Testing"
        description="Compare response times between cached and uncached flag evaluations"
        info="This test measures actual API response times vs cached responses"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={runPerformanceTest}
              disabled={!sdk || isRunningTest}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isRunningTest ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isRunningTest ? 'Running Test...' : 'Run Performance Test'}</span>
            </button>
            
            <button
              onClick={preloadFlags}
              disabled={!sdk}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              <Database className="h-4 w-4" />
              <span>Preload Flags</span>
            </button>
          </div>

          {testResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Uncached</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {testResults.uncached.toFixed(2)}ms
                </p>
                <p className="text-xs text-gray-500">average response time</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Cached</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {testResults.cached.toFixed(2)}ms
                </p>
                <p className="text-xs text-gray-500">average response time</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Improvement</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {testResults.improvement.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">performance gain</p>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="index" 
                    label={{ value: 'Request #', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value.toFixed(2)}ms`,
                      props.payload.cached ? 'Cached' : 'Uncached'
                    ]}
                    labelFormatter={(index: number) => `Request ${index}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={(props: any) => (
                      <circle 
                        cx={props.cx} 
                        cy={props.cy} 
                        r={4} 
                        fill={props.payload.cached ? '#10b981' : '#ef4444'} 
                      />
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Performance Optimization Techniques"
        description="Strategies to maximize FlagVault SDK performance"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Caching Strategies</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Enable caching with appropriate TTL (5-15 minutes)</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Use background refresh to keep cache warm</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Preload critical flags at application startup</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Set reasonable cache size limits (1000+ flags)</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Development Best Practices</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Use React hooks for automatic loading states</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Batch flag checks when possible</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Avoid checking flags in render loops</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Monitor cache hit rates in production</span>
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code examples for performance optimization"
      >
        <div className="space-y-6">
          <CodeExample
            title="Bulk Flag Evaluation"
            code={bulkEvaluationCode}
            language="typescript"
          />
          <CodeExample
            title="Performance Configuration"
            code={performanceOptimizationCode}
            language="typescript"
          />
          <CodeExample
            title="Responsive Loading States"
            code={responsiveLoadingCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Performance Benchmarks"
        description="Typical performance characteristics"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">~100ms</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Cold API Call</div>
            <div className="text-xs text-gray-600">First request to flag</div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">&lt;1ms</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Cached Response</div>
            <div className="text-xs text-gray-600">From memory cache</div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">95%+</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Cache Hit Rate</div>
            <div className="text-xs text-gray-600">With proper TTL</div>
          </div>
        </div>
      </FeatureDemo>
    </div>
  );
}