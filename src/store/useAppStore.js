import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useAppStore = create(
  devtools(
    (set, get) => ({
      // Environment data
      environments: [
        { id: 'env1', name: 'Local' },
        { id: 'env2', name: 'Docker 02 - (provider-docker)' },
        { id: 'env3', name: 'Docker 0212 - (provider-docker)' },
      ],

      // Task data
      tasks: [
        { id: 'task1', name: 'Setup Database', status: 'pending', priority: 'high', environmentId: 'env1' },
        { id: 'task2', name: 'Configure API', status: 'in-progress', priority: 'medium', environmentId: 'env2' },
        { id: 'task3', name: 'Deploy Application', status: 'completed', priority: 'low', environmentId: 'env1' },
      ],

      // UI State
      activeTab: 'environments',
      openPopovers: {},
      selectedTaskInEnv: {},
      taskSortBy: 'name',
      taskFilterBy: 'all',

      // Actions for environment management
      addEnvironment: (environment) =>
        set((state) => ({
          environments: [...state.environments, environment],
        }), false, 'addEnvironment'),

      updateEnvironment: (id, updates) =>
        set((state) => ({
          environments: state.environments.map((env) =>
            env.id === id ? { ...env, ...updates } : env
          ),
        }), false, 'updateEnvironment'),

      removeEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((env) => env.id !== id),
        }), false, 'removeEnvironment'),

      getEnvironmentById: (id) => {
        const state = get();
        return state.environments.find((env) => env.id === id);
      },

      // Actions for task management
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        }), false, 'addTask'),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }), false, 'updateTask'),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }), false, 'removeTask'),

      getFilteredAndSortedTasks: () => {
        const state = get();
        let filteredTasks = state.tasks;

        // Apply filter
        if (state.taskFilterBy !== 'all') {
          filteredTasks = state.tasks.filter((task) => task.status === state.taskFilterBy);
        }

        // Apply sort
        return filteredTasks.sort((a, b) => {
          switch (state.taskSortBy) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'status':
              return a.status.localeCompare(b.status);
            case 'priority':
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            default:
              return 0;
          }
        });
      },

      // Actions for UI state management
      setActiveTab: (tab) =>
        set(() => ({ activeTab: tab }), false, 'setActiveTab'),

      setPopoverOpen: (id, isOpen) =>
        set((state) => ({
          openPopovers: {
            ...state.openPopovers,
            [id]: isOpen,
          },
        }), false, 'setPopoverOpen'),

      setSelectedTaskInEnv: (envId, task) =>
        set((state) => ({
          selectedTaskInEnv: {
            ...state.selectedTaskInEnv,
            [envId]: task,
          },
        }), false, 'setSelectedTaskInEnv'),

      setTaskSortBy: (sortBy) =>
        set(() => ({ taskSortBy: sortBy }), false, 'setTaskSortBy'),

      setTaskFilterBy: (filterBy) =>
        set(() => ({ taskFilterBy: filterBy }), false, 'setTaskFilterBy'),

      // Reset actions
      resetUIState: () =>
        set(() => ({
          activeTab: 'environments',
          openPopovers: {},
          selectedTaskInEnv: {},
          taskSortBy: 'name',
          taskFilterBy: 'all',
        }), false, 'resetUIState'),
    }),
    {
      name: 'app-store', // unique name for devtools
    }
  )
);

export default useAppStore;

