'use client';

import { useCallback, useRef } from 'react';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetric[]>([]);

  const measureAsync = useCallback(async <T>(
    operation: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let success = true;
    let error: string | undefined;
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: PerformanceMetric = {
        operation,
        duration,
        timestamp: Date.now(),
        success,
        error,
      };
      
      metricsRef.current.push(metric);
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      // Keep only last 100 metrics
      if (metricsRef.current.length > 100) {
        metricsRef.current = metricsRef.current.slice(-100);
      }
    }
  }, []);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  const getAggregatedStats = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        p95Duration: 0,
        slowOperations: 0,
        successRate: 100,
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const successCount = metrics.filter(m => m.success).length;
    
    return {
      totalOperations: metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
      slowOperations: metrics.filter(m => m.duration > 1000).length,
      successRate: (successCount / metrics.length) * 100,
    };
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  return {
    measureAsync,
    getMetrics,
    getAggregatedStats,
    clearMetrics,
  };
}