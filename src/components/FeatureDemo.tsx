'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface FeatureDemoProps {
  title: string;
  description: string;
  children: React.ReactNode;
  info?: string;
}

export function FeatureDemo({ title, description, children, info }: FeatureDemoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
        {info && (
          <div className="mt-3 flex items-start space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}