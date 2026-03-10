import React, { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import { extractTextFromFile } from '../services/fileProcessor'
import { summarizeWithGemini } from '../services/gemini'
import { translations } from '../services/i18n'

const Summarizer = ({ onSave, initialData, apiKey, language }) => {
  const [inputText, setInputText] = useState('')
  const [files, setFiles] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const t = translations[language];

  // Load selected history item
  useEffect(() => {
    if (initialData) {
      setInputText(initialData.input)
      setSummary(initialData.summary)
    }
  }, [initialData])

  const handleSummarize = async () => {
    if (!inputText.trim() && files.length === 0) return

    setIsLoading(true)
    setSummary(null)
    setError(null)
    
    let combinedText = inputText
    
    // Process files
    if (files.length > 0) {
      let fileTexts = []
      for (const file of files) {
        try {
          const text = await extractTextFromFile(file)
          if (text) fileTexts.push(`--- FILE: ${file.name} ---\n${text}`)
        } catch (error) {
          console.error(`Error extracting from ${file.name}:`, error)
        }
      }
      combinedText = combinedText + "\n\n" + fileTexts.join("\n\n")
    }

    try {
      let generatedSummary;
      
      if (apiKey) {
        // Real Gemini AI Call
        generatedSummary = await summarizeWithGemini(apiKey, combinedText, language);
      } else {
        // Mock fallback with a slight delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        generatedSummary = language === 'tr' ? {
          mainPoints: [
            "Müşteri ürünün teslimat hızıyla ilgili memnuniyetini dile getirdi.",
            "Fakat paketlemedeki plastik kullanımından rahatsız olduğunu belirtti.",
            "Gelecek siparişlerinde sürdürülebilir paketleme seçenekleri görmek istiyor."
          ],
          sentiment: "Genel olarak Olumlu (Mock Data - API Key Eksik)",
          actionItems: [
            "Lojistik ekibine geri bildirim iletilsin.",
            "Geri dönüştürülebilir paketleme seçenekleri için AR-GE başlatılsın."
          ]
        } : {
          mainPoints: [
            "The customer expressed satisfaction with the delivery speed.",
            "However, they expressed dissatisfaction with the use of plastic in packaging.",
            "They want to see sustainable packaging options in future orders."
          ],
          sentiment: "Generally Positive (Mock Data - Missing API Key)",
          actionItems: [
            "Feedback should be provided to the logistics team.",
            "R&D should start for recyclable packaging options."
          ]
        };
      }

      if (files.length > 0) {
        const fileMsg = language === 'tr' 
          ? `${files.length} adet dosya/görsel başarıyla analiz edildi.`
          : `${files.length} file(s)/image(s) successfully analyzed.`;
        generatedSummary.mainPoints.unshift(fileMsg);
      }

      const analysisResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: inputText,
        extractedText: combinedText,
        summary: generatedSummary
      };

      setSummary(generatedSummary);
      if (onSave) onSave(analysisResult);
    } catch (err) {
      console.error(err);
      setError(err.message || t.error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleExportTxt = () => {
    if (!summary) return
    
    let content = `${t.title}\n${language === 'tr' ? 'Tarih' : 'Date'}: ${new Date().toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}\n\n`
    content += `${language === 'tr' ? 'GİRİŞ METNİ' : 'INPUT TEXT'}:\n${inputText}\n\n`
    content += `--- ${language === 'tr' ? 'ANALİZ SONUÇLARI' : 'ANALYSIS RESULTS'} ---\n\n`
    content += `${t.keyPoints.toUpperCase()}:\n${summary.mainPoints.map(p => `- ${p}`).join('\n')}\n\n`
    content += `${t.sentiment.toUpperCase()}: ${summary.sentiment}\n\n`
    content += `${t.actionPlan.toUpperCase()}:\n${summary.actionItems.map(i => `- ${i}`).join('\n')}\n\n`
    content += `(c) 2026 ANALIZ`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analiz_${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="summarizer">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={t.subtitle}
        className="glass-input"
        disabled={isLoading}
      />
      
      <FileUpload 
        onFilesChange={setFiles} 
        disabled={isLoading}
        language={language}
      />
      
      <button 
        className="btn-primary" 
        onClick={handleSummarize}
        disabled={isLoading || (!inputText.trim() && files.length === 0)}
      >
        {isLoading ? (
          <>
            <span className="loader"></span> {t.analyzing}
          </>
        ) : (
          <>{t.analyzeBtn}</>
        )}
      </button>

      {!apiKey && !isLoading && !summary && (
        <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
          {t.demoHint}
        </p>
      )}

      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {summary && (
        <div className={`summary-container ${summary ? 'visible' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              className="btn-secondary" 
              onClick={handleExportTxt}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              {t.downloadTxt}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => window.print()}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              {t.downloadPdf}
            </button>
          </div>

          <div className="summary-item">
            <h3>{t.keyPoints}</h3>
            <ul>
              {summary.mainPoints.map((point, index) => (
                <li key={index}><p>{point}</p></li>
              ))}
            </ul>
          </div>

          <div className="summary-item sentiment">
            <h3>{t.sentiment}</h3>
            <p>{summary.sentiment}</p>
          </div>

          <div className="summary-item">
            <h3>{t.actionPlan}</h3>
            <ul>
              {summary.actionItems.map((item, index) => (
                <li key={index}><p>{item}</p></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Summarizer
