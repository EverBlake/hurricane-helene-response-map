// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import AddLocationForm from '../components/AddLocationForm'

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>
})

interface Location {
  id: number
  name: string
  address: string
  organization: string
  category: 'volunteer' | 'search' | 'recovery'
  description: string
  needs: string
  providing: string
  lat: number
  lon: number
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    console.log('Locations state updated:', locations)
  }, [locations])

  async function fetchLocations() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('relief_locations')
        .select('*')
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched locations:', data)
      if (data && data.length > 0) {
        console.log('First location:', data[0])
      } else {
        console.log('No locations found in the database')
      }
      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      setError('Failed to fetch locations. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLocationClick = () => {
    if (session) {
      setIsFormOpen(true)
    } else {
      setIsSignInOpen(true)
    }
  }

  return (
    <div className="relative h-screen">
      {isLoading ? (
        <p>Loading locations...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <MapComponent locations={locations} />
      )}
      <button
        onClick={handleAddLocationClick}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
      >
        Add Location
      </button>
      {session && isFormOpen && (
        <AddLocationForm setIsFormOpen={setIsFormOpen} fetchLocations={fetchLocations} />
      )}
      {!session && isSignInOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-md m-4 shadow-xl relative">
            <button
              onClick={() => setIsSignInOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
              providers={[]}
              view="sign_in"
            />
          </div>
        </div>
      )}
    </div>
  )
}