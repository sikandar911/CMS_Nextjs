import React, { useState, useEffect, useRef } from 'react'
import SpacingControls from './SpacingControls'

interface TitleBlockProps {
  content: {
    text: string
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
  settings?: {
    alignment?: 'left' | 'center' | 'right'
    color?: string
    fontSize?: string
    padding?: {
      top: number
      right: number
      bottom: number
      left: number
    }
    margin?: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function TitleBlock({ 
  content, 
  settings = {}, 
  isEditor = false, 
  onUpdate 
}: TitleBlockProps) {
  const {
    alignment = 'left',
    color = '#1f2937',
    fontSize = '2xl',
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    margin = { top: 0, right: 0, bottom: 16, left: 0 }
  } = settings

  const {
    text = 'Enter title...',
    level = 'h2'
  } = content

  // Local text state to avoid losing focus when parent re-renders
  const [localText, setLocalText] = useState<string>(text)
  const lastPropTextRef = useRef(text)

  // Sync when external content.text changes (e.g., undo, load)
  useEffect(() => {
    if (text !== lastPropTextRef.current) {
      lastPropTextRef.current = text
      setLocalText(text)
    }
  }, [text])

  // Ensure level is always a string (handle both string and number inputs)
  const normalizedLevel = typeof level === 'number' ? `h${level}` : level

  const handleTextChange = (newText: string) => {
    if (onUpdate) {
      onUpdate({ ...content, text: newText }, settings)
    }
  }

  const handleLevelChange = (newLevel: string) => {
    if (onUpdate) {
      onUpdate({ ...content, level: newLevel }, settings)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    if (onUpdate) {
      onUpdate(content, { ...settings, ...newSettings })
    }
  }

  const getTextSizeClass = (size: string) => {
    const sizeMap = {
      'sm': 'text-sm',
      'base': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl'
    }
    return sizeMap[size as keyof typeof sizeMap] || 'text-2xl'
  }

  const getAlignmentClass = (align: string) => {
    const alignMap = {
      'left': 'text-left',
      'center': 'text-center',
      'right': 'text-right'
    }
    return alignMap[align as keyof typeof alignMap] || 'text-left'
  }

  const commonClasses = `
    font-bold leading-tight mb-4
    ${getTextSizeClass(fontSize)}
    ${getAlignmentClass(alignment)}
  `.trim()

  const style = {
    color: color,
    margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
  }

  const TitleTag = normalizedLevel as keyof JSX.IntrinsicElements

  const commitText = (value: string) => {
    if (!onUpdate) return
    // Only propagate if actually changed compared to content.text
    if (value !== content.text) {
      onUpdate({ ...content, text: value }, settings)
    }
  }

  if (isEditor) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-2">
          <select
            value={normalizedLevel}
            onChange={(e) => handleLevelChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
          </select>
          
          <select
            value={fontSize}
            onChange={(e) => handleSettingsChange({ fontSize: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
          >
            <option value="sm">Small</option>
            <option value="base">Base</option>
            <option value="lg">Large</option>
            <option value="xl">XL</option>
            <option value="2xl">2XL</option>
            <option value="3xl">3XL</option>
            <option value="4xl">4XL</option>
            <option value="5xl">5XL</option>
          </select>

          <select
            value={alignment}
            onChange={(e) => handleSettingsChange({ alignment: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          <input
            type="color"
            value={color}
            onChange={(e) => handleSettingsChange({ color: e.target.value })}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        {/* Spacing Controls */}
        <SpacingControls
          padding={padding}
          margin={margin}
          onPaddingChange={(newPadding) => handleSettingsChange({ padding: newPadding })}
          onMarginChange={(newMargin) => handleSettingsChange({ margin: newMargin })}
        />

        <input
          type="text"
          value={localText}
          onChange={(e) => {
            const val = e.target.value
            setLocalText(val)
            // Immediate commit for now (can debounce if needed)
            commitText(val)
          }}
          onBlur={() => commitText(localText)}
          placeholder="Enter title..."
          className="w-full p-2 border border-gray-300 rounded text-lg font-bold bg-white text-black focus:ring-2 focus:ring-blue-400 focus:outline-none"
          style={style}
        />
      </div>
    )
  }

  return (
    <TitleTag 
      className={commonClasses}
      style={style}
    >
      {text}
    </TitleTag>
  )
}