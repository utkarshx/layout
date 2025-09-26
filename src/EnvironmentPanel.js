import React, { useMemo, useContext } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-core/dist/styles/dockview.css';
import { DockviewApiContext } from './App';
import EnvironmentTasksPanel from './EnvironmentTasksPanel';
import EnvironmentDiffPanel from './EnvironmentDiffPanel';
import EnvironmentInfoPanel from './EnvironmentInfoPanel';

const EnvironmentPanel = (props) => {
  const { params, api } = props;
  const { environment } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  console.log('EnvironmentPanel props:', props);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  const nestedComponents = useMemo(() => ({
    EnvironmentTasksPanel: (props) => <EnvironmentTasksPanel {...props} />,
    EnvironmentDiffPanel: (props) => <EnvironmentDiffPanel {...props} />,
    EnvironmentInfoPanel: (props) => <EnvironmentInfoPanel {...props} />,
  }), []);

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

  return (
    <div className="text-white h-full overflow-hidden">
      <div className="p-2.5 border-b border-gray-700 bg-black">
        <h4 className="m-0">
          {environment ? `${environment.name} - Environment Details` : 'Environment Details'}
        </h4>
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
