import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';

const EnvironmentTerminalPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState([
    { type: 'info', text: `Terminal connected to ${environment?.name || 'Environment'}` },
    { type: 'info', text: 'Type commands below...' },
    { type: 'prompt', text: '$ ' }
  ]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Mock command execution
  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add command to history
    setHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Add command to output
    const newOutput = [...output, { type: 'command', text: `$ ${trimmedCmd}` }];

    // Mock command responses
    let response = '';
    switch (trimmedCmd.toLowerCase()) {
      case 'ls':
      case 'ls -la':
        response = `total 24
drwxr-xr-x  8 user user  256 Jan 26 10:30 .
drwxr-xr-x  3 user user   96 Jan 26 10:29 ..
-rw-r--r--  1 user user  123 Jan 26 10:30 .env
-rw-r--r--  1 user user 1024 Jan 26 10:30 docker-compose.yml
drwxr-xr-x  3 user user   96 Jan 26 10:30 config
drwxr-xr-x  4 user user  128 Jan 26 10:30 src
-rw-r--r--  1 user user  567 Jan 26 10:30 package.json`;
        break;
      case 'pwd':
        response = `/home/user/${environment?.name?.toLowerCase() || 'environment'}`;
        break;
      case 'ps aux':
      case 'ps':
        response = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  18508  3424 ?        Ss   10:29   0:00 /sbin/init
user       123  0.5  2.1 123456 12345 ?        Sl   10:30   0:01 node server.js
user       456  0.2  1.5  98765  9876 ?        S    10:30   0:00 postgres
user       789  0.1  0.8  54321  5432 ?        S    10:30   0:00 redis-server`;
        break;
      case 'docker ps':
        response = `CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                    NAMES
a1b2c3d4e5f6   app:latest     "node server.js"         2 hours ago     Up 2 hours     0.0.0.0:3000->3000/tcp   app_container
f6e5d4c3b2a1   postgres:14    "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:5432->5432/tcp   postgres_db
1a2b3c4d5e6f   redis:7        "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:6379->6379/tcp   redis_cache`;
        break;
      case 'npm start':
        response = `> app@1.0.0 start
> node server.js

Server starting on port 3000...
Environment: ${environment?.name || 'development'}
Database connected successfully
Redis cache connected
Server is running at http://localhost:3000`;
        break;
      case 'git status':
        response = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/app.js
        modified:   config/database.yml

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        logs/debug.log

no changes added to commit (use "git add" and/or "git commit -a")`;
        break;
      case 'help':
        response = `Available commands:
  ls, ls -la    - List directory contents
  pwd           - Print working directory
  ps, ps aux    - List running processes
  docker ps     - List Docker containers
  npm start     - Start the application
  git status    - Show git repository status
  clear         - Clear terminal
  help          - Show this help message`;
        break;
      case 'clear':
        setOutput([
          { type: 'info', text: `Terminal connected to ${environment?.name || 'Environment'}` },
          { type: 'prompt', text: '$ ' }
        ]);
        setCommand('');
        return;
      default:
        response = `bash: ${trimmedCmd}: command not found`;
        break;
    }

    newOutput.push({ type: 'output', text: response });
    newOutput.push({ type: 'prompt', text: '$ ' });
    setOutput(newOutput);
    setCommand('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(history[newIndex]);
        }
      }
    }
  };

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getOutputColor = (type) => {
    switch (type) {
      case 'command': return '#4CAF50';
      case 'output': return '#ffffff';
      case 'info': return '#2196F3';
      case 'prompt': return '#4CAF50';
      default: return '#ffffff';
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono">
      <div className="p-2 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
        <h4 className="m-0 text-sm font-medium">
          {environment ? `${environment.name} - Terminal` : 'Terminal'}
        </h4>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setOutput([
                { type: 'info', text: `Terminal connected to ${environment?.name || 'Environment'}` },
                { type: 'prompt', text: '$ ' }
              ]);
              setCommand('');
            }}
            className="h-6 px-2 text-xs"
            variant="outline"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div 
        ref={outputRef}
        className="flex-1 p-3 overflow-y-auto text-sm leading-relaxed"
        style={{ backgroundColor: '#000000' }}
      >
        {output.map((line, index) => (
          <div 
            key={index} 
            className="whitespace-pre-wrap"
            style={{ color: getOutputColor(line.type) }}
          >
            {line.text}
          </div>
        ))}
        
        {/* Input line */}
        <div className="flex items-center" style={{ color: '#4CAF50' }}>
          <span>$ </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white ml-1"
            style={{ caretColor: '#4CAF50' }}
            placeholder="Type a command..."
          />
        </div>
      </div>
      
      <div className="p-2 border-t border-gray-700 bg-gray-900 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Use ↑/↓ for command history</span>
          <span>Type 'help' for available commands</span>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentTerminalPanel;
