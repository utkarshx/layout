import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItemWithSetTask from './extensions/TaskItemWithSetTask';
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
    extensions: [StarterKit, TaskList, TaskItemWithSetTask],
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
          <h4 className="m-0 font-semibold">Todo</h4>
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
        }

        .todo-editor ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
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
      `}</style>
    </div>
  );
};

export default TodoPanel;