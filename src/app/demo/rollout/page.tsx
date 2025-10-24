'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { PerformanceDebugger } from '@/components/PerformanceDebugger';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Users, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

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

// Generate 900 consistent user IDs (30x30 grid)
const generateUsers = () => {
  return Array.from({ length: 900 }, (_, i) => `user-${i.toString().padStart(4, '0')}`);
};

interface UserGridProps {
  users: string[];
  enabledUsers: Set<string>;
  isLoading: boolean;
  progress: number;
}

function UserGrid({ users, enabledUsers, isLoading, progress }: UserGridProps) {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Checking users...</span>
            </div>
            <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}% complete</p>
          </div>
        </div>
      )}
      
      <div 
        className="grid gap-0.5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(30, minmax(0, 1fr))',
          width: 'fit-content',
          margin: '0 auto'
        }}
      >
        {users.map((userId) => (
          <div
            key={userId}
            className={`w-3 h-3 rounded-sm ${
              enabledUsers.has(userId) 
                ? 'bg-green-500 dark:bg-green-400' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            title={`${userId}: ${enabledUsers.has(userId) ? 'Enabled' : 'Disabled'}`}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <span>Each dot represents a user</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Enabled</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
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
  const [progress, setProgress] = useState(0);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  // Generate consistent user IDs
  const users = useMemo(() => generateUsers(), []);

  const checkRollout = async () => {
    if (!sdk) return;
    
    setIsLoading(true);
    setProgress(0);
    setRateLimitWarning(null);
    
    try {
      // Process users in smaller batches to respect rate limits
      const batchSize = 10; // Smaller batch size
      const results: { userId: string; isEnabled: boolean }[] = [];
      let rateLimitHit = false;
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (userId) => {
            try {
              // Use SDK with user context for consistent rollout
              const isEnabled = await measureAsync(
                `flag-check-${userId}`,
                () => sdk.isEnabled(flagKey, false, userId)
              );
              console.log(`User ${userId}: ${isEnabled}`);
              return { userId, isEnabled };
            } catch (error) {
              console.error(`Error checking flag for ${userId}:`, error);
              // Check if it's a rate limit error
              if (error instanceof Error && error.message.includes('429')) {
                rateLimitHit = true;
                setRateLimitWarning('Rate limit exceeded. Showing partial results.');
              } else if (error instanceof Error && error.message.includes('404')) {
                setRateLimitWarning(`Flag '${flagKey}' not found. Create it in your dashboard to see the rollout visualization.`);
              }
              return { userId, isEnabled: false };
            }
          })
        );
        
        results.push(...batchResults);
        
        // Update progress
        setProgress(Math.round((results.length / users.length) * 100));
        
        // Stop if rate limit hit
        if (rateLimitHit) {
          break;
        }
        
        // Longer pause between batches to avoid rate limits
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
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
      setRateLimitWarning('Error occurred while checking flags');
    } finally {
      setIsLoading(false);
    }
  };

  // Only check on mount and when flag key changes
  useEffect(() => {
    if (sdk && flagKey) {
      checkRollout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk, flagKey]);

  const enabledCount = enabledUsers.size;
  const enabledPercentage = ((enabledCount / users.length) * 100).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Percentage Rollout</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Visualize how percentage rollouts affect 900 simulated users
        </p>
      </div>

      <PerformanceDebugger 
        metrics={getMetrics()} 
        stats={getAggregatedStats()} 
        onClearMetrics={clearMetrics}
      />

      <FeatureDemo
        title="Rollout Visualization"
        description="900 users in a 30x30 grid showing rollout distribution"
        info="This demo uses the FlagVault SDK with user context and cache disabled for real-time rollout behavior. Each user gets consistent results based on their ID."
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
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length.toLocaleString()}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled Users</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{enabledCount.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Percentage</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{enabledPercentage}%</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disabled Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{(users.length - enabledCount).toLocaleString()}</p>
            </div>
          </div>

          {rateLimitWarning && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{rateLimitWarning}</span>
            </div>
          )}

          <UserGrid 
            users={users} 
            enabledUsers={enabledUsers} 
            isLoading={isLoading}
            progress={progress}
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="How Rollouts Work"
        description="Understanding the consistent hashing algorithm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Consistent Distribution</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                Each user ID is hashed with the flag key and rollout seed
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                Hash result determines if user is in rollout percentage
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                Same user always gets same result (deterministic)
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                Distribution is evenly spread across user base
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Rollout Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                Gradual feature release reduces risk
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                Monitor performance impact with small groups
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                Easy to increase percentage over time
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-2">•</span>
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
        <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
            <span><strong className="dark:text-white">Start Small:</strong> Begin with 1-5% of users to validate the feature</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
            <span><strong className="dark:text-white">Monitor Metrics:</strong> Watch performance, errors, and user feedback</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
            <span><strong className="dark:text-white">Gradual Increase:</strong> Expand to 10%, 25%, 50%, 75%, 100% over time</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
            <span><strong className="dark:text-white">Quick Rollback:</strong> Reduce percentage immediately if issues arise</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mr-3">5</span>
            <span><strong className="dark:text-white">Full Release:</strong> Set to 100% when confident, then remove flag</span>
          </li>
        </ol>
      </FeatureDemo>
    </div>
  );
}