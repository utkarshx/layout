import TaskItem from '@tiptap/extension-task-item';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState } from 'react';

const TaskItemNodeView = (props) => {
  const { node, updateAttributes, editor, getPos } = props;
  const checked = !!node.attrs.checked;
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState('');

  const toggleChecked = () => {
    updateAttributes({ checked: !checked });
  };

  const addTaskBelow = () => {
    const contentText = newTask.trim() || 'New task';
    const pos = typeof getPos === 'function' ? getPos() : null;
    const insertContent = {
      type: 'taskItem',
      attrs: { checked: false },
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: contentText }] },
      ],
    };
    if (pos != null) {
      editor
        .chain()
        .focus()
        .insertContentAt(pos + node.nodeSize, insertContent)
        .run();
    } else {
      editor.chain().focus().insertContent(insertContent).run();
    }
    setNewTask('');
    setIsOpen(false);
  };

  return (
    <NodeViewWrapper as="li" data-type="taskItem" data-checked={checked} className="custom-task-item">
      <label contentEditable={false}>
        <input
          type="checkbox"
          checked={checked}
          onChange={toggleChecked}
        />
      </label>
      <div className="content">
        <NodeViewContent as="div" />
      </div>

      <div className="set-task-wrap" contentEditable={false}>
        <button
          className="set-task-btn"
          title="Add task"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((v) => !v);
          }}
        >
          <span className="set-task-icon">＋</span>
          <span className="set-task-label">Add</span>
        </button>

        {isOpen && (
          <div className="set-task-popover">
            <input
              className="set-task-input"
              placeholder="Task title"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTaskBelow();
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
            />
            <button className="set-task-add" type="button" onClick={addTaskBelow}>Add</button>
          </div>
        )}
      </div>

      <style>{`
        .custom-task-item { display: flex; align-items: center; gap: 6px; }
        .custom-task-item .content { flex: 0 0 auto; display: inline; }
        .custom-task-item .content > div { display: inline; }
        .custom-task-item .content p { display: inline; margin: 0; }
        .set-task-wrap { position: relative; margin-left: 8px; }
        .set-task-btn { background: transparent; border: 0; color: #8b5cf6; cursor: pointer; padding: 0 2px; border-radius: 4px; }
        .set-task-icon { font-weight: 700; font-size: 14px; line-height: 1; }
        .set-task-label { display: none; font-size: 12px; padding: 2px 6px; color: #e5e7eb; }
        .set-task-btn:hover { background: #2a2f3a; }
        .set-task-btn:hover .set-task-icon { display: none; }
        .set-task-btn:hover .set-task-label { display: inline; }
        .set-task-popover { position: absolute; top: 120%; right: 0; background: #111827; border: 1px solid #374151; border-radius: 6px; padding: 8px; display: flex; gap: 6px; z-index: 30; }
        .set-task-input { background: #1f2937; border: 1px solid #374151; color: #e5e7eb; padding: 6px 8px; border-radius: 4px; }
        .set-task-add { background: #2563eb; color: white; border: 0; padding: 6px 10px; border-radius: 4px; cursor: pointer; }
      `}</style>
    </NodeViewWrapper>
  );
};

const TaskItemWithSetTask = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemNodeView);
  },
});

export default TaskItemWithSetTask;


