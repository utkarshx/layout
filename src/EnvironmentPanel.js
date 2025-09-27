import React, { useMemo, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-core/dist/styles/dockview.css';

import EnvironmentTasksPanel from './EnvironmentTasksPanel';
import EnvironmentDiffPanel from './EnvironmentDiffPanel';
import EnvironmentInfoPanel from './EnvironmentInfoPanel';
import EnvironmentTerminalPanel from './EnvironmentTerminalPanel';
import EnvironmentLogsPanel from './EnvironmentLogsPanel';
import EnvironmentMetricsPanel from './EnvironmentMetricsPanel';

import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import {
  SquareArrowOutUpRight,
  Plus,
  X,
  Info,
  CheckSquare,
  GitBranch,
  Terminal,
  FileText,
  BarChart3
} from 'lucide-react';


const EnvironmentPanel = (props) => {
  const { params, api } = props;
  const { environment } = params || {};
  const { onTaskSelect } = api || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  // State for managing nested panels
  const [nestedDockviewApi, setNestedDockviewApi] = useState(null);
  const [activePanels, setActivePanels] = useState(new Set(['info_panel', 'tasks_panel', 'diff_panel']));
  
  console.log('EnvironmentPanel props:', props);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  // Available panel types with Lucide icons - memoized to prevent re-renders
  const availablePanels = useMemo(() => [
    { id: 'info_panel', component: 'EnvironmentInfoPanel', title: 'Info', icon: Info },
    { id: 'tasks_panel', component: 'EnvironmentTasksPanel', title: 'Tasks', icon: CheckSquare },
    { id: 'diff_panel', component: 'EnvironmentDiffPanel', title: 'Diff', icon: GitBranch },
    { id: 'terminal_panel', component: 'EnvironmentTerminalPanel', title: 'Terminal', icon: Terminal },
    { id: 'logs_panel', component: 'EnvironmentLogsPanel', title: 'Logs', icon: FileText },
    { id: 'metrics_panel', component: 'EnvironmentMetricsPanel', title: 'Metrics', icon: BarChart3 },
  ], []);

  // Function to add a new panel - defined early with useCallback
  const addPanel = useCallback((panelConfig) => {
    if (!nestedDockviewApi || activePanels.has(panelConfig.id)) return;

    try {
      // Add the new panel to the dockview
      nestedDockviewApi.addPanel({
        id: panelConfig.id,
        component: panelConfig.component,
        title: panelConfig.title,
        params: { environment: environment }
      });
      
      setActivePanels(prev => new Set([...prev, panelConfig.id]));
      
      // Move focus to the newly added panel
      setTimeout(() => {
        nestedDockviewApi.getPanel(panelConfig.id)?.api?.setActive();
      }, 100);
      
      console.log(`Added panel: ${panelConfig.title}`);
    } catch (error) {
      console.error('Error adding panel:', error);
    }
  }, [nestedDockviewApi, activePanels, environment]);

  // shadcn Select dropdown handler
  const handleAddPanel = useCallback((selectedPanelId) => {
    if (!selectedPanelId) return;
    
    const panelConfig = availablePanels.find(panel => panel.id === selectedPanelId);
    if (panelConfig) {
      addPanel(panelConfig);
    }
  }, [availablePanels, addPanel]);

  // Left Header Actions Component for Dockview - shadcn Select
  const LeftHeaderActionsComponent = useCallback((props) => {
    const availableOptions = availablePanels.filter(panel => !activePanels.has(panel.id));
    
    return (
      <div className="flex items-center h-full">
        <div className="flex items-center gap-2 px-3 h-full">
          <Plus className="h-4 w-4 text-gray-300" />
          <Select onValueChange={handleAddPanel}>
            <SelectTrigger className="w-[140px] h-8 bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700">
              <SelectValue placeholder="Add Tool" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {availableOptions.map((panel) => {
                const IconComponent = panel.icon;
                return (
                  <SelectItem 
                    key={panel.id} 
                    value={panel.id}
                    className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{panel.title}</span>
                    </div>
                  </SelectItem>
                );
              })}
              {availableOptions.length === 0 && (
                <SelectItem value="no-options" disabled className="text-gray-500">
                  All panels are active
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }, [availablePanels, activePanels, handleAddPanel]);

  const nestedComponents = useMemo(() => ({
    EnvironmentTasksPanel: (props) => <EnvironmentTasksPanel {...props} onTaskSelect={onTaskSelect} />,
    EnvironmentDiffPanel: (props) => <EnvironmentDiffPanel {...props} />,
    EnvironmentInfoPanel: (props) => <EnvironmentInfoPanel {...props} />,
    EnvironmentTerminalPanel: (props) => <EnvironmentTerminalPanel {...props} />,
    EnvironmentLogsPanel: (props) => <EnvironmentLogsPanel {...props} />,
    EnvironmentMetricsPanel: (props) => <EnvironmentMetricsPanel {...props} />,
  }), [onTaskSelect]);

  const onNestedReady = (event) => {
    const { api } = event;
    console.log('Nested dockview API ready:', api);
    setNestedDockviewApi(api);

    try {
      // Add the default panels to the nested dockview
      api.addPanel({
        id: 'info_panel',
        component: 'EnvironmentInfoPanel',
        title: 'Info',
        params: { environment: environment }
      });
      api.addPanel({
        id: 'tasks_panel',
        component: 'EnvironmentTasksPanel',
        title: 'Tasks',
        params: { environment: environment }
      });

      api.addPanel({
        id: 'diff_panel',
        component: 'EnvironmentDiffPanel',
        title: 'Diff',
        position: { direction: 'bottom', referencePanel: 'info_panel' },
        params: { environment: environment }
      });

      console.log('Nested panels added successfully');
    } catch (error) {
      console.error('Error adding nested panels:', error);
    }
  };


  // Function to remove a panel
  const removePanel = useCallback((panelId) => {
    if (!nestedDockviewApi || !activePanels.has(panelId)) return;

    try {
      nestedDockviewApi.removePanel(panelId);
      setActivePanels(prev => {
        const newSet = new Set(prev);
        newSet.delete(panelId);
        return newSet;
      });
      console.log(`Removed panel: ${panelId}`);
    } catch (error) {
      console.error('Error removing panel:', error);
    }
  }, [nestedDockviewApi, activePanels]);

  const openEnvironmentInNewPanel = (env) => {
    console.log('openEnvironmentInNewPanel called:', env);
    console.log('dockviewApi available:', !!dockviewApi);
    
    if (dockviewApi) {
      const panelId = `environment_panel_${env.id}`;
      console.log('Attempting to add panel:', panelId);
      
      try {
        dockviewApi.addPanel({
          id: panelId,
          component: 'EnvironmentPanel',
          title: env.name,
          params: { environment: env },
          position: { referencePanel: 'left_panel', direction: 'right' },
        });
        console.log('Panel added successfully');
      } catch (error) {
        console.error('Error adding panel:', error);
      }
    } else {
      console.error('No dockview API available');
    }
  };

  // Check if this panel is opened from a popover
  const isOpenedFromPopover = api?.group?.location?.type === 'popover';

  return (
    <div className="text-white h-full overflow-hidden">
      <div className="p-2.5 border-b border-gray-700 bg-black flex justify-between items-center">
        <h4 className="m-0">
          {environment ? `${environment.name} - Environment Details` : 'Environment Details'}
        </h4>
        <div className="flex items-center gap-2">
          {/* Open in new panel button (if opened from popover) */}
          {isOpenedFromPopover && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openEnvironmentInNewPanel(environment);
                // Call onPanelOpen callback if provided (for popover closing)
                if (api?.onPanelOpen) {
                  api.onPanelOpen();
                }
              }}
              className="h-6 w-6 p-0 flex-shrink-0"
              title="Open in new panel"
            >
              <SquareArrowOutUpRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="h-[calc(100%-50px)]">
        <DockviewReact
          components={nestedComponents}
          onReady={onNestedReady}
          className="dockview-theme-dark"
          style={{ height: '100%' }}
          leftHeaderActionsComponent={LeftHeaderActionsComponent}
        />
      </div>
    </div>
  );
};

export default EnvironmentPanel;
