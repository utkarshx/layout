import React, { useCallback, useContext, useEffect, useState } from 'react';
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
// import { Button } from './components/ui/button';
import { DockviewApiContext } from './App';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';

// Custom Task Node Component (can host step subflow)
const TaskNode = ({ id, data, selected }) => {
  const { task } = data || {};
  const onAddStep = data?.onAddStep;
  const updateTask = useAppStore((s) => s.updateTask);
  const updateNodeInternals = useUpdateNodeInternals();
  const dockviewApi = useContext(DockviewApiContext);
  const requestUpdate = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        updateNodeInternals(id);
      } catch {}
    });
  }, [id, updateNodeInternals]);

  const isCompleted = task?.status === 'completed';

  const onStart = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      updateTask(task.id, { status: 'completed' });
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className={`relative rounded-md border ${selected ? 'border-blue-400' : 'border-gray-600'} bg-gray-800 text-white w-full h-full shadow`}> 
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        handleStyle={{ borderRadius: 2 }}
        onResizeStart={requestUpdate}
        onResize={requestUpdate}
        onResizeEnd={requestUpdate}
      />
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
      {/* View Task control (top-right) */}
      {(() => {
        const mode = data?.openMode || 'normal';
        if (mode === 'preview') {
          return (
            <Popover open={previewOpen} onOpenChange={setPreviewOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
                  className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded border bg-gray-700 border-gray-600 hover:bg-gray-600"
                  title="View Task"
                >
                  View
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700" side="left" align="center">
                <div className="h-full">
                  <DockviewApiContext.Provider value={dockviewApi}>
                    <TaskPanel 
                      params={{ task }}
                      api={{ 
                        id: 'popover-task-panel',
                        title: `${task?.name || 'Task'} - Task`,
                        group: { location: { type: 'popover' } },
                        onPanelOpen: () => setPreviewOpen(false)
                      }}
                    />
                  </DockviewApiContext.Provider>
                </div>
              </PopoverContent>
            </Popover>
          );
        }
        // normal / pinned behave the same for tasks as standard tabs
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!dockviewApi || !task) return;
              try {
                dockviewApi.addPanel({
                  id: `task_panel_${task.id}_${Date.now()}`,
                  component: 'TaskPanel',
                  title: task.name || 'Task',
                  params: { task },
                });
              } catch {}
            }}
            className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded border bg-gray-700 border-gray-600 hover:bg-gray-600"
            title="View Task"
          >
            View
          </button>
        );
      })()}

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
  const dockviewApi = useContext(DockviewApiContext);
  const [previewOpen, setPreviewOpen] = useState(false);
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
      <div className="px-2 py-1 text-xs border-b border-gray-700 bg-gray-800/80 flex items-center justify-between pr-10">
        <span className="font-semibold truncate" title={environment?.name}>{environment?.name || 'Environment'}</span>
        <span className="text-[10px] opacity-80">{taskCount ?? 0} tasks</span>
      </div>
      {/* View Environment (top-right) */}
      {(() => {
        const mode = data?.openMode || 'normal';
        if (mode === 'preview') {
          return (
            <Popover open={previewOpen} onOpenChange={setPreviewOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
                  className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded border bg-gray-700 border-gray-600 hover:bg-gray-700"
                  title="View Environment"
                >
                  View
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700" side="left" align="center">
                <div className="h-full">
                  <DockviewApiContext.Provider value={dockviewApi}>
                    <EnvironmentPanel 
                      params={{ environment }}
                      api={{ 
                        id: 'popover-env-panel',
                        title: `${environment?.name || 'Environment'} - Environment`,
                        group: { location: { type: 'popover' } },
                        onPanelOpen: () => setPreviewOpen(false)
                      }}
                    />
                  </DockviewApiContext.Provider>
                </div>
              </PopoverContent>
            </Popover>
          );
        }
        // pinned / normal: open corresponding docked panels only
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!dockviewApi || !environment) return;
              try {
                if (mode === 'pinned') {
                  dockviewApi.addPanel({
                    id: `pinned_environment_panel`,
                    component: 'EnvironmentPanel',
                    title: 'Pinned Environment',
                    params: { environment, isPinned: true },
                  });
                } else {
                  dockviewApi.addPanel({
                    id: `general_environment_panel`,
                    component: 'EnvironmentPanel',
                    title: 'Environment Panel',
                    params: { environment },
                  });
                }
              } catch {}
            }}
            className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded border bg-gray-700 border-gray-600 hover:bg-gray-700"
            title="View Environment"
          >
            View
          </button>
        );
      })()}
      {/* Children task nodes render inside */}
    </div>
  );
};

// Step Node Component (child of task)
const StepNode = ({ id, data, selected }) => {
  const { label, status, parentTaskId, isInitial } = data || {};
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);

  const parentTask = tasks.find((t) => t.id === parentTaskId);

  const handleCreateTaskFromStep = (e) => {
    e.stopPropagation();
    if (!parentTask) return;
    const newTaskId = `task_from_step_${Date.now()}`;
    addTask({ id: newTaskId, name: `${label || 'Step'} → Task`, status: 'pending', priority: 'low', environmentId: parentTask.environmentId });
    if (data?.onAfterCreateTaskFromStep) {
      try { data.onAfterCreateTaskFromStep(id, newTaskId); } catch {}
    }
  };
  return (
    <div className={`relative rounded-md border ${selected ? 'border-blue-400' : 'border-gray-600'} bg-gray-700 text-white px-2 py-2 w-full h-full`}> 
      <div className="text-[11px] font-medium truncate" title={label}>{label || 'Step'}</div>
      {!isInitial && status && (
        <div className="mt-1 text-[10px] opacity-80">{status}</div>
      )}
      {/* Handles for connecting steps (no left handle). Initial step only has bottom source. */}
      {!isInitial && <Handle type="target" position={Position.Top} />}
      <Handle type="source" position={Position.Bottom} />
      {/* Branch handle on the right for non-initial steps */}
      {!isInitial && <Handle type="source" id="branch" position={Position.Right} />}
      {/* Action: create task from step */}
      <button
        onClick={handleCreateTaskFromStep}
        className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-[10px] px-1 py-0.5 rounded border bg-gray-800 border-gray-600 hover:bg-gray-700"
        title="Create Task from Step"
      >
        ➕
      </button>
    </div>
  );
};

const nodeTypes = { taskNode: TaskNode, environmentNode: EnvironmentNode, stepNode: StepNode };

// const generateInitialPositions = (tasks) => { /* no longer used */ };

const TaskFlowPanel = () => {
  const tasks = useAppStore((s) => s.tasks);
  const environments = useAppStore((s) => s.environments);

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
      let stepNodes = existing.filter((n) => n.type === 'stepNode' && existingTaskIds.has(n.parentId));

      // Ensure each task has an initial step node
      const haveInitialByTask = new Set(stepNodes.filter((n) => n.data?.isInitial).map((n) => n.parentId));
      const missingInitialFor = tasks.filter((t) => !haveInitialByTask.has(t.id));
      const initialNodes = missingInitialFor.map((t) => ({
        id: `step_init_${t.id}`,
        type: 'stepNode',
        parentId: t.id,
        extent: 'parent',
        position: { x: 16, y: 24 },
        style: { width: 180, height: 56 },
        data: { label: 'Initial Step', status: 'instruction', parentTaskId: t.id, isInitial: true },
      }));
      stepNodes = [...stepNodes, ...initialNodes];

      // Inject callbacks and current open mode into task node data
      const taskNodesWithActions = taskNodes.map((n) => ({ ...n, data: { ...n.data, openMode,
        onAddStep: (taskId) => {
        const newStepId = `step_${taskId}_${Date.now()}`;
        let prevId = null;
        setNodes((nds) => {
          const stepsForTask = nds.filter((x) => x.type === 'stepNode' && x.parentId === taskId);
          // Determine previous step: highest y among existing steps (includes initial)
          if (stepsForTask.length) {
            const last = stepsForTask.slice().sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0))[stepsForTask.length - 1];
            prevId = last.id;
          } else {
            prevId = `step_init_${taskId}`;
          }

          // Exclude initial for grid counting
          const nonInitial = stepsForTask.filter((s) => !s.data?.isInitial);
          const idx = nonInitial.length;
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const newStep = {
            id: newStepId,
            type: 'stepNode',
            parentId: taskId,
            extent: 'parent',
            position: { x: 16 + col * 120, y: 120 + row * 80 },
            style: { width: 108, height: 56 },
            data: { label: `Step ${idx + 1}`, status: 'pending', parentTaskId: taskId },
          };
          return [...nds, newStep];
        });
        // Connect previous step -> new step without referencing outer nodes state
        setEdges((eds) => {
          const sourceId = prevId || `step_init_${taskId}`;
          const edgeId = `e_${sourceId}_${Date.now()}`;
          return addEdge({ id: edgeId, source: sourceId, target: newStepId }, eds);
        });
        },
        onAfterCreateTaskFromStep: (sourceStepId, newTaskId) => {
          setEdges((eds) => addEdge({ id: `e_branch_${sourceStepId}_${newTaskId}`, source: sourceStepId, target: newTaskId, label: 'branch' }, eds));
        }
      } }));

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

  // const handleAddTask = () => { /* optional control removed in minimal header */ };

  // const [ready, setReady] = useState(false);

  // useEffect(() => { /* deferred mount not needed in simplified render */ }, []);

  const [openMode, setOpenMode] = useState('normal'); // 'normal' | 'preview' | 'pinned'

  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      {/* Top bar */}
      <div className="px-2 py-1 border-b border-gray-700 bg-gray-900 flex items-center gap-2 text-xs">
        <button
          className={`px-2 py-0.5 rounded border ${openMode === 'pinned' ? 'bg-gray-700 border-gray-600' : 'bg-transparent border-gray-700 hover:bg-gray-800'}`}
          onClick={() => setOpenMode('pinned')}
        >
          Open in Pinned
        </button>
        <button
          className={`px-2 py-0.5 rounded border ${openMode === 'preview' ? 'bg-gray-700 border-gray-600' : 'bg-transparent border-gray-700 hover:bg-gray-800'}`}
          onClick={() => setOpenMode('preview')}
        >
          Open in Preview
        </button>
        <button
          className={`px-2 py-0.5 rounded border ${openMode === 'normal' ? 'bg-gray-700 border-gray-600' : 'bg-transparent border-gray-700 hover:bg-gray-800'}`}
          onClick={() => setOpenMode('normal')}
        >
          Open in Normal
        </button>
      </div>
      <ReactFlowProvider>
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          defaultEdgeOptions={{ zIndex: 1 }}
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


