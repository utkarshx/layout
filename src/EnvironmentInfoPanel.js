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
    <div style={{ padding: '20px', color: 'white', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '20px', marginTop: 0 }}>
        Environment Information
      </h3>
      
      {/* Environment Overview */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px', color: '#007acc' }}>Overview</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '15px' 
        }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Name</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{environmentData.name}</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Status</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: getStatusColor(environmentData.status) }}>
              ● {environmentData.status}
            </div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>URL</div>
            <div style={{ fontSize: '14px', color: '#007acc', wordBreak: 'break-all' }}>
              {environmentData.url}
            </div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Version</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{environmentData.version}</div>
          </div>
        </div>
      </div>
      
      {/* Services */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px', color: '#007acc' }}>Services</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {services.map((service, index) => (
            <div key={index} style={{ 
              backgroundColor: '#1a1a1a', 
              padding: '15px', 
              borderRadius: '6px', 
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{service.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    backgroundColor: getStatusColor(service.status),
                    color: 'white'
                  }}>
                    {service.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#ccc' }}>
                    {service.version}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>CPU:</span>
                  <span style={{ fontSize: '12px', color: getResourceColor(service.cpu), fontWeight: 'bold' }}>
                    {service.cpu}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Memory:</span>
                  <span style={{ fontSize: '12px', color: getResourceColor(service.memory), fontWeight: 'bold' }}>
                    {service.memory}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional Info */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px', color: '#007acc' }}>Additional Information</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '15px' 
        }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
              {environmentData.uptime}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Uptime</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
              {environmentData.cost}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Monthly Cost</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007acc' }}>
              {services.length}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Services</div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div style={{ textAlign: 'center' }}>
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          marginRight: '10px'
        }}>
          Edit Environment
        </button>
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          View Logs
        </button>
      </div>
    </div>
  );
};

export default EnvironmentInfoPanel;