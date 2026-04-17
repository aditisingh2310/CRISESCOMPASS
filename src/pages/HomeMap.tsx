
import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

export default function HomeMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN"

    const map = new mapboxgl.Map({
      container: mapRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.2090, 28.6139],
      zoom: 12
    })

    navigator.geolocation.getCurrentPosition(pos => {
      new mapboxgl.Marker()
        .setLngLat([pos.coords.longitude, pos.coords.latitude])
        .addTo(map)
    })

  }, [])

  return (
    <div className="h-screen w-full">
      <div ref={mapRef} className="h-full w-full"/>
    </div>
  )
}
