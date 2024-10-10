'use client'

import { useState, useRef, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface AddLocationFormProps {
  setIsFormOpen: (isOpen: boolean) => void
  fetchLocations: () => void
}

export default function AddLocationForm({ setIsFormOpen, fetchLocations }: AddLocationFormProps) {
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    organization: '',
    category: 'volunteer' as 'volunteer' | 'search' | 'recovery',
    description: '',
    needs: '',
    providing: '',
    lat: 0,
    lon: 0
  })
  const supabase = useSupabaseClient()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (window.google && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ['address'] }
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.geometry?.location) {
          setNewLocation(prev => ({
            ...prev,
            address: place.formatted_address || '',
            lat: place.geometry?.location?.lat() ?? 0,
            lon: place.geometry?.location?.lng() ?? 0
          }))
        }
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewLocation(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('relief_locations').insert([newLocation])
    if (error) console.error('Error adding location:', error)
    else {
      fetchLocations()
      setIsFormOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-full max-w-md m-4 max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={() => setIsFormOpen(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">Add New Location</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={newLocation.name}
            onChange={handleInputChange}
            placeholder="Location Name"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="address"
            ref={inputRef}
            value={newLocation.address}
            onChange={handleInputChange}
            placeholder="Address"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="organization"
            value={newLocation.organization}
            onChange={handleInputChange}
            placeholder="Organization"
            className="w-full p-2 border rounded"
          />
          <select
            name="category"
            value={newLocation.category}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="volunteer">Volunteer</option>
            <option value="search">Search and Rescue</option>
            <option value="recovery">Recovery</option>
          </select>
          <textarea
            name="description"
            value={newLocation.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="needs"
            value={newLocation.needs}
            onChange={handleInputChange}
            placeholder="Needs"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="providing"
            value={newLocation.providing}
            onChange={handleInputChange}
            placeholder="Providing"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Location
          </button>
        </form>
      </div>
    </div>
  )
}