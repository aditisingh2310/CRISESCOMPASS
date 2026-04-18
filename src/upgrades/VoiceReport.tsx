
import { useState } from "react"

export default function VoiceReport({onResult}:{onResult:(text:string)=>void}){

 const [listening,setListening] = useState(false)

 const start = () => {

  const SpeechRecognition =
   (window as any).SpeechRecognition ||
   (window as any).webkitSpeechRecognition

  if(!SpeechRecognition){
    alert("Speech recognition not supported")
    return
  }

  const recognition = new SpeechRecognition()

  recognition.onstart = ()=> setListening(true)

  recognition.onresult = (event:any)=>{
    const text = event.results[0][0].transcript
    onResult(text)
    setListening(false)
  }

  recognition.onerror = ()=> setListening(false)

  recognition.start()
 }

 return (
  <button
    onClick={start}
    style={{
      padding:"10px 16px",
      background:"#e63946",
      color:"white",
      borderRadius:"8px",
      border:"none",
      cursor:"pointer"
    }}
  >
   {listening ? "Listening..." : "🎤 Voice Emergency Report"}
  </button>
 )
}
