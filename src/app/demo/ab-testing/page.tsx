'use client';

import React, { useEffect, useState } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { Palette, Layout } from 'lucide-react';

const abTestingCode = `// A/B Testing with Feature Flags
const sdk = new FlagVaultSDK({ apiKey: 'test_your-api-key' });

if (await sdk.isEnabled('new-checkout-flow')) {
  // Show new checkout design
  return <NewCheckoutFlow />;
} else {
  // Show current checkout design
  return <CurrentCheckoutFlow />;
}`;

const conversionTrackingCode = `// Track conversion metrics for A/B tests
async function trackCheckoutConversion(variant: 'control' | 'treatment') {
  // Track which variant led to conversion
  analytics.track('checkout_completed', {
    variant,
    flag: 'new-checkout-flow',
    timestamp: new Date().toISOString()
  });
}

// In your component
const isNewCheckout = await sdk.isEnabled('new-checkout-flow');
const variant = isNewCheckout ? 'treatment' : 'control';

// On successful checkout
await trackCheckoutConversion(variant);`;

// Design A - Traditional Layout
function DesignA() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional Layout</h3>
      <div className="space-y-4">
        <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
          <span className="text-gray-500">Hero Section</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 h-24 rounded flex items-center justify-center">
            <span className="text-gray-500">Feature 1</span>
          </div>
          <div className="bg-gray-100 h-24 rounded flex items-center justify-center">
            <span className="text-gray-500">Feature 2</span>
          </div>
          <div className="bg-gray-100 h-24 rounded flex items-center justify-center">
            <span className="text-gray-500">Feature 3</span>
          </div>
        </div>
        <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors">
          Traditional CTA Button
        </button>
      </div>
    </div>
  );
}

// Design B - Modern Layout
function DesignB() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-sm border border-blue-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Modern Layout</h3>
      <div className="space-y-4">
        <div className="bg-white/80 backdrop-blur h-32 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-blue-600 font-medium">Enhanced Hero</span>
        </div>
        <div className="space-y-3">
          <div className="bg-white/80 backdrop-blur h-20 rounded-lg flex items-center px-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mr-4"></div>
            <span className="text-gray-700">Feature with Icon</span>
          </div>
          <div className="bg-white/80 backdrop-blur h-20 rounded-lg flex items-center px-4 shadow-sm">
            <div className="w-12 h-12 bg-indigo-500 rounded-lg mr-4"></div>
            <span className="text-gray-700">Feature with Icon</span>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
          Modern CTA with Gradient
        </button>
      </div>
    </div>
  );
}

export default function ABTestingDemo() {
  const { sdk } = useFlagVault();
  const [showModernDesign, setShowModernDesign] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sdk) {
      setIsLoading(false);
      return;
    }

    const checkFlag = async () => {
      const isEnabled = await sdk.isEnabled('modern-ui-design', false);
      setShowModernDesign(isEnabled);
      setIsLoading(false);
    };

    checkFlag();
    // Check every 5 seconds for demo purposes
    const interval = setInterval(checkFlag, 5000);
    
    return () => clearInterval(interval);
  }, [sdk]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Testing</h1>
        <p className="text-lg text-gray-600">
          Use feature flags to test different UI designs and measure performance
        </p>
      </div>

      <FeatureDemo
        title="Live A/B Test Example"
        description="Toggle the 'modern-ui-design' flag in your dashboard to switch between designs"
        info="The design automatically updates when you change the flag status"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {showModernDesign ? (
                <Palette className="h-5 w-5 text-blue-600" />
              ) : (
                <Layout className="h-5 w-5 text-gray-600" />
              )}
              <span className="font-medium text-gray-900">
                Currently showing: {showModernDesign ? 'Design B (Modern)' : 'Design A (Traditional)'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              showModernDesign 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {showModernDesign ? 'Treatment' : 'Control'}
            </span>
          </div>

          {isLoading ? (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Loading design...</span>
            </div>
          ) : showModernDesign ? (
            <DesignB />
          ) : (
            <DesignA />
          )}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation"
        description="How to implement A/B testing with feature flags"
      >
        <div className="space-y-6">
          <CodeExample
            title="Basic A/B Test"
            code={abTestingCode}
            language="typescript"
          />
          <CodeExample
            title="Conversion Tracking"
            code={conversionTrackingCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="A/B Testing Best Practices"
        description="Tips for running successful A/B tests"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Test Setup</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Define clear success metrics before starting
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Test one variable at a time for clear results
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Ensure adequate sample size for significance
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Run tests for complete business cycles
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Using Feature Flags</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Instant rollback if issues arise
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                No code deployment needed to switch variants
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Test in production with real user behavior
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Gradual rollout with percentage controls
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>
    </div>
  );
}