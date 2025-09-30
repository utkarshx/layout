import TaskItem from '@tiptap/extension-task-item';
import React, { useEffect, useRef, useState } from 'react';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import useAppStore from '../store/useAppStore';
import { Select, SelectItem } from '../components/ui/select';

const TaskItemView = (props) => {
  const { node, updateAttributes, getPos } = props;
  const checked = !!node.attrs.checked;

  const [showAdder, setShowAdder] = useState(false);
  const [newText, setNewText] = useState('');
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  const environments = useAppStore((s) => s.environments);
  const addTaskToStore = useAppStore((s) => s.addTask);
  const linkTodoToTask = useAppStore((s) => s.linkTodoToTask);
  const getTaskById = useAppStore((s) => s.getTaskById);
  const defaultEnvId = environments?.[0]?.id || null;
  const [selectedEnvId, setSelectedEnvId] = useState(defaultEnvId);

  useEffect(() => {
    if (showAdder) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showAdder]);

  // Close popover on outside click
  const popoverRef = useRef(null);
  const addBtnRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState(null);
  useEffect(() => {
    if (!showAdder) return;
    const onDocDown = (e) => {
      const target = e.target;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (addBtnRef.current && addBtnRef.current.contains(target)) return;
      setShowAdder(false);
    };
    document.addEventListener('mousedown', onDocDown, true);
    return () => document.removeEventListener('mousedown', onDocDown, true);
  }, [showAdder]);

  // Clamp popover within viewport using fixed positioning
  useEffect(() => {
    if (!showAdder) return;
    const updatePosition = () => {
      const btn = addBtnRef.current;
      const pop = popoverRef.current;
      if (!btn || !pop) return;
      const br = btn.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 8;
      const popWidth = pop.offsetWidth || 320;
      const popHeight = pop.offsetHeight || 140;
      let left = Math.min(Math.max(br.right - popWidth, gap), vw - popWidth - gap);
      let top = Math.min(br.bottom + gap, vh - popHeight - gap);
      setPopoverStyle({ position: 'fixed', left: `${left}px`, top: `${top}px`, zIndex: 60 });
    };
    const id = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showAdder]);

  const addTaskBelow = () => {
    const text = newText.trim();
    if (!text) {
      setShowAdder(false);
      return;
    }

    // Do not insert a new editor task line; we are creating a global task for this todo item

    const newTask = {
      id: `task_${Date.now()}`,
      name: text,
      status: 'pending',
      priority: 'medium',
      environmentId: selectedEnvId || defaultEnvId,
    };
    try {
      addTaskToStore(newTask);
      // link this todo node to the task id using node position as a stable-ish id
      const nodeId = typeof getPos === 'function' ? String(getPos()) : `${Date.now()}`;
      linkTodoToTask(nodeId, newTask.id);
      // Persist the link on the node itself so it survives edits
      try { updateAttributes({ taskId: newTask.id }); } catch {}
    } catch {}

    setNewText('');
    setShowAdder(false);
  };

  return (
    <NodeViewWrapper as="li" data-type="taskItem" data-checked={checked ? 'true' : 'false'} className="ti-task-item">
      <label contentEditable={false} className="ti-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => updateAttributes({ checked: !checked })}
        />
      </label>
      <div className="ti-content">
        <NodeViewContent as="div" />
      </div>

      {/* If a task already exists for this todo, show View Task instead of add */}
      {(() => {
        const nodeId = typeof getPos === 'function' ? String(getPos()) : undefined;
        const taskId = node?.attrs?.taskId || (nodeId ? (useAppStore.getState().todoTaskMap?.[nodeId]) : null);
        const existing = taskId ? getTaskById(taskId) : null;
        if (existing) {
          return (
            <button
              type="button"
              className="ti-plus"
              contentEditable={false}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  // Open in preview mode using LeftPanel’s behavior: add pending chat or open panel could be done via store
                  // For preview, dispatch to open a TaskPanel popover via pendingTaskChats to reuse routing
                  useAppStore.getState().addPendingTaskChat(existing);
                } catch {}
              }}
              aria-label="View task"
              title="View task"
            >
              View Task
            </button>
          );
        }
        return null;
      })()}

      {!(() => {
        const nodeId = typeof getPos === 'function' ? String(getPos()) : undefined;
        const taskId = node?.attrs?.taskId || (nodeId ? (useAppStore.getState().todoTaskMap?.[nodeId]) : null);
        return !!taskId;
      })() && (
      <button
        type="button"
        className="ti-plus"
        contentEditable={false}
        ref={addBtnRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowAdder((s) => !s);
        }}
        aria-label="Add task"
        title="Add task"
      >
        {hovered ? '+ Add As Task' : '+'}
      </button>
      )}

      {showAdder && (
        <div className="ti-adder-popover" contentEditable={false} onClick={(e) => e.stopPropagation()} ref={popoverRef} style={popoverStyle || undefined}>
          <div className="ti-adder">
            <input
              ref={inputRef}
              className="ti-adder-input"
              placeholder="Task description"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTaskBelow();
                if (e.key === 'Escape') setShowAdder(false);
              }}
            />
            <Select value={selectedEnvId} onValueChange={setSelectedEnvId} style={{ minWidth: '10rem' }}>
              {environments?.map((env) => (
                <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
              ))}
            </Select>
            <button type="button" className="ti-adder-btn" onClick={addTaskBelow}>
              Add
            </button>
            <button type="button" className="ti-adder-btn ti-cancel" onClick={() => setShowAdder(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

const TaskItemWithPlus = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemView, { as: 'li' });
  },
});

export default TaskItemWithPlus;


