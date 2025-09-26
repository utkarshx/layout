import React, { useContext, useEffect, useState } from 'react';
import { DockviewApiContext } from './App';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import TaskPanel from './TaskPanel';

const EnvironmentTasksPanel = (props) => {
  const { params, onTaskSelect } = props;
  const { environment } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  // Popover state management
  const [openPopovers, setOpenPopovers] = useState({});
  
  // Selected task for split view
  const [selectedTask, setSelectedTask] = useState(null);

  // Popover management functions
  const setPopoverOpen = (id, isOpen) => {
    setOpenPopovers(prev => ({
      ...prev,
      [id]: isOpen
    }));
  };

  const environmentTasks = [
    { id: 'env_task_1', name: 'Initialize Environment', status: 'Completed', priority: 'High' },
    { id: 'env_task_2', name: 'Configure Services', status: 'In Progress', priority: 'High' },
    { id: 'env_task_3', name: 'Run Tests', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_4', name: 'Deploy Changes', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_5', name: 'Monitor Performance', status: 'Pending', priority: 'Low' },
  ];


  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Pending': return '#888';
      default: return '#888';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#f44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#888';
    }
  };


  return (
    <div className="p-5 text-white h-full overflow-y-auto">
      <h3 className="mb-5 mt-0 text-lg font-semibold">
        {environment ? `${environment.name} - Tasks` : 'Environment Tasks'}
      </h3>
      
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="m-0 text-base font-medium">Task List</h4>
          <div className="text-xs text-gray-400">
            {environmentTasks.length} tasks
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {environmentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                setSelectedTask(task);
                if (onTaskSelect) {
                  onTaskSelect(task);
                }
              }}
              className={`p-3 rounded-md cursor-pointer border transition-all duration-200 hover:transform hover:-translate-y-0.5 ${
                selectedTask?.id === task.id 
                  ? 'bg-blue-800 border-blue-500' 
                  : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-sm">{task.name}</div>
                <div className="flex gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${
                    task.priority === 'High' ? 'bg-red-500' : 
                    task.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${
                    task.status === 'Completed' ? 'bg-green-500' : 
                    task.status === 'In Progress' ? 'bg-orange-500' : 'bg-gray-500'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Click to view task details on the right
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="mb-2.5 text-base font-medium">Task Statistics</h4>
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="bg-gray-900 border-gray-700 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">1</div>
              <div className="text-xs text-gray-400">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">1</div>
              <div className="text-xs text-gray-400">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-500">3</div>
              <div className="text-xs text-gray-400">Pending</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentTasksPanel;