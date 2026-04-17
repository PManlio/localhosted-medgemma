import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to delete model')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}
