'use client';

import React, { useState } from 'react';
import { useFlagVault } from '@/contexts/FlagVaultContext';

export function LoadTest() {
  const { sdk } = useFlagVault();
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    responseTime: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runLoadTest = async (concurrency: number) => {
    if (!sdk || isRunning) return;
    
    setIsRunning(true);
    setResults(null);
    
    const start = Date.now();
    const requests = Array.from({ length: concurrency }, (_, i) => 
      sdk.isEnabled('load-test', false, `user-${i}`)
        .then(() => ({ success: true }))
        .catch(() => ({ success: false }))
    );
    
    try {
      const responses = await Promise.all(requests);
      const successful = responses.filter(r => r.success).length;
      const failed = responses.filter(r => !r.success).length;
      const responseTime = Date.now() - start;
      
      setResults({ successful, failed, responseTime });
    } catch (error) {
      console.error('Load test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-4">Backend Load Test</h4>
      
      <div className="flex space-x-2 mb-4">
        {[10, 50, 100, 200, 500].map(count => (
          <button
            key={count}
            onClick={() => runLoadTest(count)}
            disabled={!sdk || isRunning}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            {count} requests
          </button>
        ))}
      </div>
      
      {isRunning && (
        <div className="text-sm text-gray-600">Running load test...</div>
      )}
      
      {results && (
        <div className="text-sm space-y-1">
          <div>✅ Successful: {results.successful}</div>
          <div>❌ Failed: {results.failed}</div>
          <div>⏱️ Total time: {results.responseTime}ms</div>
          <div>📊 Success rate: {((results.successful / (results.successful + results.failed)) * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
}