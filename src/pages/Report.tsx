
import { useState } from "react"

export default function Report() {
  const [description,setDescription]=useState("")

  const submit=()=>{
    alert("Report submitted (connect to Supabase)")
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">Report Incident</h1>

      <textarea
      className="w-full p-2 text-black"
      placeholder="Describe the hazard"
      value={description}
      onChange={e=>setDescription(e.target.value)}
      />

      <button
      className="mt-4 bg-red-600 p-3 rounded"
      onClick={submit}
      >
      Submit Report
      </button>
    </div>
  )
}
