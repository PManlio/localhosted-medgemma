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

      setIsLoading(true)
      setError(null)

      const controller = new AbortController()
      abortControllerRef.current = controller

      const timeout = setTimeout(() => {
        controller.abort()
      }, 120000) // 🔥 2 minuti per cold start modelli grandi

      const userApiMessage: ChatMessage = {
        role: 'user',
        content,
        ...(images?.length ? { images } : {}),
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

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [...historyRef.current, userApiMessage],
            stream: true,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(await res.text())
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let fullContent = ''
        let firstChunk = false

        const startWatchdog = setTimeout(() => {
          if (!firstChunk) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: '[Loading model...]' }
                  : m,
              ),
            )
          }
        }, 3000)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(Boolean)

          for (const line of lines) {
            try {
              const data: ChatStreamChunk = JSON.parse(line)

              if (data.message?.content) {
                if (!firstChunk) {
                  firstChunk = true
                  clearTimeout(startWatchdog)
                }

                fullContent += data.message.content

                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, content: fullContent }
                      : m,
                  ),
                )
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, isStreaming: false }
              : m,
          ),
        )

        historyRef.current = [
          ...historyRef.current,
          userApiMessage,
          { role: 'assistant', content: fullContent },
        ]
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, isStreaming: false, error: msg }
              : m,
          ),
        )

        setError(msg)
      } finally {
        clearTimeout(timeout)
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

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelStream,
    clearMessages,
  }
}