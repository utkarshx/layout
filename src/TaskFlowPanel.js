import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  applyNodeChanges,
  addEdge,
  applyEdgeChanges,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useAppStore from './store/useAppStore';
import { Button } from './components/ui/button';

// Custom Task Node Component
const TaskNode = ({ id, data, selected }) => {
  const { task } = data || {};
  const updateTask = useAppStore((s) => s.updateTask);

  const isCompleted = task?.status === 'completed';

  const onStart = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      updateTask(task.id, { status: 'completed' });
    }
  };

  return (
    <div className={`relative rounded-md border ${selected ? 'border-blue-400' : 'border-gray-600'} bg-gray-800 text-white px-3 py-3 w-56 shadow`}> 
      {/* Top button */}
      <button
        onClick={onStart}
        disabled={isCompleted}
        className={`absolute -top-4 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded border ${
          isCompleted ? 'bg-green-700/70 border-green-600 text-green-200 cursor-default' : 'bg-blue-700 border-blue-600 text-white hover:bg-blue-600'
        }`}
        title={isCompleted ? 'Completed' : 'Start Task'}
      >
        {isCompleted ? 'Completed' : 'Start'}
      </button>

      <div className="text-sm font-semibold truncate" title={task?.name}>
        {task?.name}
      </div>
      <div className="mt-2 text-xs flex items-center gap-2">
        <span className={`px-1.5 py-0.5 rounded border ${
          isCompleted ? 'bg-green-800/60 border-green-700 text-green-200' : task?.status === 'in-progress' ? 'bg-yellow-800/60 border-yellow-700 text-yellow-200' : 'bg-gray-700 border-gray-600 text-gray-200'
        }`}>
          {task?.status}
        </span>
        {task?.priority && (
          <span className="px-1.5 py-0.5 rounded border bg-gray-700 border-gray-600 text-gray-200">
            {task.priority}
          </span>
        )}
      </div>

      {/* Optional handles for future connections */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = { taskNode: TaskNode };

const generateInitialPositions = (tasks) => {
  // Lay out nodes in a simple grid
  const positions = {};
  const colCount = 3;
  const xGap = 240;
  const yGap = 140;
  tasks.forEach((t, idx) => {
    const col = idx % colCount;
    const row = Math.floor(idx / colCount);
    positions[t.id] = { x: col * xGap, y: row * yGap };
  });
  return positions;
};

const TaskFlowPanel = () => {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);

  const [edges, setEdges] = useState([]);
  const [nodes, setNodes] = useState(() => {
    const positions = generateInitialPositions(tasks);
    return tasks.map((t) => ({
      id: t.id,
      type: 'taskNode',
      position: positions[t.id] || { x: 0, y: 0 },
      data: { task: t },
    }));
  });

  // Keep node data in sync with tasks while preserving positions and selection
  useEffect(() => {
    setNodes((existing) => {
      const byId = new Map(existing.map((n) => [n.id, n]));
      const next = tasks.map((t, idx) => {
        const current = byId.get(t.id);
        if (current) {
          return { ...current, data: { task: t } };
        }
        // new task → add new node with a basic grid position
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        return {
          id: t.id,
          type: 'taskNode',
          position: { x: col * 240, y: row * 140 },
          data: { task: t },
        };
      });
      // Remove nodes whose tasks were deleted
      return next;
    });
  }, [tasks]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const handleAddTask = () => {
    const id = `task_${Date.now()}`;
    const name = `New Task ${tasks.length + 1}`;
    const environmentId = 'env1';
    addTask({ id, name, status: 'pending', priority: 'low', environmentId });
  };

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Defer mounting the heavy canvas until layout stabilizes in dockview
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      <ReactFlowProvider>
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
      {/* <div className="p-2.5 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
        <div className="text-sm font-medium">Task Flow</div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddTask} className="bg-gray-700 hover:bg-gray-600 border border-gray-600 px-3 py-1 h-7 text-xs">
            Add Task
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0" style={{ contain: 'strict', overflow: 'hidden' }}>
        {ready && (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div> */}
    </div>
  );
};

export default TaskFlowPanel;


