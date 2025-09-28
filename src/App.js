import React, { useState, useMemo, useRef, createContext, useEffect } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-core/dist/styles/dockview.css';
import './App.css';
import LeftPanel from './LeftPanel';
import EnvironmentPanel from './EnvironmentPanel';
import EnvironmentListPanel from './EnvironmentListPanel';
import TaskPanel from './TaskPanel';
import TaskDetailPanel from './TaskDetailPanel';
import TaskChatPanel from './TaskChatPanel';
import ChatPanel from './ChatPanel';
import TodoPanel from './TodoPanel';
import EnvironmentTasksPanel from './EnvironmentTasksPanel';
import EnvironmentDiffPanel from './EnvironmentDiffPanel';
import EnvironmentInfoPanel from './EnvironmentInfoPanel';
import TaskFlowPanel from './TaskFlowPanel';
import useAppStore from './store/useAppStore';
import { Button } from './components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';
import { Plus } from 'lucide-react';

export const DockviewApiContext = createContext(null);

const App = () => {
  const [dockviewApi, setDockviewApi] = useState(null);
  const dockviewApiRef = useRef(null);
  const [layoutMode, setLayoutMode] = useState('task'); // 'task' | 'normal'
  const { setTaskOpenMode, setEnvironmentOpenMode } = useAppStore();

  // Enable dark mode on app load
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const components = useMemo(() => ({
    LeftPanel: (props) => <LeftPanel {...props} dockviewApi={dockviewApi} />,
    EnvironmentListPanel: (props) => <EnvironmentListPanel {...props} dockviewApi={dockviewApi} />,
    EnvironmentPanel: (props) => <EnvironmentPanel {...props} dockviewApi={dockviewApi} />,
    TaskPanel: (props) => <TaskPanel {...props} />,
    TaskDetailPanel: (props) => <TaskDetailPanel {...props} />,
    TaskChatPanel: (props) => <TaskChatPanel {...props} />,
    ChatPanel: (props) => <ChatPanel {...props} />,
    TodoPanel: (props) => <TodoPanel {...props} />,
    EnvironmentTasksPanel: (props) => <EnvironmentTasksPanel {...props} />,
    EnvironmentDiffPanel: (props) => <EnvironmentDiffPanel {...props} />,
    EnvironmentInfoPanel: (props) => <EnvironmentInfoPanel {...props} />,
    TaskFlowPanel: (props) => <TaskFlowPanel {...props} />,
  }), [dockviewApi]);

  const closeIfExists = (api, id) => {
    try {
      const p = api.getPanel(id);
      if (p) p.api.close();
    } catch {}
  };

  const buildTaskLayout = (api) => {
    // Close base panels if they exist
    ['left_panel','environment_list','chat_panel','todo_panel','general_environment_panel'].forEach(id => closeIfExists(api,id));

    // Left controls
    api.addPanel({ id: 'left_panel', component: 'LeftPanel', title: 'Controls' });
    // Chat to the right (create right column first)
    api.addPanel({ id: 'chat_panel', component: 'ChatPanel', title: 'Chat', position: { referencePanel: 'left_panel', direction: 'right' } });
    // Environment lists stacked below within the left column
    api.addPanel({ id: 'environment_list', component: 'EnvironmentListPanel', title: 'Environment Lists', position: { referencePanel: 'left_panel', direction: 'below' } });
    // General Environment panel to the right of chat
    api.addPanel({ id: 'general_environment_panel', component: 'EnvironmentPanel', title: 'Environment Panel', position: { referencePanel: 'chat_panel', direction: 'right' } });

    // Defaults for this layout
    setTaskOpenMode('chat');
    setEnvironmentOpenMode('preview');
  };

  const buildNormalLayout = (api) => {
    ['left_panel','environment_list','chat_panel','todo_panel','general_environment_panel'].forEach(id => closeIfExists(api,id));
    // Todo on left
    api.addPanel({ id: 'todo_panel', component: 'TodoPanel', title: 'Todo Lists' });
    // Chat on right
    api.addPanel({ id: 'chat_panel', component: 'ChatPanel', title: 'Chat', position: { referencePanel: 'todo_panel', direction: 'right' } });
    // Defaults for modes (preview safe)
    setTaskOpenMode('preview');
    setEnvironmentOpenMode('preview');
  };

  const onReady = (event) => {
    const { api } = event;
    console.log('Dockview API ready:', api);
    setDockviewApi(api);
    dockviewApiRef.current = api;

    try {
      // Default layout: Task Mode
      buildTaskLayout(api);
    } catch (error) {
      console.error('Error adding panels:', error);
    }
  };

  const HeaderStrip = () => (
    <div className="bg-gray-900 border-b border-gray-700 px-3 py-1 flex items-center justify-between h-8">
      <div className="flex items-center space-x-2">
        <button
          className={`px-2 py-1 text-xs rounded border ${layoutMode === 'task' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-800'}`}
          onClick={() => {
            if (!dockviewApi) return;
            setLayoutMode('task');
            buildTaskLayout(dockviewApi);
          }}
          title="Task Mode"
        >
          Task Mode
        </button>
        <button
          className={`px-2 py-1 text-xs rounded border ${layoutMode === 'normal' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-800'}`}
          onClick={() => {
            if (!dockviewApi) return;
            setLayoutMode('normal');
            buildNormalLayout(dockviewApi);
          }}
          title="Normal Mode"
        >
          Normal Mode
        </button>
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
            leftHeaderActionsComponent={() => {
              const openOrFocus = (id, component, title, position) => {
                const api = dockviewApiRef.current;
                if (!api) return;
                const existing = api.getPanel(id);
                if (existing) {
                  existing.focus();
                  return;
                }
                try {
                  api.addPanel({ id, component, title, position });
                } catch {}
              };

              // Decide default positioning when re-creating panels
              const defaultPositions = {
                chat_panel: () => ({ referencePanel: 'left_panel', direction: 'right' }),
                environment_list: () => ({ referencePanel: 'left_panel', direction: 'below' }),
                todo_panel: () => ({ referencePanel: 'chat_panel', direction: 'right' }),
                left_panel: () => undefined,
                taskflow_panel: () => ({ referencePanel: 'todo_panel', direction: 'right' }),
              };

              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-full w-7 p-0" title="Open panel">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 bg-gray-900 border-gray-700 p-1">
                    <div className="space-y-1 text-sm">
                      <button
                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-700"
                        onClick={() => openOrFocus('chat_panel', 'ChatPanel', 'Chat', defaultPositions.chat_panel())}
                      >
                        Chat
                      </button>
                      <button
                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-700"
                        onClick={() => openOrFocus('left_panel', 'LeftPanel', 'Controls', defaultPositions.left_panel())}
                      >
                        Task List
                      </button>
                      <button
                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-700"
                        onClick={() => openOrFocus('environment_list', 'EnvironmentListPanel', 'Environment Lists', defaultPositions.environment_list())}
                      >
                        Environment List
                      </button>
                      <button
                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-700"
                        onClick={() => openOrFocus('todo_panel', 'TodoPanel', 'Todo Lists', defaultPositions.todo_panel())}
                      >
                        Todo
                      </button>
                      <button
                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-700"
                        onClick={() => openOrFocus('taskflow_panel', 'TaskFlowPanel', 'Task Flow', defaultPositions.taskflow_panel())}
                      >
                        Task Flow
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        </div>
      </div>
    </DockviewApiContext.Provider>
  );
};

export default App;