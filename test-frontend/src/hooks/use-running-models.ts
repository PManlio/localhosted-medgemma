import { useQuery } from '@tanstack/react-query'
import type { PsResponse } from '@/types/ollama'

export function useRunningModels() {
  return useQuery<PsResponse>({
    queryKey: ['running-models'],
    queryFn: async () => {
      const res = await fetch('/api/ps')
      if (!res.ok) throw new Error('Failed to fetch running models')
      return res.json()
    },
    refetchInterval: 10000,
  })
}
