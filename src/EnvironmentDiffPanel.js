import React, { useState } from 'react';

const EnvironmentDiffPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};
  
  // State for expanded items
  const [expandedItems, setExpandedItems] = useState({});

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

  const getDiffStats = (diff) => {
    if (diff.type === 'added') {
      const lines = diff.newContent.split('\n').length;
      return `+${lines}`;
    } else if (diff.type === 'removed') {
      const lines = diff.oldContent.split('\n').length;
      return `-${lines}`;
    } else if (diff.type === 'modified') {
      const oldLines = diff.oldContent.split('\n').length;
      const newLines = diff.newContent.split('\n').length;
      const added = Math.max(0, newLines - oldLines);
      const removed = Math.max(0, oldLines - newLines);
      return `+${added} -${removed}`;
    }
    return '';
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderDiffContent = (content, type) => {
    if (!content) return <div className="text-gray-500 italic">Empty</div>;
    
    return content.split('\n').map((line, index) => (
      <div key={index} className="font-mono text-xs leading-relaxed text-gray-300">
        {line || ' '}
      </div>
    ));
  };

  return (
    <div className="p-4 text-white h-full overflow-y-auto bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">
        {environment ? `${environment.name} - Configuration Diff` : 'Environment Diff'}
      </h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium">Configuration Changes</h4>
          <div className="text-xs text-gray-400">
            {diffData.length} files changed
          </div>
        </div>
        
        <div className="space-y-2">
          {diffData.map((diff, index) => (
            <div key={index} className="border border-gray-700 rounded">
              <div 
                className="px-3 py-2 hover:bg-gray-800 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs w-3">
                    {expandedItems[index] ? '▼' : '▶'}
                  </span>
                  <span className="font-mono text-sm text-gray-300">
                    {diff.file}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    diff.type === 'added' ? 'text-green-400' :
                    diff.type === 'removed' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {getDiffStats(diff)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    diff.type === 'added' ? 'bg-green-900/20 text-green-400' :
                    diff.type === 'removed' ? 'bg-red-900/20 text-red-400' :
                    'bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {diff.type === 'modified' ? 'M' : diff.type === 'added' ? 'A' : 'D'}
                  </span>
                </div>
              </div>
              
              {expandedItems[index] && (
                <div className="bg-gray-800/50">
                  <div className="grid grid-cols-2 gap-0">
                    <div className="p-4 border-r border-gray-700">
                      <div className="text-xs text-gray-400 mb-2 font-medium">
                        {diff.type === 'added' ? 'New File' : 'Before'}
                      </div>
                      <div className="bg-gray-900 p-3 rounded max-h-64 overflow-y-auto">
                        {diff.type === 'added' ? (
                          <div className="text-gray-500 italic">New file</div>
                        ) : (
                          renderDiffContent(diff.oldContent)
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-xs text-gray-400 mb-2 font-medium">
                        {diff.type === 'removed' ? 'Deleted' : 'After'}
                      </div>
                      <div className="bg-gray-900 p-3 rounded max-h-64 overflow-y-auto">
                        {diff.type === 'removed' ? (
                          <div className="text-gray-500 italic">File deleted</div>
                        ) : (
                          renderDiffContent(diff.newContent)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded border border-gray-600">
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default EnvironmentDiffPanel;