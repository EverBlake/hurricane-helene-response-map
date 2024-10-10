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
  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    const { data, error } = await supabase
      .from('relief_locations')
      .select('*')
    if (error) console.error('Error fetching locations:', error)
    else setLocations(data || [])
  }

  return (
    <div className="relative h-screen">
      <MapComponent locations={locations} />
      {session ? (
        <>
          <button
            onClick={() => setIsFormOpen(true)}
            className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
          >
            Add Location
          </button>
          {isFormOpen && <AddLocationForm setIsFormOpen={setIsFormOpen} fetchLocations={fetchLocations} />}
        </>
      ) : (
        <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
          />
        </div>
      )}
    </div>
  )
}