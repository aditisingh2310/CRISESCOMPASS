
import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomeMap from "./pages/HomeMap"
import Report from "./pages/Report"
import Assistant from "./pages/Assistant"
import Guide from "./pages/Guide"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeMap />} />
        <Route path="/report" element={<Report />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
    </BrowserRouter>
  )
}
