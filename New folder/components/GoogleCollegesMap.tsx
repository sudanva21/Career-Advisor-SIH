"use client"

import React, { useEffect, useRef } from 'react'

// Minimal type declarations to avoid TS errors without extra deps
declare global {
  interface Window {
    google?: any
    __googleMapsCallback__?: () => void
  }
}

interface College {
  id: string
  name: string
  city: string
  state: string
  rating: number
  type: string
  website?: string
  latitude: number
  longitude: number
}

interface Props {
  colleges: College[]
  selectedCollegeId?: string
  apiKeyOverride?: string
}

// Load Google Maps script if not already loaded
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google && window.google.maps) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]")
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')))
      // If it's already loaded
      if ((window as any).google && (window as any).google.maps) return resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.setAttribute('data-google-maps', 'true')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(script)
  })
}

export default function GoogleCollegesMap({ colleges, selectedCollegeId, apiKeyOverride }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    const apiKey = apiKeyOverride || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    let infoWindow: any
    let markers: any[] = []

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!mapRef.current) return

        // Initialize map
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // India
          zoom: 5,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0b1220' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1220' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'water', stylers: [{ color: '#0a233a' }] },
            { featureType: 'road', stylers: [{ color: '#1f2937' }] },
            { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })

        infoWindow = new window.google.maps.InfoWindow()

        // Add markers
        const bounds = new window.google.maps.LatLngBounds()
        markers = colleges.map((college) => {
          const position = { lat: college.latitude, lng: college.longitude }
          bounds.extend(position)
          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: college.name,
          })
          marker.addListener('click', () => {
            const html = `
              <div style="padding:8px; min-width:220px;">
                <div style="font-weight:700; font-size:14px; margin-bottom:6px;">${college.name}</div>
                <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">${college.city}, ${college.state}</div>
                <div style="font-size:12px; margin-bottom:6px;">⭐ ${college.rating} • ${college.type}</div>
                ${college.website ? `<a href="${college.website}" target="_blank" rel="noopener" style="color:#22d3ee; font-size:12px; text-decoration:underline;">Visit website</a>` : ''}
              </div>
            `
            infoWindow.setContent(html)
            infoWindow.open({ map: mapInstanceRef.current, anchor: marker })
          })
          return marker
        })

        if (colleges.length > 0) {
          if (selectedCollegeId) {
            const selected = colleges.find(c => c.id === selectedCollegeId)
            if (selected) {
              mapInstanceRef.current.setCenter({ lat: selected.latitude, lng: selected.longitude })
              mapInstanceRef.current.setZoom(14)
            } else {
              mapInstanceRef.current.fitBounds(bounds)
            }
          } else {
            mapInstanceRef.current.fitBounds(bounds)
          }
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Google Maps initialization error:', err)
      })

    return () => {
      // Cleanup markers and info window
      if (markers.length) {
        markers.forEach(m => m.setMap(null))
      }
      if (infoWindow) {
        infoWindow.close()
      }
    }
  }, [colleges])

  return <div ref={mapRef} className="h-full w-full" />
}