import React, { useContext, useEffect, useState } from 'react';
import { DockviewApiContext } from './App';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

const EnvironmentTasksPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  const [activeFloatingPanels, setActiveFloatingPanels] = useState([]);

  const environmentTasks = [
    { id: 'env_task_1', name: 'Initialize Environment', status: 'Completed', priority: 'High' },
    { id: 'env_task_2', name: 'Configure Services', status: 'In Progress', priority: 'High' },
    { id: 'env_task_3', name: 'Run Tests', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_4', name: 'Deploy Changes', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_5', name: 'Monitor Performance', status: 'Pending', priority: 'Low' },
  ];

  const openTaskPanel = (task) => {
    console.log('EnvironmentTasksPanel openTaskPanel called:', task);
    console.log('dockviewApi available:', !!dockviewApi);
    
    if (dockviewApi) {
      const panelId = `env_task_panel_${task.id}`;
      console.log('Attempting to add floating panel:', panelId);
      
      try {
        // Check if panel already exists and remove it
        const existingPanel = dockviewApi.getPanel(panelId);
        if (existingPanel) {
          existingPanel.api.close();
          setActiveFloatingPanels(prev => prev.filter(id => id !== panelId));
        }
        
        // First add the panel to the main dockview
        const panel = dockviewApi.addPanel({
          id: panelId,
          component: 'TaskPanel',
          title: task.name,
          params: { task: task, environment: environment },
        });
        
        // Get the current panel's position to calculate right-side placement
        const currentPanelElement = document.querySelector('[data-panel-id]');
        const panelRect = currentPanelElement?.getBoundingClientRect();
        
        // Position to the right of current panel with full height
        const x = panelRect ? panelRect.right + 10 : window.innerWidth - 720; // 10px gap, 700px width + some margin
        const y = 0; // Start from top
        const width = 700;
        const height = window.innerHeight; // Full height
        
        // Then convert it to a floating group
        dockviewApi.addFloatingGroup(panel, {
          width: width,
          height: height,
          x: x,
          y: y,
        });
        
        // Track this floating panel
        setActiveFloatingPanels(prev => [...prev, panelId]);
        
        console.log('Floating panel added successfully at position:', { x, y, width, height });
      } catch (error) {
        console.error('Error adding floating panel:', error);
      }
    } else {
      console.error('dockviewApi is not available');
    }
  };

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

  // Add click outside to close functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeFloatingPanels.length === 0) return;
      
      // Check if click is outside any floating panel
      const floatingPanels = document.querySelectorAll('.dockview-floating-group');
      let clickedInsidePanel = false;
      
      floatingPanels.forEach(panel => {
        if (panel.contains(event.target)) {
          clickedInsidePanel = true;
        }
      });
      
      // If clicked outside all floating panels, close them
      if (!clickedInsidePanel) {
        activeFloatingPanels.forEach(panelId => {
          const panel = dockviewApi?.getPanel(panelId);
          if (panel) {
            panel.api.close();
          }
        });
        setActiveFloatingPanels([]);
      }
    };
    
    // Add event listener with a small delay to avoid immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFloatingPanels, dockviewApi]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Close all floating panels when component unmounts
      activeFloatingPanels.forEach(panelId => {
        const panel = dockviewApi?.getPanel(panelId);
        if (panel) {
          panel.api.close();
        }
      });
    };
  }, [activeFloatingPanels, dockviewApi]);

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
              onClick={() => openTaskPanel(task)}
              className="p-3 bg-gray-800 rounded-md cursor-pointer border border-gray-600 transition-all duration-200 hover:bg-gray-700 hover:transform hover:-translate-y-0.5"
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
                Click to open floating task panel
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