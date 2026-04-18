
import { useState, useEffect, useRef } from "react"

// AI Emergency Assistant with voice input/output capabilities
// Features: Location-aware guidance, speech recognition, text-to-speech
export default function Assistant() {
  const [message, setMessage] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        setError('Voice recognition failed. Please try again.')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  // Voice input using Web Speech API
  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setError('')
      recognitionRef.current.start()
    } else {
      setError('Voice recognition not supported in this browser.')
    }
  }

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const askAI = async () => {
    if (!message.trim()) {
      setError("Please enter a message describing the emergency situation.")
      return
    }

    setLoading(true)
    setError("")
    setResult("")

    try {
      const locationContext = userLocation
        ? `User is located at coordinates: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}.`
        : "User location not available."

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: `You are an emergency response AI assistant. Analyze the user's emergency situation and provide structured advice in these exact sections:

**IMMEDIATE ACTIONS**
- List 3-5 critical steps to take right now

**SAFETY TIPS**
- Provide specific safety precautions for this disaster type

**EMERGENCY CONTACTS**
- List relevant emergency numbers and services

Keep each section concise. Use bullet points. Base advice on the disaster type detected from the user's message. ${locationContext}`
          }, {
            role: 'user',
            content: message
          }],
          max_tokens: 400,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      const guidance = data.choices[0]?.message?.content || 'Unable to generate guidance.'

      setResult(guidance)

      // Speak the response
      const speakableText = guidance.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n/g, ' ')
      speakResponse(speakableText)
    } catch (error) {
      console.error('AI request failed:', error)
      setError("Unable to connect to AI service. Here are general emergency guidelines:")
      setResult(`**IMMEDIATE ACTIONS**
• Stay calm and assess the situation
• Move to a safe location if possible
• Call emergency services: 911 (US) or local emergency number

**SAFETY TIPS**
• Follow official evacuation orders
• Help others if safe to do so
• Conserve resources and stay informed

**EMERGENCY CONTACTS**
• Emergency: 911
• Local police: Contact local authorities
• Medical: Call ambulance service`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">Emergency AI Assistant</h1>

      {error && <div className="bg-red-600 p-2 mb-4 rounded">{error}</div>}

      <div className="flex space-x-2">
        <textarea
          className="flex-1 p-2 text-black rounded"
          placeholder="Describe your emergency situation (or use voice)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
        />
        <button
          onClick={startListening}
          disabled={isListening}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
          title="Voice Input"
        >
          {isListening ? '🎤' : '🎙️'}
        </button>
      </div>

      <button
        className="w-full bg-blue-600 p-3 rounded mb-4 disabled:opacity-50"
        onClick={askAI}
        disabled={loading}
      >
        {loading ? "Getting Guidance..." : "Get Emergency Guidance"}
      </button>

      {result && (
        <div className="bg-gray-800 p-4 rounded whitespace-pre-line">
          <h3 className="font-bold mb-2">Emergency Guidance:</h3>
          {result}
        </div>
      )}
    </div>
  )
}
