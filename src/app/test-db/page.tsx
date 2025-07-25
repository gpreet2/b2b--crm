'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestDatabasePage() {
  const [dbStatus, setDbStatus] = useState<string>('Testing...')
  const [gyms, setGyms] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testDatabase()
  }, [])

  const testDatabase = async () => {
    const supabase = createClient()
    
    try {
      // Test 1: Basic connection by fetching gyms
      const { data: gymsData, error: gymsError } = await supabase
        .from('gyms')
        .select('id, name, created_at')
        .limit(5)

      if (gymsError) {
        throw gymsError
      }

      setGyms(gymsData || [])
      setDbStatus('✅ Database connection successful!')

      // Test 2: Check if we can query profiles table
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.warn('Profiles table query warning:', countError)
      } else {
        console.log(`Found ${count} profiles in database`)
      }

    } catch (err: any) {
      setError(err.message)
      setDbStatus('❌ Database connection failed')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <p className={`text-lg ${error ? 'text-danger' : 'text-success'}`}>
          {dbStatus}
        </p>
        {error && (
          <pre className="mt-4 p-4 bg-danger/10 rounded text-sm text-danger overflow-auto">
            {error}
          </pre>
        )}
      </div>

      {gyms.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Gyms in Database</h2>
          <div className="space-y-2">
            {gyms.map((gym) => (
              <div key={gym.id} className="p-3 bg-surface-light rounded">
                <p className="font-medium">{gym.name}</p>
                <p className="text-sm text-muted">
                  ID: {gym.id} | Created: {new Date(gym.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> This page tests database connectivity without authentication.
          RLS policies may affect what data is visible.
        </p>
      </div>
    </div>
  )
}