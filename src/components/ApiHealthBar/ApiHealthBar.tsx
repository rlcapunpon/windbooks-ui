import React, { useState, useEffect, useCallback } from 'react';
import { getApiHealthUrl, getOrgApiHealthUrl } from '../../utils/env';

interface ApiHealthStatus {
  auth: 'healthy' | 'unhealthy' | 'loading';
  org: 'healthy' | 'unhealthy' | 'loading';
}

export const ApiHealthBar: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus>({
    auth: 'loading',
    org: 'loading',
  });

  const checkHealth = useCallback(async () => {
    const checkApiHealth = async (url: string): Promise<'healthy' | 'unhealthy'> => {
      try {
        const response = await fetch(url);
        return response.ok ? 'healthy' : 'unhealthy';
      } catch {
        return 'unhealthy';
      }
    };

    const [authHealth, orgHealth] = await Promise.all([
      checkApiHealth(getApiHealthUrl()),
      checkApiHealth(getOrgApiHealthUrl()),
    ]);

    setHealthStatus({
      auth: authHealth,
      org: orgHealth,
    });
  }, []);

  // Initial health check and polling
  useEffect(() => {
    checkHealth();

    const interval = setInterval(checkHealth, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleMinimize = () => setIsMinimized(true);
  const handleMaximize = () => setIsMinimized(false);
  const handleRefresh = () => checkHealth();

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2">
          <button
            onClick={handleMaximize}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            aria-label="maximize"
            title="Expand Health Bar"
          >
            <div
              data-testid="health-bulb-icon"
              className={`w-3 h-3 rounded-full ${
                healthStatus.auth === 'healthy' && healthStatus.org === 'healthy'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">API Health Status</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              aria-label="refresh"
              title="Refresh API Health Status"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleMinimize}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              aria-label="minimize"
              title="Minimize Health Bar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>

        <div
          data-testid="api-health-grid"
          className="grid grid-cols-2 gap-4"
        >
          <div
            data-testid="api-health-card"
            className="border border-gray-200 rounded-lg p-3"
          >
            <h4 className="font-medium text-gray-700 mb-2">AUTH API</h4>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  healthStatus.auth === 'healthy'
                    ? 'bg-green-500'
                    : healthStatus.auth === 'unhealthy'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              />
              <span className={`text-sm font-medium ${
                healthStatus.auth === 'healthy'
                  ? 'text-green-600'
                  : healthStatus.auth === 'unhealthy'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {healthStatus.auth === 'loading' ? 'Loading...' :
                 healthStatus.auth === 'healthy' ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
          </div>

          <div
            data-testid="api-health-card"
            className="border border-gray-200 rounded-lg p-3"
          >
            <h4 className="font-medium text-gray-700 mb-2">ORG API</h4>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  healthStatus.org === 'healthy'
                    ? 'bg-green-500'
                    : healthStatus.org === 'unhealthy'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              />
              <span className={`text-sm font-medium ${
                healthStatus.org === 'healthy'
                  ? 'text-green-600'
                  : healthStatus.org === 'unhealthy'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {healthStatus.org === 'loading' ? 'Loading...' :
                 healthStatus.org === 'healthy' ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};