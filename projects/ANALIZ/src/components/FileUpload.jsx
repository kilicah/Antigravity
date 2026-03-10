import React, { useState, useRef, useEffect, useCallback } from 'react'
import { translations } from '../services/i18n'

const FileUpload = ({ onFilesChange, disabled, language }) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  
  const t = translations[language];

  const handleFiles = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    
    // Add preview for images
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }
    });

    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      onFilesChange(updated);
      return updated;
    });
  }, [onFilesChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const updatedFiles = [...prev];
      const fileToRemove = updatedFiles[index];
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      updatedFiles.splice(index, 1);
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div 
      className={`upload-container ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        multiple 
        onChange={handleFileSelect}
        accept="image/*,.pdf,.docx,.txt"
        disabled={disabled}
      />
      
      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <p className="upload-text">{t.uploadHint}</p>
        <p className="upload-subtitle">{t.uploadSubhint}</p>
      </div>

      {files.length > 0 && (
        <div className="file-previews">
          {files.map((file, index) => (
            <div key={index} className="file-preview-card" onClick={(e) => e.stopPropagation()}>
              {file.type.startsWith('image/') ? (
                <img src={file.preview} alt="preview" />
              ) : (
                <div className="file-icon-placeholder">📄</div>
              )}
              <span className="file-name">{file.name}</span>
              <button 
                className="remove-file" 
                onClick={() => removeFile(index)} 
                disabled={disabled}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
