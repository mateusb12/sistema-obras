import { useState } from 'react'
import { FullLayout } from './components'
import { DummyLoginPage } from './components/DummyLoginPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <DummyLoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return <FullLayout />
}

export default App
