import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';

const EnvironmentLogsPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};
  const [logs, setLogs] = useState([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [logLevel, setLogLevel] = useState('all');
  const logsRef = useRef(null);

  // Mock log data
  const mockLogs = [
    { timestamp: '2024-01-26 10:30:15', level: 'INFO', service: 'api-gateway', message: 'Server started on port 3000' },
    { timestamp: '2024-01-26 10:30:16', level: 'INFO', service: 'database', message: 'Database connection established' },
    { timestamp: '2024-01-26 10:30:17', level: 'INFO', service: 'redis', message: 'Redis cache connected successfully' },
    { timestamp: '2024-01-26 10:30:20', level: 'DEBUG', service: 'api-gateway', message: 'Processing health check request' },
    { timestamp: '2024-01-26 10:30:25', level: 'INFO', service: 'api-gateway', message: 'GET /api/users - 200 OK (45ms)' },
    { timestamp: '2024-01-26 10:30:30', level: 'WARN', service: 'database', message: 'Query took longer than expected: 1.2s' },
    { timestamp: '2024-01-26 10:30:35', level: 'INFO', service: 'api-gateway', message: 'POST /api/auth/login - 200 OK (123ms)' },
    { timestamp: '2024-01-26 10:30:40', level: 'ERROR', service: 'payment', message: 'Payment gateway timeout - retrying...' },
    { timestamp: '2024-01-26 10:30:42', level: 'INFO', service: 'payment', message: 'Payment processed successfully on retry' },
    { timestamp: '2024-01-26 10:30:45', level: 'DEBUG', service: 'cache', message: 'Cache hit rate: 85%' },
    { timestamp: '2024-01-26 10:30:50', level: 'INFO', service: 'api-gateway', message: 'GET /api/products - 200 OK (67ms)' },
    { timestamp: '2024-01-26 10:30:55', level: 'WARN', service: 'monitoring', message: 'CPU usage above 80%' },
  ];

  useEffect(() => {
    setLogs(mockLogs);
    
    // Simulate real-time logs
    const interval = setInterval(() => {
      const newLog = {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        level: ['INFO', 'DEBUG', 'WARN', 'ERROR'][Math.floor(Math.random() * 4)],
        service: ['api-gateway', 'database', 'redis', 'payment', 'cache'][Math.floor(Math.random() * 5)],
        message: [
          'Processing request...',
          'Database query executed',
          'Cache updated',
          'User authentication successful',
          'Background job completed',
          'Health check passed'
        ][Math.floor(Math.random() * 6)]
      };
      
      setLogs(prev => [...prev, newLog].slice(-100)); // Keep only last 100 logs
    }, 3000);

    return () => clearInterval(interval);
  }, [mockLogs]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isAutoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return '#f44336';
      case 'WARN': return '#FF9800';
      case 'INFO': return '#4CAF50';
      case 'DEBUG': return '#2196F3';
      default: return '#ffffff';
    }
  };

  const getServiceColor = (service) => {
    const colors = {
      'api-gateway': '#9C27B0',
      'database': '#3F51B5',
      'redis': '#F44336',
      'payment': '#FF9800',
      'cache': '#4CAF50',
      'monitoring': '#795548'
    };
    return colors[service] || '#607D8B';
  };

  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-2 border-b border-gray-700 bg-black flex justify-between items-center">
        <h4 className="m-0 text-sm font-medium">
          {environment ? `${environment.name} - Logs` : 'Environment Logs'}
        </h4>
        <div className="flex gap-2 items-center">
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600"
          >
            <option value="all">All Levels</option>
            <option value="ERROR">Error</option>
            <option value="WARN">Warning</option>
            <option value="INFO">Info</option>
            <option value="DEBUG">Debug</option>
          </select>
          <Button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`h-6 px-2 text-xs ${isAutoScroll ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            Auto-scroll
          </Button>
          <Button
            onClick={clearLogs}
            className="h-6 px-2 text-xs"
            variant="outline"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div 
        ref={logsRef}
        className="flex-1 p-2 overflow-y-auto font-mono text-xs"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.target;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
          setIsAutoScroll(isAtBottom);
        }}
      >
        {filteredLogs.map((log, index) => (
          <div key={index} className="flex gap-2 py-1 hover:bg-gray-800 px-1 rounded">
            <span className="text-gray-400 flex-shrink-0 w-20">
              {log.timestamp.split(' ')[1]}
            </span>
            <span 
              className="flex-shrink-0 w-12 font-bold text-center"
              style={{ color: getLevelColor(log.level) }}
            >
              {log.level}
            </span>
            <span 
              className="flex-shrink-0 w-20 text-center text-xs px-1 rounded"
              style={{ 
                backgroundColor: getServiceColor(log.service) + '20',
                color: getServiceColor(log.service),
                border: `1px solid ${getServiceColor(log.service)}40`
              }}
            >
              {log.service}
            </span>
            <span className="flex-1 text-gray-100">
              {log.message}
            </span>
          </div>
        ))}
        
        {filteredLogs.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No logs to display
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-700 bg-black text-xs text-gray-400">
        <div className="flex justify-between">
          <span>{filteredLogs.length} log entries</span>
          <span>Real-time monitoring active</span>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentLogsPanel;
