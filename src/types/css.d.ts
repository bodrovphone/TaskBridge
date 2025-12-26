// Type declarations for CSS module imports
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Specific CSS import paths for dynamic imports
declare module 'react-datepicker/dist/react-datepicker.css'
declare module '@/app/nprogress.css'
