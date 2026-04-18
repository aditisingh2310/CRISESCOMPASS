
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation"
import HomeMap from "./pages/HomeMap"
import Report from "./pages/Report"
import Assistant from "./pages/Assistant"
import Guide from "./pages/Guide"
import Dashboard from "./pages/Dashboard"
import CommandCenter from "./pages/CommandCenter"
import About from "./pages/About"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomeMap />} />
          <Route path="/report" element={<Report />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
