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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        {info && (
          <div className="mt-3 flex items-start space-x-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}