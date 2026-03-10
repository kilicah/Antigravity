import React, { useState } from 'react'
import './index.css'
import Summarizer from './components/Summarizer'
import HistorySidebar from './components/HistorySidebar'
import { translations } from './services/i18n'

function App() {
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('analysis_history')
    return savedHistory ? JSON.parse(savedHistory) : []
  })
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'tr')

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    localStorage.setItem('app_language', newLang)
  }

  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey)
    localStorage.setItem('gemini_api_key', newKey)
  }

  const handleSaveAnalysis = (analysis) => {
    const newHistory = [analysis, ...history]
    setHistory(newHistory)
    localStorage.setItem('analysis_history', JSON.stringify(newHistory))
  }

  const handleSelectHistory = (item) => {
    setActiveAnalysis(item)
  }

  const handleClearHistory = () => {
    if (window.confirm('Tüm geçmişi silmek istediğinize emin misiniz?')) {
      setHistory([])
      localStorage.removeItem('analysis_history')
      setActiveAnalysis(null)
    }
  }

  return (
    <div className="App">
      <HistorySidebar 
        history={history} 
        onSelect={handleSelectHistory} 
        activeId={activeAnalysis?.id}
        onClear={handleClearHistory}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="main-content">
        <main className="glass-card">
          <h1>{translations[language].title}</h1>
          <p className="subtitle">{translations[language].subtitle}</p>
          
          <Summarizer 
            onSave={handleSaveAnalysis} 
            initialData={activeAnalysis}
            apiKey={apiKey}
            language={language}
          />
        </main>
        
        <footer style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          &copy; 2026 ANALIZ - Premium Correspondence Insights
        </footer>
      </div>
    </div>
  )
}

export default App
