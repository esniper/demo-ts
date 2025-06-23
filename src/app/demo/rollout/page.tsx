'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { PerformanceDebugger } from '@/components/PerformanceDebugger';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Users, RefreshCw, TrendingUp } from 'lucide-react';
import type { FeatureFlagMetadata } from '@flagvault/sdk';

const rolloutCode = `// Percentage rollout with user context
const userId = user.id; // Unique identifier for the user

const hasNewFeature = await sdk.isEnabled(
  'new-checkout-flow',
  false,
  userId  // User context for consistent rollout
);

if (hasNewFeature) {
  // User gets the new feature
  return <NewCheckoutFlow />;
} else {
  // User gets the old feature
  return <OldCheckoutFlow />;
}`;

const consistentRolloutCode = `// Same user always gets same result
const userId = "user-123";

// This will always return the same result for user-123
// Based on the flag's rollout percentage and seed
const result1 = await sdk.isEnabled('feature', false, userId);
const result2 = await sdk.isEnabled('feature', false, userId);
// result1 === result2 (always true)

// Different users get different results based on hash
const userA = await sdk.isEnabled('feature', false, 'user-a');
const userB = await sdk.isEnabled('feature', false, 'user-b');
// userA and userB may be different`;

// Generate 10,000 consistent user IDs
const generateUsers = () => {
  return Array.from({ length: 10000 }, (_, i) => `user-${i.toString().padStart(5, '0')}`);
};

interface UserGridProps {
  users: string[];
  enabledUsers: Set<string>;
  isLoading: boolean;
}

function UserGrid({ users, enabledUsers, isLoading }: UserGridProps) {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Updating rollout...</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-100 gap-0 p-4 bg-gray-50 rounded-lg overflow-hidden">
        {users.map((userId) => (
          <div
            key={userId}
            className={`w-1 h-1 ${
              enabledUsers.has(userId) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}
            title={`${userId}: ${enabledUsers.has(userId) ? 'Enabled' : 'Disabled'}`}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <span>Each dot represents a user</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span>Enabled</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-300 rounded"></div>
            <span>Disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RolloutDemo() {
  const { sdk } = useFlagVault();
  const { measureAsync, getMetrics, getAggregatedStats, clearMetrics } = usePerformanceMonitor();
  const [enabledUsers, setEnabledUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [flagKey, setFlagKey] = useState('rollout-demo');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Generate consistent user IDs
  const users = useMemo(() => generateUsers(), []);

  const checkRollout = async () => {
    if (!sdk) return;
    
    setIsLoading(true);
    
    try {
      // Process users in batches to respect backend limits
      const batchSize = 25; // Conservative batch size
      const results: { userId: string; isEnabled: boolean }[] = [];
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (userId) => {
            try {
              const isEnabled = await measureAsync(
                `isEnabled-${userId}`,
                () => sdk.isEnabled(flagKey, false, userId)
              );
              return { userId, isEnabled };
            } catch (error) {
              // If individual request fails, default to false
              return { userId, isEnabled: false };
            }
          })
        );
        results.push(...batchResults);
        
        // Brief pause between batches (50ms)
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Create set of enabled users
      const enabled = new Set(
        results
          .filter(result => result.isEnabled)
          .map(result => result.userId)
      );
      
      setEnabledUsers(enabled);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error checking rollout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    checkRollout();
    const interval = setInterval(checkRollout, 10000);
    return () => clearInterval(interval);
  }, [sdk, flagKey]);

  const enabledCount = enabledUsers.size;
  const enabledPercentage = ((enabledCount / users.length) * 100).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Percentage Rollout</h1>
        <p className="text-lg text-gray-600">
          Visualize how percentage rollouts affect 10,000 simulated users
        </p>
      </div>

      <PerformanceDebugger 
        metrics={getMetrics()} 
        stats={getAggregatedStats()} 
        onClearMetrics={clearMetrics}
      />

      <FeatureDemo
        title="Rollout Visualization"
        description="10,000 users in a 100x100 grid showing rollout distribution"
        info="Change the rollout percentage in your dashboard to see the effect on user distribution"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Flag Key:</label>
                <input
                  type="text"
                  value={flagKey}
                  onChange={(e) => setFlagKey(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="rollout-demo"
                />
              </div>
              <button
                onClick={checkRollout}
                disabled={!sdk || isLoading}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{users.length.toLocaleString()}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Enabled Users</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{enabledCount.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Percentage</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{enabledPercentage}%</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Disabled Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{(users.length - enabledCount).toLocaleString()}</p>
            </div>
          </div>

          <UserGrid 
            users={users} 
            enabledUsers={enabledUsers} 
            isLoading={isLoading}
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="How Rollouts Work"
        description="Understanding the consistent hashing algorithm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Consistent Distribution</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Each user ID is hashed with the flag key and rollout seed
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Hash result determines if user is in rollout percentage
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Same user always gets same result (deterministic)
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Distribution is evenly spread across user base
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Rollout Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Gradual feature release reduces risk
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Monitor performance impact with small groups
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Easy to increase percentage over time
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Instant rollback if issues are detected
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code examples for percentage rollouts"
      >
        <div className="space-y-6">
          <CodeExample
            title="Basic Percentage Rollout"
            code={rolloutCode}
            language="typescript"
          />
          <CodeExample
            title="Consistent User Experience"
            code={consistentRolloutCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Rollout Strategy"
        description="Best practices for percentage rollouts"
      >
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
            <span><strong>Start Small:</strong> Begin with 1-5% of users to validate the feature</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
            <span><strong>Monitor Metrics:</strong> Watch performance, errors, and user feedback</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
            <span><strong>Gradual Increase:</strong> Expand to 10%, 25%, 50%, 75%, 100% over time</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
            <span><strong>Quick Rollback:</strong> Reduce percentage immediately if issues arise</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">5</span>
            <span><strong>Full Release:</strong> Set to 100% when confident, then remove flag</span>
          </li>
        </ol>
      </FeatureDemo>
    </div>
  );
}