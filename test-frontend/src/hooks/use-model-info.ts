import { useMutation } from '@tanstack/react-query'
import type { ShowResponse } from '@/types/ollama'

export function useModelInfo() {
  return useMutation<ShowResponse, Error, string>({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to get model info')
      return res.json()
    },
  })
}
