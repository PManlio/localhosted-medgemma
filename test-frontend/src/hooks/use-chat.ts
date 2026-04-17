import { useState, useRef, useCallback } from 'react'
import type { ChatMessage, ChatStreamChunk } from '@/types/ollama'

export interface UIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  isStreaming?: boolean
  error?: string
}

export function useChat() {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const historyRef = useRef<ChatMessage[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (model: string, content: string, images?: string[]) => {
      if (isLoading) return

      setError(null)
      setIsLoading(true)

      const userApiMessage: ChatMessage = {
        role: 'user',
        content,
        ...(images && images.length > 0 ? { images } : {}),
      }

      const userUiMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        images,
      }

      const assistantId = crypto.randomUUID()

      setMessages(prev => [
        ...prev,
        userUiMessage,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ])

      abortControllerRef.current = new AbortController()

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [...historyRef.current, userApiMessage],
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(Boolean)

          for (const line of lines) {
            try {
              const data: ChatStreamChunk = JSON.parse(line)
              if (data.message?.content) {
                fullContent += data.message.content
                const snapshot = fullContent
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, content: snapshot } : m,
                  ),
                )
              }
            } catch {
              // skip malformed line
            }
          }
        }

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        )

        historyRef.current = [
          ...historyRef.current,
          userApiMessage,
          { role: 'assistant', content: fullContent },
        ]
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, isStreaming: false, content: m.content || '[Cancelled]' }
                : m,
            ),
          )
        } else {
          const msg = err instanceof Error ? err.message : String(err)
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, isStreaming: false, error: msg }
                : m,
            ),
          )
          setError(msg)
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [isLoading],
  )

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    historyRef.current = []
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, cancelStream, clearMessages }
}
