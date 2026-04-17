import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CopyModelInput {
  source: string
  destination: string
}

export function useCopyModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ source, destination }: CopyModelInput) => {
      const res = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination }),
      })
      if (!res.ok) throw new Error('Failed to copy model')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}
