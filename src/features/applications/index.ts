/**
 * Applications Feature - Barrel Exports
 *
 * Professional view of their submitted applications
 */

// Types
export type {
  MyApplication,
  ApplicationStatus,
  SortOption,
  FilterOption
} from './lib/types'

// Mock Data
export {
  mockMyApplications,
  getApplicationsByStatus,
  getApplicationById,
  getApplicationStats
} from './lib/my-applications-data'

// Components
export { default as MyApplicationsList } from './components/my-applications-list'
export { default as MyApplicationCard } from './components/my-application-card'
export { default as ApplicationDetailView } from './components/application-detail-view'
export { default as WithdrawDialog } from './components/withdraw-dialog'
