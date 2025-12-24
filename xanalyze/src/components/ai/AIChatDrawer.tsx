'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Loader2 } from 'lucide-react'
import { proxyEndpoints } from '@/lib/proxyConfig'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_QUESTIONS = [
  "How many nodes are online?",
  "Compare network performance",
  "Which node has the most credits?",
  "What's the average CPU usage?",
  "Summarize network health"
]

export function AIChatDrawer({ isOpen, onClose }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check AI status on mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const response = await fetch(proxyEndpoints.aiStatus())
        const data = await response.json()
        setAiEnabled(data.aiEnabled)
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setAiEnabled(false)
      }
    }
    if (isOpen) checkAI()
  }, [isOpen])

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(proxyEndpoints.aiAsk(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(data.timestamp)
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 9998 }}
            className="fixed inset-0 bg-black/20 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ zIndex: 9999 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-white border-l-3 border-black shadow-brutal-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-3 border-black bg-yellow">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                <h2 className="font-bold text-lg text-black">Xanalyze AI</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* AI Status Banner */}
            {!aiEnabled && (
              <div className="p-3 bg-orange/10 border-b-2 border-orange text-sm text-center">
                AI assistant is currently unavailable
              </div>
            )}

            {/* Info Banner */}
            <div className="p-3 bg-yellow/10 border-b-2 border-yellow/30 text-xs text-center text-gray-600">
              Powered by <strong>Gemini 2.0 Flash</strong> • Real-time network analysis
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <Sparkles className="w-12 h-12 text-yellow mb-4" />
                  <h3 className="font-bold text-lg mb-2">Ask me anything!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    I can help you understand your network status, performance metrics, and more.
                  </p>
                  <div className="space-y-2 w-full max-w-sm">
                    {SUGGESTED_QUESTIONS.slice(0, 3).map((question, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(question)}
                        disabled={!aiEnabled}
                        className="w-full text-left p-3 text-sm rounded-lg border-2 border-black bg-white hover:bg-yellow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-yellow flex items-center justify-center flex-shrink-0 border-2 border-black">
                        <Sparkles className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] p-3 rounded-lg border-2 border-black',
                        message.role === 'user'
                          ? 'bg-yellow text-black'
                          : 'bg-white'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.role === 'user' ? 'text-gray-700' : 'text-gray-500'
                      )}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow flex items-center justify-center border-2 border-black">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <div className="bg-white p-3 rounded-lg border-2 border-black">
                    <Loader2 className="w-5 h-5 animate-spin text-yellow" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (only show when empty) */}
            {messages.length > 0 && (
              <div className="px-4 pb-2 border-t-2 border-gray-100">
                <p className="text-xs text-gray-500 mb-2 mt-2">Quick questions:</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {SUGGESTED_QUESTIONS.slice(3).map((question, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(question)}
                      disabled={!aiEnabled || isLoading}
                      className="flex-shrink-0 px-3 py-1.5 text-xs rounded-lg border-2 border-black bg-white hover:bg-yellow/20 transition-colors disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t-3 border-black bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about network status..."
                  disabled={!aiEnabled || isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || !aiEnabled || isLoading}
                  className="px-4 py-2.5 bg-yellow text-black rounded-lg border-2 border-black hover:bg-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-brutal-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
