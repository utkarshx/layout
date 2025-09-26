import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

const EnvironmentInfoPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};

  // Mock environment data
  const environmentData = {
    name: environment?.name || 'Development Environment',
    type: 'Development',
    status: 'Active',
    url: 'https://dev.example.com',
    region: 'us-west-2',
    created: '2024-01-15',
    lastUpdated: '2024-01-26',
    version: '1.3.0',
    team: 'Platform Engineering',
    owner: 'John Doe',
    cost: '$245/month',
    uptime: '99.9%'
  };

  const services = [
    { name: 'API Gateway', status: 'Running', version: '2.1.0', cpu: '45%', memory: '60%' },
    { name: 'Database', status: 'Running', version: 'PostgreSQL 14', cpu: '30%', memory: '75%' },
    { name: 'Cache', status: 'Running', version: 'Redis 7.0', cpu: '15%', memory: '40%' },
    { name: 'Queue', status: 'Running', version: 'RabbitMQ 3.12', cpu: '20%', memory: '35%' },
    { name: 'Storage', status: 'Running', version: 'MinIO 2023', cpu: '10%', memory: '25%' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running': return '#4CAF50';
      case 'Stopped': return '#f44336';
      case 'Warning': return '#FF9800';
      default: return '#888';
    }
  };

  const getResourceColor = (usage) => {
    const value = parseInt(usage);
    if (value >= 80) return '#f44336';
    if (value >= 60) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <div className="p-4 text-white h-full overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold">
        Environment Information
      </h3>
      
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-blue-400">Overview</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3">
            <div className="text-xs text-gray-400 mb-1">Name</div>
            <div className="text-base font-medium">{environmentData.name}</div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className="text-base font-medium" style={{ color: getStatusColor(environmentData.status) }}>
              ● {environmentData.status}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-400 mb-1">URL</div>
            <div className="text-sm text-blue-400 break-all">
              {environmentData.url}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-400 mb-1">Version</div>
            <div className="text-base font-medium">{environmentData.version}</div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-blue-400">Services</h4>
        <div className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-sm">{service.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: getStatusColor(service.status) }}>
                    {service.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {service.version}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">CPU:</span>
                  <span className="text-xs font-medium" style={{ color: getResourceColor(service.cpu) }}>
                    {service.cpu}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Memory:</span>
                  <span className="text-xs font-medium" style={{ color: getResourceColor(service.memory) }}>
                    {service.memory}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-blue-400">Additional Information</h4>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {environmentData.uptime}
            </div>
            <div className="text-xs text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">
              {environmentData.cost}
            </div>
            <div className="text-xs text-gray-400">Monthly Cost</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {services.length}
            </div>
            <div className="text-xs text-gray-400">Services</div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded mr-2">
          Edit Environment
        </button>
        <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded">
          View Logs
        </button>
      </div>
    </div>
  );
};

export default EnvironmentInfoPanel;