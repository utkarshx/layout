import React, { useMemo, useContext } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-core/dist/styles/dockview.css';

import EnvironmentTasksPanel from './EnvironmentTasksPanel';
import EnvironmentDiffPanel from './EnvironmentDiffPanel';
import EnvironmentInfoPanel from './EnvironmentInfoPanel';

import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';



const EnvironmentPanel = (props) => {
  const { params, api } = props;
  const { environment } = params || {};
  const { onTaskSelect } = api || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  console.log('EnvironmentPanel props:', props);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  const nestedComponents = useMemo(() => ({
    EnvironmentTasksPanel: (props) => <EnvironmentTasksPanel {...props} onTaskSelect={onTaskSelect} />,
    EnvironmentDiffPanel: (props) => <EnvironmentDiffPanel {...props} />,
    EnvironmentInfoPanel: (props) => <EnvironmentInfoPanel {...props} />,
  }), [onTaskSelect]);

  const onNestedReady = (event) => {
    const { api } = event;
    console.log('Nested dockview API ready:', api);

    try {
      // Add the three panels to the nested dockview
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
        params: { environment: environment }
      });

      api.addPanel({
        id: 'info_panel',
        component: 'EnvironmentInfoPanel',
        title: 'Info',
        params: { environment: environment }
      });

      console.log('Nested panels added successfully');
    } catch (error) {
      console.error('Error adding nested panels:', error);
    }
  };

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
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            title="Open in new panel"
          >
            <span>⊞</span>
          </Button>
        )}
      </div>
      
      <div className="h-[calc(100%-50px)]">
        <DockviewReact
          components={nestedComponents}
          onReady={onNestedReady}
          className="dockview-theme-dark"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

export default EnvironmentPanel;
