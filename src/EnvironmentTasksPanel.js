import React, { useState } from 'react';

const EnvironmentTasksPanel = (props) => {
  const { params, onTaskSelect } = props;
  const { environment } = params || {};
  
  // Selected task for split view
  const [selectedTask, setSelectedTask] = useState(null);


  const environmentTasks = [
    { id: 'env_task_1', name: 'Initialize Environment', status: 'Completed', priority: 'High' },
    { id: 'env_task_2', name: 'Configure Services', status: 'In Progress', priority: 'High' },
    { id: 'env_task_3', name: 'Run Tests', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_4', name: 'Deploy Changes', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_5', name: 'Monitor Performance', status: 'Pending', priority: 'Low' },
  ];




  return (
    <div className="p-4 text-white h-full overflow-y-auto bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">
        {environment ? `${environment.name} - Tasks` : 'Environment Tasks'}
      </h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium">Task List</h4>
          <div className="text-xs text-gray-400">
            {environmentTasks.length} tasks
          </div>
        </div>
        
        <div className="space-y-2">
          {environmentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                setSelectedTask(task);
                if (onTaskSelect) {
                  onTaskSelect(task);
                }
              }}
              className={`p-3 cursor-pointer transition-colors ${
                selectedTask?.id === task.id 
                  ? 'bg-gray-700 border-l-4 border-gray-400' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm">{task.name}</div>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-gray-600 text-gray-200 border border-gray-500">
                    {task.priority}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-500">
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      

    </div>
  );
};

export default EnvironmentTasksPanel;