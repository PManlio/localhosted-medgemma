import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PullStreamChunk } from '@/types/ollama'

export interface PullProgress {
  status: string
  completed: number
  total: number
  percent: number
  isDone: boolean
  error?: string
}

export function usePullModel() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<Record<string, PullProgress>>({})

  const pullModel = useCallback(async (name: string) => {
    setProgress(prev => ({
      ...prev,
      [name]: { status: 'Starting…', completed: 0, total: 0, percent: 0, isDone: false },
    }))

    try {
      const res = await fetch('/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, stream: true }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const data: PullStreamChunk = JSON.parse(line)
            const completed = data.completed ?? 0
            const total = data.total ?? 0
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0

            setProgress(prev => ({
              ...prev,
              [name]: {
                status: data.status,
                completed,
                total,
                percent,
                isDone: data.status === 'success',
              },
            }))
          } catch {
            // skip malformed line
          }
        }
      }

      void queryClient.invalidateQueries({ queryKey: ['models'] })
    } catch (err) {
      setProgress(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          completed: 0,
          total: 0,
          percent: 0,
          isDone: false,
          error: String(err),
        },
      }))
    }
  }, [queryClient])

  const clearProgress = useCallback((name: string) => {
    setProgress(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  return { pullModel, progress, clearProgress }
}
