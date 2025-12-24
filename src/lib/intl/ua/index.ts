// Barrel export combining all Ukrainian translation chunks
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
import { contentPages } from './content-pages';
import { blog } from './blog';
import type en from '../en';

// Combine all chunks into single translation object
// Using 'satisfies' ensures TypeScript will error if keys don't match English
export const uk = {
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
  ...contentPages,
  ...blog,
} satisfies typeof en;

export default uk;
