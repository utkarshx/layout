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
    <div className="p-4 text-white h-full overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold">
        {environment ? `${environment.name} - Configuration Diff` : 'Environment Diff'}
      </h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium">Configuration Changes</h4>
          <div className="text-xs text-gray-400">
            {diffData.length} changes
          </div>
        </div>
        
        <div className="space-y-3">
          {diffData.map((diff, index) => (
            <div key={index} className="border-l-4" style={{ borderLeftColor: getDiffColor(diff.type) }}>
              <div className="bg-gray-800 px-3 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span style={{ color: getDiffColor(diff.type) }}>
                    {getDiffIcon(diff.type)}
                  </span>
                  <span className="font-medium text-sm">
                    {diff.file}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded text-white uppercase" style={{ backgroundColor: getDiffColor(diff.type) }}>
                  {diff.type}
                </span>
              </div>
              
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">Old Version</div>
                    <div className="bg-gray-900 p-2 text-xs font-mono">
                      {diff.oldContent ? formatDiffContent(diff.oldContent) : 
                       <div className="text-gray-500 italic">File removed</div>}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">New Version</div>
                    <div className="bg-gray-900 p-2 text-xs font-mono">
                      {diff.newContent ? formatDiffContent(diff.newContent) : 
                       <div className="text-gray-500 italic">File added</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="mb-3 text-sm font-medium">Diff Summary</h4>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">2</div>
            <div className="text-xs text-gray-400">Modified</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">1</div>
            <div className="text-xs text-gray-400">Added</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">1</div>
            <div className="text-xs text-gray-400">Removed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">4</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded">
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default EnvironmentDiffPanel;