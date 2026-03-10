import React from 'react'
import { translations } from '../services/i18n'

const HistorySidebar = ({ history, onSelect, activeId, onClear, apiKey, onApiKeyChange, language, onLanguageChange }) => {
  const t = translations[language];

  return (
    <aside className="sidebar glass-card">
      <div className="history-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2>{t.history}</h2>
          <div className="language-toggle" style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => onLanguageChange('tr')}
              className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
            >TR</button>
            <button 
              onClick={() => onLanguageChange('en')}
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            >EN</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
          <button 
            onClick={() => onSelect(null)} 
            className="sidebar-btn-primary"
          >
            {t.new}
          </button>
          <button 
            onClick={onClear} 
            className="sidebar-btn-danger"
          >
            {t.delete}
          </button>
        </div>
      </div>
      
      <div className="history-list">
        {history.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
            {t.noHistory}
          </p>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className={`history-item ${activeId === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item)}
            >
              <div className="history-item-date">
                {new Date(item.timestamp).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="history-item-preview">
                {item.input.substring(0, 40)}...
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <label>{t.apiKeyLabel}</label>
        <input 
          type="password" 
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={t.apiKeyPlaceholder}
          className="api-key-input"
        />
      </div>
    </aside>
  )
}

export default HistorySidebar
