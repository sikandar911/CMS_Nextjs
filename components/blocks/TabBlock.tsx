'use client'

import React, { useState } from 'react'

interface TabItem {
  id: string
  title: string
  content: string
}

interface TabBlockProps {
  content: {
    tabs: TabItem[]
  }
  settings?: {
    theme?: 'default' | 'pills' | 'underline'
    orientation?: 'horizontal' | 'vertical'
  }
  isEditor?: boolean
  onUpdate?: (content: any, settings: any) => void
}

export default function TabBlock({
  content,
  settings = {},
  isEditor = false,
  onUpdate
}: TabBlockProps) {
  const { theme = 'default', orientation = 'horizontal' } = settings
  const { tabs = [] } = content
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '')

  React.useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].id)
    }
  }, [tabs, activeTab])

  const handleAddTab = () => {
    if (onUpdate) {
      const newTab: TabItem = {
        id: `tab-${Date.now()}`,
        title: 'New Tab',
        content: '<p>Enter your tab content here...</p>'
      }
      onUpdate({ tabs: [...tabs, newTab] }, settings)
    }
  }

  const handleRemoveTab = (tabId: string) => {
    if (onUpdate && tabs.length > 1) {
      const updatedTabs = tabs.filter(tab => tab.id !== tabId)
      onUpdate({ tabs: updatedTabs }, settings)
      
      // Switch to first tab if current active tab is being removed
      if (activeTab === tabId && updatedTabs.length > 0) {
        setActiveTab(updatedTabs[0].id)
      }
    }
  }

  const handleTabUpdate = (tabId: string, field: 'title' | 'content', value: string) => {
    if (onUpdate) {
      const updatedTabs = tabs.map(tab =>
        tab.id === tabId ? { ...tab, [field]: value } : tab
      )
      onUpdate({ tabs: updatedTabs }, settings)
    }
  }

  const handleSettingsChange = (newSettings: any) => {
    if (onUpdate) {
      onUpdate(content, { ...settings, ...newSettings })
    }
  }

  const getTabListClasses = () => {
    const base = orientation === 'horizontal' ? 'flex' : 'flex flex-col'
    
    switch (theme) {
      case 'pills':
        return `${base} gap-2 p-1 bg-gray-100 rounded-lg`
      case 'underline':
        return `${base} border-b border-gray-200`
      default:
        return `${base} border-b border-gray-200`
    }
  }

  const getTabButtonClasses = (isActive: boolean) => {
    const base = 'px-4 py-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    
    switch (theme) {
      case 'pills':
        return isActive
          ? `${base} bg-white text-blue-600 rounded-md shadow-sm`
          : `${base} text-gray-600 hover:text-gray-900 rounded-md hover:bg-white/50`
      case 'underline':
        return isActive
          ? `${base} text-blue-600 border-b-2 border-blue-600`
          : `${base} text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300`
      default:
        return isActive
          ? `${base} text-blue-600 border-b-2 border-blue-600 -mb-px`
          : `${base} text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 -mb-px`
    }
  }

  const getContentClasses = () => {
    return orientation === 'horizontal' 
      ? 'mt-4' 
      : 'ml-4 flex-1'
  }

  const containerClasses = orientation === 'vertical' 
    ? 'flex gap-4' 
    : ''

  if (isEditor) {
    return (
      <div className="space-y-4">
        {/* Settings Panel */}
        <div className="p-3 bg-gray-50 rounded space-y-3">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => handleSettingsChange({ theme: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
                title="Select tab theme"
              >
                <option value="default">Default</option>
                <option value="pills">Pills</option>
                <option value="underline">Underline</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => handleSettingsChange({ orientation: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-black"
                title="Select tab orientation"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddTab}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add Tab
          </button>
        </div>

        {/* Editor Tabs */}
        <div className="space-y-4">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="border border-gray-200 rounded-lg">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tab {index + 1}</span>
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTab(tab.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Preview
                </button>
              </div>

              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tab Title</label>
                  <input
                    type="text"
                    value={tab.title}
                    onChange={(e) => handleTabUpdate(tab.id, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    placeholder="Enter tab title..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tab Content</label>
                  <div
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: tab.content }}
                    onBlur={(e) => handleTabUpdate(tab.id, 'content', e.currentTarget.innerHTML)}
                    className="min-h-[100px] p-2 border border-gray-300 rounded prose prose-sm max-w-none bg-white text-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {tabs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tabs yet. Click "Add Tab" to get started.
          </div>
        )}
      </div>
    )
  }

  if (tabs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No tabs to display.
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      {/* Tab List */}
      <div className={getTabListClasses()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={getTabButtonClasses(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={getContentClasses()}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${activeTab === tab.id ? 'block' : 'hidden'} prose prose-sm max-w-none`}
          >
            <div dangerouslySetInnerHTML={{ __html: tab.content }} />
          </div>
        ))}
      </div>
    </div>
  )
}