// Barrel export combining all Bulgarian translation chunks
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
import { reviews } from './reviews';
import { legal } from './legal';

// Combine all chunks into single translation object
export const bg = {
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
  ...reviews,
  ...legal,
};

export default bg;
