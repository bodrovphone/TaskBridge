// Barrel export combining all English translation chunks
import { common } from './common';
import { navigation } from './navigation';
import { landing } from './landing';
import { tasks } from './tasks';
import { professionals } from './professionals';
import { applications } from './applications';
import { profile } from './profile';
import { categories } from './categories';
import { auth } from './auth';
import { taskCompletion } from './task-completion';
import { notifications } from './notifications';

// Combine all chunks into single translation object
export const en = {
  ...common,
  ...navigation,
  ...landing,
  ...tasks,
  ...professionals,
  ...applications,
  ...profile,
  ...categories,
  ...auth,
  ...taskCompletion,
  ...notifications,
};

export default en;
