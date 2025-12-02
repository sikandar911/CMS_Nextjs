'use client'

import { useState } from 'react'

interface UniversityKitFormProps {
  variant?: 'desktop' | 'mobile'
}

export default function UniversityKitForm({ variant = 'desktop' }: UniversityKitFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/university-kit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Success! Check your email for the University Success Kit.'
        })
        setFormData({ firstName: '', email: '' })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Something went wrong. Please try again.'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (variant === 'mobile') {
    return (
      <div className="w-full bg-[#F8FAFC] rounded-xl shadow p-4">
        <h4 className="text-md font-semibold text-gray-900 text-center">Get Your Free University Success Kit</h4>
        <p className="text-sm text-gray-600 text-center">Download our complete application guide + scholarship database</p>
        
        {message && (
          <div className={`mt-3 p-3 rounded-md text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <input 
            aria-label="First name" 
            type="text" 
            name="firstName"
            placeholder="Your first name" 
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50" 
          />
          <input 
            aria-label="Email address" 
            type="email" 
            name="email"
            placeholder="Your email address" 
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50" 
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-1 px-4 py-2 rounded-md bg-[#EF623C] text-white font-semibold hover:bg-[#d55533] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Me The Success Kit'}
          </button>
        </form>
      </div>
    )
  }

  // Desktop variant
  return (
    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-[360px] bg-[#F8FAFC] rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 text-center">Get Your Free University Success Kit</h3>
      <p className="text-sm text-gray-600 mt-2 text-center">Download our complete application guide + scholarship database</p>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input 
          type="text" 
          name="firstName"
          placeholder="Your first name" 
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50" 
        />
        <input 
          type="email" 
          name="email"
          placeholder="Your email address" 
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50" 
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-2 px-4 py-2 rounded-md bg-[#EF623C] text-white font-semibold hover:bg-[#d55533] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Me The Success Kit'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-[#EF623C]">
          {/* stars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#EF623C" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/>
            </svg>
          ))}
        </div>
        <div className="text-sm text-gray-700 mt-2">4.9/5 rating from 2,847 students</div>
      </div>
    </div>
  )
}
