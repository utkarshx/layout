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
import { Select, SelectItem } from './components/ui/select';
import useAppStore from './store/useAppStore';
import {
  SquareArrowOutUpRight,
  Plus,
  Info,
  CheckSquare,
  GitBranch,
  Terminal,
  FileText,
  BarChart3,
  Pin
} from 'lucide-react';


const EnvironmentPanel = (props) => {
  const { params, api } = props;
  const { environment: initialEnvironment, isPinned } = params || {};
  const { onTaskSelect, openGeneralPanel, openPinnedPanel } = api || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  // Get store data and actions
  const { 
    environments, 
    pinnedEnvironment, 
    setPinnedEnvironment, 
    clearPinnedEnvironment 
  } = useAppStore();
  
  // State for current environment (can be different from initial if this is a general panel)
  const [currentEnvironment, setCurrentEnvironment] = useState(
    isPinned ? pinnedEnvironment : initialEnvironment
  );
  
  // Use current environment or fallback to initial
  const environment = currentEnvironment || initialEnvironment;
  
  // Update current environment when pinnedEnvironment changes (for pinned panels)
  useEffect(() => {
    if (isPinned && pinnedEnvironment) {
      setCurrentEnvironment(pinnedEnvironment);
    }
  }, [isPinned, pinnedEnvironment]);
  
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

  // State for Add Tool dropdown
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);

  // Refs and effects for dropdown
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddToolOpen(false);
      }
    };

    if (isAddToolOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAddToolOpen]);

  // Left Header Actions Component for Dockview - matches group height
  const LeftHeaderActionsComponent = useCallback((props) => (
    <div className="flex items-center h-full relative" ref={dropdownRef}>
      <button
        className="h-full px-3 bg-transparent hover:bg-gray-700/50 border-none text-gray-300 flex items-center gap-2 text-sm transition-colors cursor-pointer"
        style={{ 
          minHeight: '100%',
          borderRadius: '0',
          border: 'none',
          background: 'transparent'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Add Tool button clicked, current state:', isAddToolOpen);
          setIsAddToolOpen(!isAddToolOpen);
        }}
      >
        <Plus className="h-4 w-4" />
        <span>Add Tool</span>
      </button>
      
      {isAddToolOpen && (
        <div 
          className="absolute top-full left-0 w-56 p-2 bg-gray-800 border border-gray-600 rounded shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <div className="space-y-1">
            <h5 className="text-sm font-medium text-white mb-2">Add Panel</h5>
            {availablePanels
              .filter(panel => !activePanels.has(panel.id))
              .map((panel) => {
                const IconComponent = panel.icon;
                return (
                  <button
                    key={panel.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Panel selected:', panel.title);
                      addPanel(panel);
                      setIsAddToolOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 text-left text-sm text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <IconComponent className="h-4 w-4 text-gray-400" />
                    <span>{panel.title}</span>
                  </button>
                );
              })}
            {availablePanels.filter(panel => !activePanels.has(panel.id)).length === 0 && (
              <div className="text-sm text-gray-400 p-2 text-center">
                All panels are already active
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ), [availablePanels, activePanels, addPanel, isAddToolOpen, setIsAddToolOpen]);

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
  
  // Pin/unpin handlers
  const handlePinEnvironment = () => {
    if (environment) {
      setPinnedEnvironment(environment);
    }
  };
  
  const handleUnpinEnvironment = () => {
    clearPinnedEnvironment();
  };
  
  const handleEnvironmentChange = (selectedEnvId) => {
    const selectedEnv = environments.find(env => env.id === selectedEnvId);
    if (selectedEnv) {
      setCurrentEnvironment(selectedEnv);
    }
  };
  
  // Check if current environment is pinned
  const isCurrentlyPinned = pinnedEnvironment && environment && pinnedEnvironment.id === environment.id;

  return (
    <div className="text-white h-full overflow-hidden">
      <div className="p-2.5 border-b border-gray-700 bg-black flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          <h4 className="m-0 text-sm font-medium pr-2">
            {isPinned ? 'Pinned Env' : 'Env: '}
          </h4>
          
          {/* Environment Dropdown - only show if not pinned or not opened from popover */}
          {!isPinned && !isOpenedFromPopover && (
            <Select
              value={environment?.id || ''}
              onValueChange={handleEnvironmentChange}
              className="h-7 min-h-0 py-0 text-sm"
            >
              {environments.map((env) => (
                <SelectItem
                  key={env.id}
                  value={env.id}
                  className="h-7 min-h-0 py-0 text-sm"
                >
                  {env.name}
                </SelectItem>
              ))}
            </Select>
          )}
          
          {/* Show current environment name if pinned */}
          {isPinned && environment && (
            <span className="text-sm text-gray-300">
              {environment.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Pin/Unpin button - only show if not opened from popover */}
          {/* {!isOpenedFromPopover && environment && (
            <Button
              onClick={isCurrentlyPinned ? handleUnpinEnvironment : handlePinEnvironment}
              className="h-6 w-6 p-0 flex-shrink-0"
              title={isCurrentlyPinned ? "Unpin environment" : "Pin environment"}
              variant={isCurrentlyPinned ? "default" : "outline"}
            >
              {isCurrentlyPinned ? (
                <PinOff className="h-3 w-3" />
              ) : (
                <Pin className="h-3 w-3" />
              )}
            </Button>
          )} */}
          
          {/* Open Environment Panel button (if opened from popover) */}
          {isOpenedFromPopover && openGeneralPanel && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openGeneralPanel();
              }}
              className="h-6 w-6 p-0 flex-shrink-0"
              title="Open Environment Panel"
              variant="outline"
            >
              <SquareArrowOutUpRight className="h-3 w-3" />
            </Button>
          )}
          
          {/* Open Pinned Panel button (if opened from popover) */}
          {isOpenedFromPopover && openPinnedPanel && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openPinnedPanel();
              }}
              className="h-6 w-6 p-0 flex-shrink-0"
              title="Open Pinned Panel"
              variant="outline"
            >
              <Pin className="h-3 w-3" />
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
