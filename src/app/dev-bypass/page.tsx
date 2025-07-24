'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DevBypassPage() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect to dashboard - this bypasses auth for development
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Bypassing authentication for development...</p>
        <p className="text-sm text-gray-500 mt-2">This route will be removed in production</p>
      </div>
    </div>
  )
}