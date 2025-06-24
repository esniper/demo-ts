'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  p95Duration: number;
  slowOperations: number;
  successRate: number;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface PerformanceDebuggerProps {
  metrics: PerformanceMetric[];
  stats: PerformanceStats;
  onClearMetrics?: () => void;
}

export function PerformanceDebugger({ metrics, stats, onClearMetrics }: PerformanceDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const recentMetrics = metrics.slice(-10).reverse();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div 
        className="p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Performance Monitor</span>
            {stats.slowOperations > 0 && (
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">{stats.slowOperations} slow</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
            <span>{stats.totalOperations} ops</span>
            <span>{stats.averageDuration.toFixed(0)}ms avg</span>
            <span className={isExpanded ? 'rotate-180' : ''}>⌄</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Avg Time</span>
              </div>
              <p className="text-sm font-bold text-blue-600">{stats.averageDuration.toFixed(1)}ms</p>
            </div>
            
            <div className="bg-purple-50 p-2 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <TrendingUp className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium text-gray-700">P95 Time</span>
              </div>
              <p className="text-sm font-bold text-purple-600">{stats.p95Duration.toFixed(1)}ms</p>
            </div>
            
            <div className="bg-green-50 p-2 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <Activity className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-gray-700">Success Rate</span>
              </div>
              <p className="text-sm font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
            </div>
            
            <div className="bg-orange-50 p-2 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-xs font-medium text-gray-700">Slow Ops</span>
              </div>
              <p className="text-sm font-bold text-orange-600">{stats.slowOperations}</p>
            </div>
          </div>

          {/* Recent Operations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">Recent Operations</h4>
              {onClearMetrics && (
                <button
                  onClick={onClearMetrics}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {recentMetrics.length === 0 ? (
                <p className="text-xs text-gray-500">No operations recorded yet</p>
              ) : (
                recentMetrics.map((metric, index) => (
                  <div 
                    key={`${metric.timestamp}-${index}`}
                    className={`flex items-center justify-between p-2 rounded text-xs ${
                      metric.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        metric.success ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium text-gray-900">{metric.operation}</span>
                      {metric.error && (
                        <span className="text-red-600 text-xs">({metric.error})</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        metric.duration > 1000 ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {metric.duration.toFixed(1)}ms
                      </span>
                      <span className="text-gray-400">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}