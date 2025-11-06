import { Spinner } from '@nextui-org/react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}
