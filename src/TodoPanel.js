import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import FloatingElement from './components/tiptap-ui-utils/floating-element';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItemWithPlus from './extensions/TaskItemWithPlus';
import { Button } from './components/ui/button';
import { CheckSquare } from 'lucide-react';
import Highlight from '@tiptap/extension-highlight';

const INITIAL_CONTENT = `<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p>What is this code about</p></li>
  <li data-type="taskItem" data-checked="false"><p>What are the main components of the app</p></li>
  <li data-type="taskItem" data-checked="false"><p>Create a screen for admin login</p></li>
</ul>`;

const TodoPanel = () => {
  const [content, setContent] = useState(INITIAL_CONTENT);

  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItemWithPlus, Highlight],
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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Structure/blocks */}
            <Button
              onClick={() => editor.chain().focus().setParagraph().run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('paragraph') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Normal text"
            >
              Normal
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Heading 1"
            >
              H1
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Heading 2"
            >
              H2
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Heading 3"
            >
              H3
            </Button>

            <div className="w-px h-6 bg-gray-700 mx-1" />

            {/* Inline formatting */}
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('bold') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Bold"
            >
              Bold
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('italic') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Italic"
            >
              Italic
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('strike') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Strikethrough"
            >
              Strike
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('highlight') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Highlight"
            >
              Highlight
            </Button>

            <div className="w-px h-6 bg-gray-700 mx-1" />

            {/* Code block */}
            <Button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              variant="outline"
              size="xs"
              className={`${editor.isActive('codeBlock') ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
              aria-label="Code block"
            >
              Code Block
            </Button>

            <div className="w-px h-6 bg-gray-700 mx-1" />

            {/* Task list */}
            <Button
              onClick={toggleTaskList}
              variant="outline"
              size="xs"
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
          <FloatingElement editor={editor} floatingOptions={{ placement: 'top', offset: 36 }}>
            <div className="todo-bubble-fixed">
              <Button
                size="sm"
                className="text-white px-2 py-1 text-xs"
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
                className="text-white px-2 py-1 text-xs ml-2"
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
          margin: 0;
        }

        .todo-editor ul[data-type="taskList"] p {
          margin: 0;
        }

        .todo-editor ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          line-height: 1.5;
          padding: 0.125rem 0;
        }

        .todo-editor ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin: 0;
          user-select: none;
          display: inline-flex;
          align-items: center;
        }

        .todo-editor .ti-task-item {
          position: relative;
        }

        .todo-editor .ti-plus {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 1.25rem;
          padding: 0 0.5rem;
          border-radius: 4px;
          border: 1px solid #4b5563;
          color: #e5e7eb;
          background: #1f2937;
          white-space: nowrap;
          cursor: pointer;
        }

        .todo-editor .ti-plus:hover {
          color: #e5e7eb;
          border-color: #9ca3af;
          background: #374151;
        }

        .todo-editor .ti-checkbox {
          display: flex;
          align-items: center;
        }

        .todo-editor .ti-content {
          flex: 1 1 auto;
          display: block;
        }

        .todo-editor .ti-adder {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          pointer-events: auto;
          align-items: center;
          flex-wrap: wrap;
          max-width: 22rem;
        }

        .todo-editor .ti-adder-input {
          background: #374151;
          color: #e5e7eb;
          border: 1px solid #4b5563;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          min-width: 12rem;
          width: 12rem;
          max-width: 100%;
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
          right: 0;
          left: auto;
          top: calc(100% + 0.25rem);
          transform: translate(0, 0);
          background: #111827;
          border: 1px solid #374151;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          max-width: min(22rem, 90vw);
          overflow: hidden;
          pointer-events: auto;
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