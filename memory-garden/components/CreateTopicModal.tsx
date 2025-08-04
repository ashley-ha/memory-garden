'use client'

import { useState } from 'react'

interface CreateTopicModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description: string) => Promise<void>
}

export function CreateTopicModal({ isOpen, onClose, onSubmit }: CreateTopicModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(title.trim(), description.trim())
      setTitle('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Failed to create topic:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-parchment rounded-lg p-6 w-full max-w-md">
        <h2 className="text-elvish-title text-xl mb-4">Create New Topic</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Topic Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-elvish w-full"
              placeholder="What would you like to learn?"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-forest mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-elvish w-full h-24 resize-none"
              placeholder="Briefly describe what this topic covers..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="btn-elvish flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('')
                setDescription('')
                onClose()
              }}
              className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}