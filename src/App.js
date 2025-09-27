import React, { useState, useMemo, useRef, createContext, useEffect } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-core/dist/styles/dockview.css';
import './App.css';
import LeftPanel from './LeftPanel';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';
import TaskDetailPanel from './TaskDetailPanel';
import TaskChatPanel from './TaskChatPanel';
import ChatPanel from './ChatPanel';
import TodoPanel from './TodoPanel';
import EnvironmentTasksPanel from './EnvironmentTasksPanel';
import EnvironmentDiffPanel from './EnvironmentDiffPanel';
import EnvironmentInfoPanel from './EnvironmentInfoPanel';

export const DockviewApiContext = createContext(null);

const App = () => {
  const [dockviewApi, setDockviewApi] = useState(null);
  const dockviewApiRef = useRef(null);

  // Enable dark mode on app load
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const components = useMemo(() => ({
    LeftPanel: (props) => <LeftPanel {...props} dockviewApi={dockviewApi} />,
    EnvironmentPanel: (props) => <EnvironmentPanel {...props} dockviewApi={dockviewApi} />,
    TaskPanel: (props) => <TaskPanel {...props} />,
    TaskDetailPanel: (props) => <TaskDetailPanel {...props} />,
    TaskChatPanel: (props) => <TaskChatPanel {...props} />,
    ChatPanel: (props) => <ChatPanel {...props} />,
    TodoPanel: (props) => <TodoPanel {...props} />,
    EnvironmentTasksPanel: (props) => <EnvironmentTasksPanel {...props} />,
    EnvironmentDiffPanel: (props) => <EnvironmentDiffPanel {...props} />,
    EnvironmentInfoPanel: (props) => <EnvironmentInfoPanel {...props} />,
  }), [dockviewApi]);

  const onReady = (event) => {
    const { api } = event;
    console.log('Dockview API ready:', api);
    setDockviewApi(api);
    dockviewApiRef.current = api;

    try {
      api.addPanel({
        id: 'left_panel',
        component: 'LeftPanel',
        title: 'Controls',
      });
      console.log('Left panel added successfully');

      // Add chat panel to the same tabbed group
      api.addPanel({
        id: 'chat_panel',
        component: 'ChatPanel',
        title: 'Chat',
        position: { referencePanel: 'left_panel', direction: 'right' },
      });
      console.log('Chat panel added successfully');

      // Add todo panel as a separate panel
      // api.addPanel({
      //   id: 'todo_panel',
      //   component: 'TodoPanel',
      //   title: 'Todo Lists',
      //   position: { referencePanel: 'chat_panel', direction: 'right' },
      // });
      console.log('Todo panel added successfully');
    } catch (error) {
      console.error('Error adding panels:', error);
    }
  };

  const HeaderStrip = () => (
    <div className="bg-gray-900 border-b border-gray-700 px-3 py-1 flex items-center justify-between h-8">
      <div className="flex items-center space-x-3">
        {/* <h1 className="text-white font-medium text-sm">CodeBolt Layout</h1> */}
        <span 
          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full cursor-pointer transition-colors inline-flex items-center"
          onClick={() => {
            if (dockviewApi) {
              // Check if task panel already exists
              const existingPanel = dockviewApi.getPanel('task_panel');
              if (!existingPanel) {
                dockviewApi.addPanel({
                  id: 'task_panel',
                  component: 'TaskPanel',
                  title: 'Tasks',
                  position: { referencePanel: 'chat_panel', direction: 'right' },
                });
              } else {
                existingPanel.focus();
              }
            }
          }}
        >
          Tasks Mode
        </span>
        <span 
          className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-full cursor-pointer transition-colors inline-flex items-center"
          onClick={() => {
            if (dockviewApi) {
              // Focus on chat panel if it exists
              const chatPanel = dockviewApi.getPanel('chat_panel');
              if (chatPanel) {
                chatPanel.focus();
              }
            }
          }}
        >
          Chat Mode
        </span>
      </div>
     
    </div>
  );

  return (
    <DockviewApiContext.Provider value={dockviewApi}>
      <div style={{ height: '100vh' }} className="flex flex-col">
        <HeaderStrip />
        <div className="flex-1">
          <DockviewReact
            components={components}
            onReady={onReady}
            className="dockview-theme-dark"
          />
        </div>
      </div>
    </DockviewApiContext.Provider>
  );
};

export default App;