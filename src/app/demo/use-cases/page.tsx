'use client';

import React, { useEffect, useState } from 'react';
import { FeatureDemo } from '@/components/FeatureDemo';
import { FlagStatus } from '@/components/FlagStatus';
import { CodeExample } from '@/components/CodeExample';
import { useFlagVault } from '@/contexts/FlagVaultContext';
import { 
  AlertTriangle, 
  Users, 
  Settings, 
  Bug, 
  Globe,
  Shield,
  Zap,
  Eye
} from 'lucide-react';

const killSwitchCode = `// Emergency kill switch for problematic features
const canUseExternalAPI = await sdk.isEnabled('external-api-enabled', false);

if (canUseExternalAPI) {
  try {
    return await externalAPICall();
  } catch (error) {
    // Log error and fall back
    console.error('External API failed:', error);
    return fallbackData;
  }
} else {
  // Feature disabled, use fallback immediately
  return fallbackData;
}`;

const betaFeaturesCode = `// Beta features for selected users
const isBetaUser = user.plan === 'premium' || user.betaAccess;
const hasBetaFeatures = await sdk.isEnabled('beta-features', false);

if (isBetaUser && hasBetaFeatures) {
  return (
    <div>
      <PremiumFeatures />
      <BetaFeatures />
    </div>
  );
}

return <StandardFeatures />;`;

const maintenanceModeCode = `// System-wide maintenance mode
const isMaintenanceMode = await sdk.isEnabled('maintenance-mode', false);

if (isMaintenanceMode) {
  return (
    <MaintenancePage 
      message="We're performing scheduled maintenance. Please check back soon!"
    />
  );
}

return <NormalApplication />;`;

const debugModeCode = `// Debug mode for development and troubleshooting
const isDebugMode = await sdk.isEnabled('debug-mode', false);

if (isDebugMode) {
  // Enable verbose logging
  console.log('Debug mode enabled');
  window.debugMode = true;
  
  // Show debug information
  return (
    <div>
      <DebugPanel />
      <ApplicationContent />
    </div>
  );
}

return <ApplicationContent />;`;

const regionalFeaturesCode = `// Region-specific features
const userRegion = getUserRegion();
const hasEUFeatures = await sdk.isEnabled('eu-features', false);
const hasAsiaFeatures = await sdk.isEnabled('asia-features', false);

const features = {
  gdprCompliance: userRegion === 'EU' && hasEUFeatures,
  asianPayments: userRegion === 'Asia' && hasAsiaFeatures,
  defaultFeatures: true
};

return <RegionalApp features={features} />;`;

interface UseCaseDemo {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  flagKey: string;
  color: string;
  enabled: boolean;
  isLoading: boolean;
}

export default function UseCasesDemo() {
  const { sdk } = useFlagVault();
  const [useCases, setUseCases] = useState<UseCaseDemo[]>([
    {
      id: 'kill-switch',
      title: 'Kill Switch',
      description: 'Emergency disable for problematic features',
      icon: AlertTriangle,
      flagKey: 'emergency-kill-switch',
      color: 'text-red-600 bg-red-50',
      enabled: false,
      isLoading: true
    },
    {
      id: 'beta-features',
      title: 'Beta Features',
      description: 'Early access features for premium users',
      icon: Users,
      flagKey: 'beta-features',
      color: 'text-blue-600 bg-blue-50',
      enabled: false,
      isLoading: true
    },
    {
      id: 'maintenance',
      title: 'Maintenance Mode',
      description: 'System-wide maintenance notifications',
      icon: Settings,
      flagKey: 'maintenance-mode',
      color: 'text-yellow-600 bg-yellow-50',
      enabled: false,
      isLoading: true
    },
    {
      id: 'debug',
      title: 'Debug Mode',
      description: 'Development and troubleshooting tools',
      icon: Bug,
      flagKey: 'debug-mode',
      color: 'text-purple-600 bg-purple-50',
      enabled: false,
      isLoading: true
    },
    {
      id: 'regional',
      title: 'Regional Features',
      description: 'Location-based feature availability',
      icon: Globe,
      flagKey: 'regional-features',
      color: 'text-green-600 bg-green-50',
      enabled: false,
      isLoading: true
    },
    {
      id: 'security',
      title: 'Security Features',
      description: 'Enhanced security and compliance',
      icon: Shield,
      flagKey: 'security-features',
      color: 'text-indigo-600 bg-indigo-50',
      enabled: false,
      isLoading: true
    }
  ]);

  useEffect(() => {
    if (!sdk) return;

    const checkFlags = async () => {
      const updatedUseCases = await Promise.all(
        useCases.map(async (useCase) => {
          try {
            const enabled = await sdk.isEnabled(useCase.flagKey, false);
            return { ...useCase, enabled, isLoading: false };
          } catch (error) {
            return { ...useCase, enabled: false, isLoading: false };
          }
        })
      );
      setUseCases(updatedUseCases);
    };

    checkFlags();
    const interval = setInterval(checkFlags, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [sdk]);

  const getUseCaseContent = (useCase: UseCaseDemo) => {
    if (useCase.isLoading) {
      return <div className="text-sm text-gray-500">Checking status...</div>;
    }

    switch (useCase.id) {
      case 'kill-switch':
        return useCase.enabled ? (
          <div className="p-3 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
            🚨 Emergency mode active - External services disabled
          </div>
        ) : (
          <div className="p-3 bg-green-100 border border-green-200 rounded text-green-800 text-sm">
            ✅ All systems operational
          </div>
        );
      
      case 'beta-features':
        return useCase.enabled ? (
          <div className="space-y-2">
            <div className="p-2 bg-blue-100 rounded text-sm text-blue-800">
              🎯 Advanced Analytics Dashboard
            </div>
            <div className="p-2 bg-blue-100 rounded text-sm text-blue-800">
              🔬 Experimental AI Features
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
            Standard features only
          </div>
        );
      
      case 'maintenance':
        return useCase.enabled ? (
          <div className="p-3 bg-yellow-100 border border-yellow-200 rounded text-yellow-800 text-sm">
            🚧 Scheduled maintenance: 2:00 AM - 4:00 AM UTC
          </div>
        ) : (
          <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
            No scheduled maintenance
          </div>
        );
      
      case 'debug':
        return useCase.enabled ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Eye className="h-4 w-4 text-purple-600" />
              <span>Debug panel visible</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Verbose logging enabled</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Debug tools hidden</div>
        );
      
      default:
        return useCase.enabled ? (
          <div className="text-sm text-green-600">Feature enabled</div>
        ) : (
          <div className="text-sm text-gray-600">Feature disabled</div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Use Cases Gallery</h1>
        <p className="text-lg text-gray-600">
          Explore common feature flag patterns and real-world applications
        </p>
      </div>

      <FeatureDemo
        title="Live Use Cases"
        description="Interactive examples of feature flag patterns"
        info="Toggle these flags in your dashboard to see the effects in real-time"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <div key={useCase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${useCase.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{useCase.title}</h3>
                      <p className="text-sm text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <FlagStatus flagKey={useCase.flagKey} showDetails />
                  </div>
                  
                  {getUseCaseContent(useCase)}
                </div>
              </div>
            );
          })}
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Examples"
        description="Code examples for common use case patterns"
      >
        <div className="space-y-6">
          <CodeExample
            title="Kill Switch Pattern"
            code={killSwitchCode}
            language="typescript"
          />
          <CodeExample
            title="Beta Features Access"
            code={betaFeaturesCode}
            language="typescript"
          />
          <CodeExample
            title="Maintenance Mode"
            code={maintenanceModeCode}
            language="typescript"
          />
          <CodeExample
            title="Debug Mode Toggle"
            code={debugModeCode}
            language="typescript"
          />
          <CodeExample
            title="Regional Features"
            code={regionalFeaturesCode}
            language="typescript"
          />
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Use Case Benefits"
        description="Why feature flags excel in these scenarios"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Operational Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Instant Response:</strong> Toggle features without deployments</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Risk Mitigation:</strong> Quick rollback for problematic features</span>
              </li>
              <li className="flex items-start">
                <Settings className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Operational Control:</strong> Manage features during incidents</span>
              </li>
              <li className="flex items-start">
                <Eye className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Observability:</strong> Debug and monitor in production</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Business Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Users className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>User Segmentation:</strong> Target specific user groups</span>
              </li>
              <li className="flex items-start">
                <Globe className="h-4 w-4 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Market Adaptation:</strong> Region-specific feature sets</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Faster Innovation:</strong> Test features with reduced risk</span>
              </li>
              <li className="flex items-start">
                <Bug className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Quality Assurance:</strong> Beta testing with real users</span>
              </li>
            </ul>
          </div>
        </div>
      </FeatureDemo>

      <FeatureDemo
        title="Implementation Tips"
        description="Best practices for each use case"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Kill Switches</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Keep flag names simple and obvious</li>
              <li>• Default to 'enabled' in normal operation</li>
              <li>• Document emergency procedures</li>
              <li>• Test kill switches regularly</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Beta Features</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Combine with user-based targeting</li>
              <li>• Collect feedback mechanisms</li>
              <li>• Monitor performance impact</li>
              <li>• Plan graduation to general availability</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Provide informative messages</li>
              <li>• Include estimated completion times</li>
              <li>• Allow admin access bypass</li>
              <li>• Test maintenance pages beforehand</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Debug Mode</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Restrict to authorized users only</li>
              <li>• Avoid exposing sensitive data</li>
              <li>• Include performance monitoring</li>
              <li>• Auto-disable in production</li>
            </ul>
          </div>
        </div>
      </FeatureDemo>
    </div>
  );
}