import React from 'react';
import { Button } from './components/ui/button';

const TaskDetailPanel = (props) => {
  const { params } = props;
  const { task, environment } = params || {};

  return (
    <div className="text-white h-full overflow-hidden">
      <div className="p-2.5 border-b border-gray-700 bg-black">
        <h4 className="m-0">Task Details</h4>
      </div>
      
      <div className="h-[calc(100%-50px)] p-5 overflow-y-auto">
        {environment && (
          <div className="bg-gray-900 p-2.5 rounded mb-5 border border-gray-800">
            <strong>Environment:</strong> {environment.name}
          </div>
        )}
        
        <div className="mb-5">
          <h3 className="mb-2.5">Task Details</h3>
          <p>This panel contains detailed information and controls for the selected task.</p>
          {task && (
            <div className="mt-3.75">
              <p><strong>Task Name:</strong> {task.name}</p>
              <p><strong>Status:</strong> <span className="text-orange-500">In Progress</span></p>
              <p><strong>Priority:</strong> High</p>
              <p><strong>Assigned to:</strong> John Doe</p>
              <p><strong>Created:</strong> 2024-01-15</p>
              <p><strong>Due Date:</strong> 2024-01-20</p>
            </div>
          )}
        </div>
        
        <div className="mb-5">
          <h4 className="mb-2">Actions</h4>
          <Button className="m-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer">
            Execute Task
          </Button>
          <Button className="m-1 bg-gray-600 hover:bg-gray-700 text-white rounded cursor-pointer">
            View Logs
          </Button>
        </div>
        
        <div>
          <h4 className="mb-2">Status</h4>
          <div className="bg-gray-800 p-2.5 rounded border border-gray-700">
            <div className="text-green-500">● Ready</div>
            <div className="text-xs text-gray-400 mt-1">
              Last executed: Never
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
