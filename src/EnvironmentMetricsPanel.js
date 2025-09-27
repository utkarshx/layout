import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';

const EnvironmentMetricsPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};
  const [metrics, setMetrics] = useState({});
  const [timeRange, setTimeRange] = useState('1h');

  // Mock metrics data
  useEffect(() => {
    const generateMetrics = () => ({
      cpu: {
        current: Math.floor(Math.random() * 30) + 40, // 40-70%
        average: Math.floor(Math.random() * 20) + 45, // 45-65%
        peak: Math.floor(Math.random() * 20) + 70, // 70-90%
        history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 30) + 40)
      },
      memory: {
        current: Math.floor(Math.random() * 25) + 50, // 50-75%
        average: Math.floor(Math.random() * 20) + 55, // 55-75%
        peak: Math.floor(Math.random() * 15) + 80, // 80-95%
        history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 25) + 50)
      },
      disk: {
        current: Math.floor(Math.random() * 20) + 30, // 30-50%
        average: Math.floor(Math.random() * 15) + 35, // 35-50%
        peak: Math.floor(Math.random() * 20) + 60, // 60-80%
        history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 30)
      },
      network: {
        inbound: Math.floor(Math.random() * 50) + 10, // 10-60 MB/s
        outbound: Math.floor(Math.random() * 30) + 5, // 5-35 MB/s
        connections: Math.floor(Math.random() * 200) + 100, // 100-300 connections
        history: Array.from({ length: 20 }, () => ({
          in: Math.floor(Math.random() * 50) + 10,
          out: Math.floor(Math.random() * 30) + 5
        }))
      },
      requests: {
        current: Math.floor(Math.random() * 100) + 50, // 50-150 req/min
        total: Math.floor(Math.random() * 10000) + 50000, // 50k-60k total
        errors: Math.floor(Math.random() * 5) + 1, // 1-6 errors
        avgResponseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
        history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 50)
      }
    });

    setMetrics(generateMetrics());

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(generateMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const getUsageColor = (percentage) => {
    if (percentage >= 80) return '#f44336';
    if (percentage >= 60) return '#FF9800';
    return '#4CAF50';
  };


  const MiniChart = ({ data, color = '#4CAF50', height = 30 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-0.5" style={{ height }}>
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 rounded-t"
            style={{
              backgroundColor: color,
              height: `${((value - min) / range) * 100}%`,
              minHeight: '2px',
              opacity: 0.7
            }}
          />
        ))}
      </div>
    );
  };

  const MetricCard = ({ title, current, average, peak, unit = '%', history, color }) => (
    <div className="bg-gray-800 p-3 rounded border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-sm font-medium text-gray-300">{title}</h5>
        <span className="text-xs text-gray-500">{timeRange}</span>
      </div>
      
      <div className="mb-3">
        <div className="text-2xl font-bold" style={{ color }}>
          {current}{unit}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Avg: {average}{unit} | Peak: {peak}{unit}
        </div>
      </div>
      
      {history && (
        <div className="mt-2">
          <MiniChart data={history} color={color} />
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-2 border-b border-gray-700 bg-black flex justify-between items-center">
        <h4 className="m-0 text-sm font-medium">
          {environment ? `${environment.name} - Metrics` : 'Environment Metrics'}
        </h4>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600"
          >
            <option value="5m">Last 5 minutes</option>
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>
          <Button
            onClick={() => window.location.reload()}
            className="h-6 px-2 text-xs"
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {/* System Metrics */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">System Resources</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="CPU Usage"
              current={metrics.cpu?.current}
              average={metrics.cpu?.average}
              peak={metrics.cpu?.peak}
              history={metrics.cpu?.history}
              color={getUsageColor(metrics.cpu?.current || 0)}
            />
            <MetricCard
              title="Memory Usage"
              current={metrics.memory?.current}
              average={metrics.memory?.average}
              peak={metrics.memory?.peak}
              history={metrics.memory?.history}
              color={getUsageColor(metrics.memory?.current || 0)}
            />
            <MetricCard
              title="Disk Usage"
              current={metrics.disk?.current}
              average={metrics.disk?.average}
              peak={metrics.disk?.peak}
              history={metrics.disk?.history}
              color={getUsageColor(metrics.disk?.current || 0)}
            />
          </div>
        </div>

        {/* Network Metrics */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Network Activity</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <h6 className="text-sm font-medium text-gray-300 mb-2">Traffic</h6>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Inbound</span>
                  <span className="text-sm font-medium text-blue-400">
                    {metrics.network?.inbound} MB/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Outbound</span>
                  <span className="text-sm font-medium text-green-400">
                    {metrics.network?.outbound} MB/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Connections</span>
                  <span className="text-sm font-medium text-yellow-400">
                    {metrics.network?.connections}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <h6 className="text-sm font-medium text-gray-300 mb-2">Requests</h6>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Current Rate</span>
                  <span className="text-sm font-medium text-blue-400">
                    {metrics.requests?.current}/min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Total Today</span>
                  <span className="text-sm font-medium text-green-400">
                    {metrics.requests?.total?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Errors</span>
                  <span className="text-sm font-medium text-red-400">
                    {metrics.requests?.errors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Avg Response</span>
                  <span className="text-sm font-medium text-yellow-400">
                    {metrics.requests?.avgResponseTime}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Service Status</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: 'API Gateway', status: 'healthy' },
              { name: 'Database', status: 'healthy' },
              { name: 'Cache', status: 'warning' },
              { name: 'Queue', status: 'healthy' }
            ].map((service, index) => (
              <div key={index} className="bg-gray-800 p-2 rounded border border-gray-700 text-center">
                <div className="text-xs text-gray-400 mb-1">{service.name}</div>
                <div className={`text-xs font-medium ${
                  service.status === 'healthy' ? 'text-green-400' :
                  service.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  ● {service.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-gray-700 bg-black text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>Auto-refresh: 5s</span>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentMetricsPanel;
