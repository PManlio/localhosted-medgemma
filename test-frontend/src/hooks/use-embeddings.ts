import { useMutation } from '@tanstack/react-query'
import type { EmbeddingsResponse } from '@/types/ollama'

interface EmbeddingsInput {
  model: string
  prompt: string
}

export function useEmbeddings() {
  return useMutation<EmbeddingsResponse, Error, EmbeddingsInput>({
    mutationFn: async ({ model, prompt }) => {
      const res = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt }),
      })
      if (!res.ok) throw new Error('Failed to get embeddings')
      return res.json()
    },
  })
}
