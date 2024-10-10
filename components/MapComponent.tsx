import React, { useState, useCallback, useRef, useEffect, ErrorInfo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

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

interface MapComponentProps {
  locations: Location[]
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('MapComponent error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong with the map.</h1>
    }

    return this.props.children
  }
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 35.5951,
  lng: -82.5515
};

const libraries: ("places")[] = ["places"];

const MapComponent: React.FC<MapComponentProps> = ({ locations }) => {
  console.log('MapComponent received locations:', locations)
  
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  const handleLoadError = (error: Error) => {
    console.error("Error loading Google Maps:", error);
    setMapError("Failed to load Google Maps. Please check your internet connection and try again.");
  };

  const handleMouseOver = useCallback((location: Location) => {
    setHoveredLocation(location);
  }, []);

  const handleMouseOut = useCallback(() => {
    setHoveredLocation(null);
  }, []);

  const onLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  useEffect(() => {
    if (!map) return;

    class LocationOverlay extends google.maps.OverlayView {
      private location: Location | null = null;
      private div: HTMLDivElement | null = null;

      setLocation(location: Location | null) {
        this.location = location;
        this.draw();
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.position = 'absolute';
        this.div.className = 'bg-white p-2 rounded shadow-lg pointer-events-none';
        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(this.div);
      }

      draw() {
        if (!this.div || !this.location) {
          if (this.div) this.div.style.display = 'none';
          return;
        }

        const point = this.getProjection().fromLatLngToDivPixel(
          new google.maps.LatLng(this.location.lat, this.location.lon)
        );

        if (point) {
          this.div.style.left = `${point.x}px`;
          this.div.style.top = `${point.y}px`;
          this.div.style.display = 'block';
          this.div.innerHTML = `
            <h3 class="font-bold">${this.location.name}</h3>
            <p>${this.location.category}</p>
          `;
        }
      }

      onRemove() {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }
    }

    overlayRef.current = new LocationOverlay();
    overlayRef.current.setMap(map);

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [map]);

  useEffect(() => {
    if (overlayRef.current) {
      (overlayRef.current as any).setLocation(hoveredLocation);
    }
  }, [hoveredLocation]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return <div>Error: Google Maps API key is not set</div>;
  }

  return (
    <ErrorBoundary>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onError={handleLoadError}
      >
        {mapError ? (
          <div>{mapError}</div>
        ) : (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={10}
              onLoad={onLoad}
            >
              {locations.map((location, index) => (
                <Marker
                  key={index}
                  position={{ lat: location.lat, lng: location.lon }}
                  title={location.name}
                  onMouseOver={() => handleMouseOver(location)}
                  onMouseOut={handleMouseOut}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </GoogleMap>
            {selectedLocation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4">{selectedLocation.name}</h2>
                  <p><strong>Address:</strong> {selectedLocation.address}</p>
                  <p><strong>Organization:</strong> {selectedLocation.organization}</p>
                  <p><strong>Category:</strong> {selectedLocation.category}</p>
                  <p><strong>Description:</strong> {selectedLocation.description}</p>
                  <p><strong>Needs:</strong> {selectedLocation.needs}</p>
                  <p><strong>Providing:</strong> {selectedLocation.providing}</p>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </LoadScript>
    </ErrorBoundary>
  );
};

export default MapComponent;