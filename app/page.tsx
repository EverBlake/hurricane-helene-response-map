// app/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface Location {
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

const initialLocations: Location[] = [
  {name: "Asheville Volunteer Center", address: "123 Main St, Asheville, NC", organization: "Red Cross", category: "volunteer", description: "Main volunteer coordination center", needs: "Volunteers, blankets", providing: "Food, shelter", lat: 35.5951, lon: -82.5515},
  {name: "Knoxville Search and Rescue HQ", address: "456 Oak Rd, Knoxville, TN", organization: "Knoxville SAR", category: "search", description: "Search and Rescue command post", needs: "Trained SAR personnel", providing: "Coordination, equipment", lat: 35.9606, lon: -83.9207},
  {name: "Cherokee Recovery Site", address: "789 River Ln, Cherokee, NC", organization: "Cherokee Nation", category: "recovery", description: "Post-storm recovery center", needs: "Construction materials", providing: "Cleanup assistance", lat: 35.4774, lon: -83.3200},
]

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>
})

export default function Home() {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    category: 'volunteer'
  })
  const [mapKey, setMapKey] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google && inputRef.current && isFormOpen) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ['address'] }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setNewLocation(prev => ({
            ...prev,
            address: place.formatted_address || '',
            lat: lat,
            lon: lng
          }));
        } else {
          console.warn('Selected place does not have valid geometry');
        }
      });
    }
  }, [isFormOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewLocation(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newLocation.name && newLocation.lat && newLocation.lon) {
      setLocations(prev => [...prev, newLocation as Location])
      setNewLocation({ category: 'volunteer' })
      setMapKey(prev => prev + 1)
      setIsFormOpen(false)
    } else {
      alert('Please fill in at least the name, latitude, and longitude fields.')
    }
  }

  return (
    <div className="relative h-screen">
      <MapComponent key={mapKey} locations={locations} />
      <button
        onClick={() => setIsFormOpen(true)}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
      >
        Add Location
      </button>
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Location</h2>
            <p className="mb-4 text-sm text-gray-600">
              Enter the location details below. Use the address field for autocomplete. 
              Latitude and longitude will be filled automatically when an address is selected.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={newLocation.name || ''}
                onChange={handleInputChange}
                placeholder="Location Name"
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                ref={inputRef}
                value={newLocation.address || ''}
                onChange={handleInputChange}
                placeholder="Start typing address..."
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="organization"
                value={newLocation.organization || ''}
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
                value={newLocation.description || ''}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full p-2 border rounded"
              />
              <textarea
                name="needs"
                value={newLocation.needs || ''}
                onChange={handleInputChange}
                placeholder="Needs"
                className="w-full p-2 border rounded"
              />
              <textarea
                name="providing"
                value={newLocation.providing || ''}
                onChange={handleInputChange}
                placeholder="Providing"
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="lat"
                value={newLocation.lat || ''}
                onChange={handleInputChange}
                placeholder="Latitude"
                step="any"
                required
                className="w-full p-2 border rounded"
                readOnly
              />
              <input
                type="number"
                name="lon"
                value={newLocation.lon || ''}
                onChange={handleInputChange}
                placeholder="Longitude"
                step="any"
                required
                className="w-full p-2 border rounded"
                readOnly
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}