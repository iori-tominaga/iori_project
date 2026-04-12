import { HashRouter, Routes, Route } from 'react-router-dom'
import Home    from './pages/Home'
import Quiz    from './pages/Quiz'
import Results from './pages/Results'
import Stats   from './pages/Stats'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"        element={<Home />}    />
        <Route path="/quiz"    element={<Quiz />}    />
        <Route path="/results" element={<Results />} />
        <Route path="/stats"   element={<Stats />}   />
      </Routes>
    </HashRouter>
  )
}
