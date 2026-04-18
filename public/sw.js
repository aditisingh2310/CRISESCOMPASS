
const CACHE_NAME = 'crisisconnect-v1'
const STATIC_CACHE = 'crisisconnect-static-v1'
const DYNAMIC_CACHE = 'crisisconnect-dynamic-v1'

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/Guide.tsx',
  '/src/index.css'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch(error => console.error('Caching failed:', error))
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request)
        })
    )
  }
  // Handle static assets
  else {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response
          }
          return fetch(request).then(response => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
            return response
          })
        })
        .catch(() => {
          // Return offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
    )
  }
})

// Handle background sync for offline incident reports
self.addEventListener('sync', event => {
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncIncidents())
  }
})

async function syncIncidents() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const keys = await cache.keys()

    // Find queued incident reports
    const incidentRequests = keys.filter(request =>
      request.url.includes('/incidents') && request.method === 'POST'
    )

    for (const request of incidentRequests) {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch (error) {
        console.error('Failed to sync incident:', error)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}
