
import { useState } from "react"

export default function Assistant(){
  const [disaster,setDisaster]=useState("")
  const [result,setResult]=useState("")

  const askAI=async()=>{
    setResult("AI guidance would appear here using OpenAI API.")
  }

  return(
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">Emergency AI Assistant</h1>

      <input
      className="p-2 text-black w-full"
      placeholder="Disaster type"
      value={disaster}
      onChange={e=>setDisaster(e.target.value)}
      />

      <button
      className="mt-4 bg-blue-600 p-3 rounded"
      onClick={askAI}
      >
      Get Guidance
      </button>

      <p className="mt-4">{result}</p>
    </div>
  )
}
