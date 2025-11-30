'use client'

import React, { createContext, useContext, useRef, useState } from 'react'

type ConfirmFn = (message: string) => Promise<boolean>

const ConfirmContext = createContext<{ confirm: ConfirmFn } | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm: ConfirmFn = (msg) => {
    setMessage(msg)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }

  const handleOk = () => {
    setOpen(false)
    if (resolveRef.current) resolveRef.current(true)
    resolveRef.current = null
  }

  const handleCancel = () => {
    setOpen(false)
    if (resolveRef.current) resolveRef.current(false)
    resolveRef.current = null
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full z-10 mx-4">
            <h3 className="text-lg font-semibold mb-2">Warning</h3>
            <p className="text-sm text-gray-700 mb-4">{message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleOk}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx.confirm
}

export default ConfirmProvider
