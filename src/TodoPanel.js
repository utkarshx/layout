import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import FloatingElement from './components/tiptap-ui-utils/floating-element';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItemWithPlus from './extensions/TaskItemWithPlus';
import { Button } from './components/ui/button';
import { CheckSquare } from 'lucide-react';

const INITIAL_CONTENT = `<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p>What is this code about</p></li>
  <li data-type="taskItem" data-checked="false"><p>What are the main components of the app</p></li>
  <li data-type="taskItem" data-checked="false"><p>Create a screen for admin login</p></li>
</ul>`;

const TodoPanel = () => {
  const [content, setContent] = useState(INITIAL_CONTENT);

  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItemWithPlus],
    content,
    editorProps: {
      attributes: {
        class: 'todo-editor focus:outline-none p-4 text-white',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const toggleTaskList = () => {
    editor?.chain().focus().toggleTaskList().run();
  };

  return (
    <div className="text-white h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-blue-400" />
          <h4 className="m-0 font-semibold">Specs</h4>
        </div>
      </div>

      {editor && (
        <div className="p-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleTaskList}
              variant="outline"
              size="sm"
              className={`${editor.isActive('taskList') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Task List
            </Button>
            <div className="text-xs text-gray-400 ml-auto">Type [ ] or [x] to create tasks</div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {editor && (
          <FloatingElement editor={editor}>
            <div className="todo-bubble-fixed">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const text = editor.state.doc.textBetween(from, to, ' ');
                  console.log('Add To Chat:', text);
                }}
              >
                Add To Chat
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs ml-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const text = editor.state.doc.textBetween(from, to, ' ');
                  if (!text) return;
                  editor.chain().focus().insertContent({
                    type: 'taskList',
                    content: [
                      {
                        type: 'taskItem',
                        attrs: { checked: false },
                        content: [
                          { type: 'paragraph', content: [{ type: 'text', text }] },
                        ],
                      },
                    ],
                  }).run();
                }}
              >
                Create Task
              </Button>
            </div>
          </FloatingElement>
        )}
        <EditorContent editor={editor} />
      </div>

      <style jsx>{`
        .todo-editor {
          outline: none;
          color: white;
        }

        .todo-editor ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }

        .todo-editor ul[data-type="taskList"] p {
          margin: 0;
        }

        .todo-editor ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
        }

        .todo-editor ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }

        .todo-editor .ti-task-item {
          position: relative;
        }

        .todo-editor .ti-plus {
          position: relative;
          margin-right: 0.4rem;
          width: 1rem;
          height: 1rem;
          line-height: 1rem;
          text-align: center;
          border-radius: 4px;
          border: 1px solid #4b5563;
          color: #9ca3af;
          background: transparent;
        }

        .todo-editor .ti-plus:hover {
          color: #e5e7eb;
          border-color: #9ca3af;
          background: #1f2937;
        }

        .todo-editor .ti-checkbox {
          display: flex;
          align-items: center;
        }

        .todo-editor .ti-content {
          flex: 1 1 auto;
        }

        .todo-editor .ti-adder {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
        }

        .todo-editor .ti-adder-input {
          background: #374151;
          color: #e5e7eb;
          border: 1px solid #4b5563;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          min-width: 12rem;
        }

        .todo-editor .ti-adder-btn {
          background: #374151;
          color: #e5e7eb;
          border: 1px solid #4b5563;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
        }

        .todo-editor .ti-adder-btn.ti-cancel {
          background: transparent;
        }

        .todo-editor .ti-adder-popover {
          position: absolute;
          z-index: 60;
          transform: translate(0, 0);
          margin-left: 1.75rem;
          margin-top: 0.25rem;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .todo-editor ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }

        .todo-editor ul[data-type="taskList"] input[type="checkbox"] {
          cursor: pointer;
        }

        .todo-editor ul[data-type="taskList"] li[data-checked="true"] > div {
          opacity: 0.6;
          text-decoration: line-through;
        }

        .todo-bubble-fixed {
          position: absolute;
          transform: translate(-50%, -100%);
          z-index: 50;
          display: flex;
          align-items: center;
          background: #111827;
          border: 1px solid #374151;
          padding: 0.25rem;
          border-radius: 0.375rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};

export default TodoPanel;