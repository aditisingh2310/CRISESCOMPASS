export default function About() {
  return (
    <div className="p-4 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6">About CrisisConnect</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl mb-3">What is CrisisConnect?</h2>
          <p className="text-gray-300 leading-relaxed">
            CrisisConnect is a real-time disaster response platform that connects civilians and emergency responders
            during crisis situations. Using modern web technologies, it provides instant incident reporting,
            live mapping, AI-powered emergency guidance, and offline capabilities to ensure help reaches those who need it most.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-3">How It Helps During Disasters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl mb-2">For Civilians</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Report incidents instantly with GPS location</li>
                <li>• Access real-time emergency guidance from AI</li>
                <li>• View nearby emergency resources and shelters</li>
                <li>• Works offline when internet is unavailable</li>
                <li>• Emergency SOS button for immediate help</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl mb-2">For Responders</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Live incident feed with real-time updates</li>
                <li>• Priority-based incident management</li>
                <li>• Distance-based sorting for efficient response</li>
                <li>• Heatmap visualization of crisis zones</li>
                <li>• Mark incidents as resolved</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl mb-3">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded text-center">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="text-lg mb-2">Live Mapping</h3>
              <p className="text-gray-300 text-sm">Real-time incident visualization with resource overlays</p>
            </div>
            <div className="bg-gray-800 p-4 rounded text-center">
              <div className="text-4xl mb-2">🤖</div>
              <h3 className="text-lg mb-2">AI Assistant</h3>
              <p className="text-gray-300 text-sm">Intelligent emergency guidance based on situation and location</p>
            </div>
            <div className="bg-gray-800 p-4 rounded text-center">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="text-lg mb-2">Offline First</h3>
              <p className="text-gray-300 text-sm">Works without internet, syncs when connection returns</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl mb-3">Technology Stack</h2>
          <div className="bg-gray-800 p-4 rounded">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg mb-2">Frontend</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• React + TypeScript</li>
                  <li>• Vite build system</li>
                  <li>• Tailwind CSS</li>
                  <li>• Mapbox GL JS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg mb-2">Backend & Data</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Supabase (PostgreSQL + Realtime)</li>
                  <li>• OpenAI GPT API</li>
                  <li>• Service Worker (PWA)</li>
                  <li>• Geolocation API</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl mb-3">Impact & Use Cases</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            CrisisConnect is designed for real-world disaster scenarios including:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="text-gray-300 space-y-2">
              <li>• Natural disasters (floods, earthquakes, wildfires)</li>
              <li>• Urban emergencies (building fires, accidents)</li>
              <li>• Medical emergencies in remote areas</li>
              <li>• Large-scale evacuations</li>
            </ul>
            <ul className="text-gray-300 space-y-2">
              <li>• Mass casualty incidents</li>
              <li>• Infrastructure failures</li>
              <li>• Search and rescue operations</li>
              <li>• Community emergency coordination</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}