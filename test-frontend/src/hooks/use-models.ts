import { useQuery } from '@tanstack/react-query'
import type { OllamaTagsResponse } from '@/types/ollama'

export function useModels() {
  return useQuery<OllamaTagsResponse>({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch models')
      return res.json()
    },
    refetchInterval: 5000,
  })
}
