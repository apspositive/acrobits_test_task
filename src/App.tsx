import { VoIPApp } from './components/VoIPApp'
import { ThemeProvider } from './components/ThemeProvider'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <VoIPApp />
    </ThemeProvider>
  )
}

export default App
