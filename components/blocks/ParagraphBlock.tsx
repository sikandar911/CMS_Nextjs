import React from 'react'

interface ParagraphBlockProps {
  content: {
    html: string
  }
  settings?: {
    maxWidth?: string
    alignment?: 'left' | 'center' | 'right' | 'justify'
    fontSize?: 'sm' | 'base' | 'lg' | 'xl'
    lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose'
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function ParagraphBlock({
  content,
  settings = {},
  isEditor = false,
  onUpdate
}: ParagraphBlockProps) {
  const {
    maxWidth = '100%',
    alignment = 'left',
    fontSize = 'base',
    lineHeight = 'normal'
  } = settings

  const { html = '<p>Enter your paragraph text...</p>' } = content

  const handleContentChange = (newHtml: string) => {
    if (onUpdate) {
      onUpdate({ html: newHtml }, settings)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    if (onUpdate) {
      onUpdate(content, { ...settings, ...newSettings })
    }
  }

  const getAlignmentClass = (align: string) => {
    const alignMap = {
      'left': 'text-left',
      'center': 'text-center',
      'right': 'text-right',
      'justify': 'text-justify'
    }
    return alignMap[align as keyof typeof alignMap] || 'text-left'
  }

  const getFontSizeClass = (size: string) => {
    const sizeMap = {
      'sm': 'text-sm',
      'base': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl'
    }
    return sizeMap[size as keyof typeof sizeMap] || 'text-base'
  }

  const getLineHeightClass = (height: string) => {
    const heightMap = {
      'tight': 'leading-tight',
      'normal': 'leading-normal',
      'relaxed': 'leading-relaxed',
      'loose': 'leading-loose'
    }
    return heightMap[height as keyof typeof heightMap] || 'leading-normal'
  }

  const containerClasses = `
    prose prose-gray max-w-none
    ${getAlignmentClass(alignment)}
    ${getFontSizeClass(fontSize)}
    ${getLineHeightClass(lineHeight)}
  `.trim()

  const containerStyle = {
    maxWidth: maxWidth === '100%' ? '100%' : maxWidth
  }

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="flex flex-wrap gap-4 mb-2 p-3 bg-gray-50 rounded">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Max Width</label>
            <select
              value={maxWidth}
              onChange={(e) => handleSettingsChange({ maxWidth: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
            >
              <option value="100%">Full Width</option>
              <option value="760px">760px</option>
              <option value="680px">680px</option>
              <option value="600px">600px</option>
              <option value="500px">500px</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Alignment</label>
            <select
              value={alignment}
              onChange={(e) => handleSettingsChange({ alignment: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => handleSettingsChange({ fontSize: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
            >
              <option value="sm">Small</option>
              <option value="base">Base</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Line Height</label>
            <select
              value={lineHeight}
              onChange={(e) => handleSettingsChange({ lineHeight: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
              <option value="loose">Loose</option>
            </select>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="border border-gray-300 rounded">
          <div className="p-2 bg-gray-50 border-b border-gray-300">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => document.execCommand('bold')}
                className="px-3 text-sm font-medium text-black bg-white border border-black rounded hover:bg-gray-200"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('italic')}
                className="px-3 text-sm font-medium text-black bg-white border border-black rounded hover:bg-gray-200"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('underline')}
                className="px-3 text-sm font-medium text-black bg-white border border-black rounded hover:bg-gray-200"
              >
                <u>U</u>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('insertUnorderedList')}
                className="px-3 text-sm font-medium text-black bg-white border border-black rounded hover:bg-gray-200100"
              >
                • List 
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('insertOrderedList')}
                className="px-3 text-sm font-medium text-black bg-white border border-black rounded hover:bg-gray-200"
              >
                1. List
              </button>
            </div>
          </div>
          <div
            contentEditable
            dangerouslySetInnerHTML={{ __html: html }}
            onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
            className={`p-3 min-h-[100px] outline-none bg-white text-black ${containerClasses}`}
            style={containerStyle}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={containerClasses}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}