import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { createWorker } from 'tesseract.js'

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export const extractTextFromFile = async (file) => {
  if (file.type === 'application/pdf') {
    return await extractTextFromPdf(file)
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDocx(file)
  } else if (file.type.startsWith('image/')) {
    return await extractTextFromImage(file)
  } else if (file.type.startsWith('text/')) {
    return await file.text()
  }
  return ""
}

const extractTextFromImage = async (file) => {
  const worker = await createWorker('tur+eng')
  const { data: { text } } = await worker.recognize(file)
  await worker.terminate()
  return text
}

const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ""
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + "\n"
  }
  
  return fullText
}

const extractTextFromDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}
