import type { ModuleManifest } from '../../core/registry/types';
import { IconTasks } from '../../lib/icons';
import { TasksView, tasksDigest } from './TasksView';

export const tasksModule: ModuleManifest = {
  id: 'tasks',
  label: 'Tasks',
  icon: IconTasks,
  view: TasksView,
  digest: tasksDigest,
};
