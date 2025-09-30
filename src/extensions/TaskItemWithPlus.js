import TaskItem from '@tiptap/extension-task-item';
import React, { useEffect, useRef, useState } from 'react';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';

const TaskItemView = (props) => {
  const { node, updateAttributes, getPos, editor } = props;
  const checked = !!node.attrs.checked;

  const [showAdder, setShowAdder] = useState(false);
  const [newText, setNewText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (showAdder) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showAdder]);

  const addTaskBelow = () => {
    const text = newText.trim();
    if (!text) {
      setShowAdder(false);
      return;
    }

    const pos = typeof getPos === 'function' ? getPos() : null;
    const insertPos = pos != null ? pos + node.nodeSize : editor.state.selection.to;

    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, {
        type: 'taskItem',
        attrs: { checked: false },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text }],
          },
        ],
      })
      .run();

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

      <button
        type="button"
        className="ti-plus"
        contentEditable={false}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowAdder((s) => !s);
        }}
        aria-label="Add task"
        title="Add task"
      >
        +
      </button>

      {showAdder && (
        <div className="ti-adder-popover" contentEditable={false}>
          <div className="ti-adder" onMouseDown={(e) => e.preventDefault()}>
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


