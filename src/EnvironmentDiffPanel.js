import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

const EnvironmentDiffPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};

  // Mock diff data
  const diffData = [
    {
      type: 'modified',
      file: 'config/database.yml',
      oldContent: 'host: localhost\nport: 5432',
      newContent: 'host: prod-db.example.com\nport: 5432\nssl: true',
      status: 'changed'
    },
    {
      type: 'added',
      file: 'config/redis.yml',
      oldContent: '',
      newContent: 'host: redis.example.com\nport: 6379',
      status: 'added'
    },
    {
      type: 'removed',
      file: 'config/old-service.yml',
      oldContent: 'service: old-api\nversion: 1.0',
      newContent: '',
      status: 'removed'
    },
    {
      type: 'modified',
      file: 'docker-compose.yml',
      oldContent: 'image: app:1.2.0',
      newContent: 'image: app:1.3.0\nenvironment:\n  - NODE_ENV=production',
      status: 'changed'
    }
  ];

  const getDiffIcon = (type) => {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      case 'modified': return '~';
      default: return '';
    }
  };

  const getDiffColor = (type) => {
    switch (type) {
      case 'added': return '#4CAF50';
      case 'removed': return '#f44336';
      case 'modified': return '#FF9800';
      default: return '#888';
    }
  };

  const formatDiffContent = (content) => {
    if (!content) return '';
    return content.split('\n').map((line, index) => (
      <div key={index} style={{ 
        fontFamily: 'monospace', 
        fontSize: '12px',
        lineHeight: '1.4',
        color: line.startsWith('+') ? '#4CAF50' : 
               line.startsWith('-') ? '#f44336' : '#ccc'
      }}>
        {line}
      </div>
    ));
  };

  return (
    <div className="p-5 text-white h-full overflow-y-auto">
      <h3 className="mb-5 mt-0 text-lg font-semibold">
        {environment ? `${environment.name} - Configuration Diff` : 'Environment Diff'}
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0 }}>Configuration Changes</h4>
          <div style={{ fontSize: '12px', color: '#ccc' }}>
            {diffData.length} changes
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {diffData.map((diff, index) => (
            <div key={index} style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '6px', 
              border: `1px solid ${getDiffColor(diff.type)}`,
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    color: getDiffColor(diff.type), 
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {getDiffIcon(diff.type)}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {diff.file}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  backgroundColor: getDiffColor(diff.type),
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {diff.type}
                </span>
              </div>
              
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#888', 
                      marginBottom: '8px',
                      fontWeight: 'bold'
                    }}>
                      Old Version
                    </div>
                    <div style={{ 
                      backgroundColor: '#0a0a0a', 
                      padding: '12px', 
                      borderRadius: '4px',
                      border: '1px solid #333',
                      minHeight: '60px'
                    }}>
                      {diff.oldContent ? formatDiffContent(diff.oldContent) : 
                       <div style={{ color: '#666', fontStyle: 'italic' }}>File removed</div>}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#888', 
                      marginBottom: '8px',
                      fontWeight: 'bold'
                    }}>
                      New Version
                    </div>
                    <div style={{ 
                      backgroundColor: '#0a0a0a', 
                      padding: '12px', 
                      borderRadius: '4px',
                      border: '1px solid #333',
                      minHeight: '60px'
                    }}>
                      {diff.newContent ? formatDiffContent(diff.newContent) : 
                       <div style={{ color: '#666', fontStyle: 'italic' }}>File added</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ marginBottom: '15px' }}>Diff Summary</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '10px' 
        }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>2</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Modified</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>1</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Added</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>1</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Removed</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007acc' }}>4</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Total</div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default EnvironmentDiffPanel;