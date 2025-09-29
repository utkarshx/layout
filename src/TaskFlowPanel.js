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
  NodeResizer,
  useUpdateNodeInternals,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useAppStore from './store/useAppStore';
import { Button } from './components/ui/button';

// Custom Task Node Component (can host step subflow)
const TaskNode = ({ id, data, selected }) => {
  const { task } = data || {};
  const onAddStep = data?.onAddStep;
  const updateTask = useAppStore((s) => s.updateTask);

  const isCompleted = task?.status === 'completed';

  const onStart = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      updateTask(task.id, { status: 'completed' });
    }
  };

  return (
    <div className={`relative rounded-md border ${selected ? 'border-blue-400' : 'border-gray-600'} bg-gray-800 text-white w-full h-full shadow`}> 
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

      <div className="px-3 pt-3 text-sm font-semibold truncate" title={task?.name}>
        {task?.name}
      </div>
      <div className="px-3 mt-2 text-xs flex items-center gap-2">
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

      {/* Add Step control */}
      {onAddStep && (
        <button
          onClick={(e) => { e.stopPropagation(); onAddStep(task?.id); }}
          className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded border bg-gray-700 border-gray-600 hover:bg-gray-600"
          title="Add Step"
        >
          + Step
        </button>
      )}

      {/* Optional handles for future connections */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Environment Node Component (group parent for subflows)
const EnvironmentNode = ({ id, data, selected }) => {
  const { environment, taskCount } = data || {};
  const updateNodeInternals = useUpdateNodeInternals();
  const requestUpdate = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        updateNodeInternals(id);
      } catch {}
    });
  }, [id, updateNodeInternals]);
  return (
    <div
      className={`relative rounded-md border ${selected ? 'border-blue-400' : 'border-gray-600'} bg-gray-900/70 text-white w-full h-full`}
      style={{ boxSizing: 'border-box', contain: 'layout paint size', willChange: 'width, height' }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={360}
        minHeight={220}
        handleStyle={{ borderRadius: 2 }}
        onResizeStart={requestUpdate}
        onResize={requestUpdate}
        onResizeEnd={requestUpdate}
      />
      <div className="px-2 py-1 text-xs border-b border-gray-700 bg-gray-800/80 flex items-center justify-between">
        <span className="font-semibold truncate" title={environment?.name}>{environment?.name || 'Environment'}</span>
        <span className="text-[10px] opacity-80">{taskCount ?? 0} tasks</span>
      </div>
      {/* Children task nodes render inside */}
    </div>
  );
};

// Step Node Component (child of task)
const StepNode = ({ data, selected }) => {
  const { label, status } = data || {};
  return (
    <div className={`rounded-md border ${selected ? 'border-blue-400' : 'border-gray-600'} bg-gray-700 text-white px-2 py-2 w-full h-full`}> 
      <div className="text-[11px] font-medium truncate" title={label}>{label || 'Step'}</div>
      {status && (
        <div className="mt-1 text-[10px] opacity-80">{status}</div>
      )}
    </div>
  );
};

const nodeTypes = { taskNode: TaskNode, environmentNode: EnvironmentNode, stepNode: StepNode };

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
  const environments = useAppStore((s) => s.environments);
  const addTask = useAppStore((s) => s.addTask);

  const [edges, setEdges] = useState([]);
  const [nodes, setNodes] = useState(() => {
    // Initial layout: grid environments, tasks inside each env
    const envColCount = 2;
    const envXGap = 560;
    const envYGap = 360;
    const envPositions = {};
    environments.forEach((env, idx) => {
      const col = idx % envColCount;
      const row = Math.floor(idx / envColCount);
      envPositions[env.id] = { x: col * envXGap, y: row * envYGap };
    });

    const envNodes = environments.map((env) => ({
      id: env.id,
      type: 'environmentNode',
      position: envPositions[env.id] || { x: 0, y: 0 },
      data: { environment: env, taskCount: tasks.filter((t) => t.environmentId === env.id).length },
      style: { width: 520, height: 300 },
    }));

    // Child task positions relative to parent area
    const childOffset = { x: 12, y: 24 };
    const childXGap = 240;
    const childYGap = 140;
    const taskIndexByEnv = {};
    const taskNodes = tasks.map((t) => {
      const idx = (taskIndexByEnv[t.environmentId] = (taskIndexByEnv[t.environmentId] || 0) + 1) - 1;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      return {
        id: t.id,
        type: 'taskNode',
        parentId: t.environmentId,
        extent: 'parent',
        position: { x: childOffset.x + col * childXGap, y: childOffset.y + row * childYGap },
        style: { width: 260, height: 180 },
        data: { task: t },
      };
    });

    return [...envNodes, ...taskNodes];
  });

  // Keep nodes in sync with environments and tasks while preserving positions (and keep existing steps)
  useEffect(() => {
    setNodes((existing) => {
      const byId = new Map(existing.map((n) => [n.id, n]));

      // 1) Environment parent nodes first
      const envNodes = environments.map((env, idx) => {
        const current = byId.get(env.id);
        const taskCount = tasks.filter((t) => t.environmentId === env.id).length;
        if (current) {
          return { ...current, type: 'environmentNode', data: { environment: env, taskCount } };
        }
        // new environment → place next to others
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        return {
          id: env.id,
          type: 'environmentNode',
          position: { x: col * 560, y: row * 360 },
          data: { environment: env, taskCount },
          style: { width: 520, height: 300 },
        };
      });

      // 2) Task child nodes
      const childOffset = { x: 12, y: 24 };
      const childXGap = 240;
      const childYGap = 140;
      const taskIndexByEnv = {};
      const taskNodes = tasks.map((t) => {
        const current = byId.get(t.id);
        if (current) {
          // Ensure parentId and data are up to date, keep position
          return { ...current, parentId: t.environmentId, extent: 'parent', data: { task: t }, style: current.style || { width: 260, height: 180 } };
        }
        const idx = (taskIndexByEnv[t.environmentId] = (taskIndexByEnv[t.environmentId] || 0) + 1) - 1;
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        return {
          id: t.id,
          type: 'taskNode',
          parentId: t.environmentId,
          extent: 'parent',
          position: { x: childOffset.x + col * childXGap, y: childOffset.y + row * childYGap },
          style: { width: 260, height: 180 },
          data: { task: t },
        };
      });

      // 3) Keep existing step nodes that belong to existing tasks
      const existingTaskIds = new Set(tasks.map((t) => t.id));
      const stepNodes = existing.filter((n) => n.type === 'stepNode' && existingTaskIds.has(n.parentId));

      // Inject onAddStep callback into task node data
      const taskNodesWithActions = taskNodes.map((n) => ({ ...n, data: { ...n.data, onAddStep: (taskId) => {
        setNodes((nds) => {
          // count existing steps for grid placement
          const stepsForTask = nds.filter((x) => x.type === 'stepNode' && x.parentId === taskId);
          const idx = stepsForTask.length;
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const newStepId = `step_${taskId}_${Date.now()}`;
          const newStep = {
            id: newStepId,
            type: 'stepNode',
            parentId: taskId,
            extent: 'parent',
            position: { x: 16 + col * 120, y: 64 + row * 80 },
            style: { width: 108, height: 56 },
            data: { label: `Step ${idx + 1}`, status: 'pending' },
          };
          return [...nds, newStep];
        });
      } } }));

      return [...envNodes, ...taskNodesWithActions, ...stepNodes];
    });
  }, [environments, tasks]);

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


