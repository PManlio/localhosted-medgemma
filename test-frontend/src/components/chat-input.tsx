import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Paperclip, Send, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { fileToBase64 } from '@/lib/utils'

interface ChatInputProps {
  onSend: (content: string, images?: string[]) => void
  isLoading: boolean
  onCancel: () => void
}

interface AttachedImage {
  preview: string
  base64: string
  name: string
}

export function ChatInput({ onSend, isLoading, onCancel }: ChatInputProps) {
  const [text, setText] = useState('')
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAttach = useCallback(async (files: FileList | null) => {
    if (!files) return

    const newImages: AttachedImage[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const base64 = await fileToBase64(file)
      const preview = URL.createObjectURL(file)
      newImages.push({ preview, base64, name: file.name })
    }
    setAttachedImages(prev => [...prev, ...newImages])
  }, [])

  const removeImage = useCallback((index: number) => {
    setAttachedImages(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed && attachedImages.length === 0) return
    if (isLoading) return

    const images = attachedImages.map(img => img.base64)
    onSend(trimmed, images.length > 0 ? images : undefined)
    setText('')
    setAttachedImages([])
  }, [text, attachedImages, isLoading, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const canSend = (text.trim().length > 0 || attachedImages.length > 0) && !isLoading

  return (
    <div className="space-y-2">
      {attachedImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img.preview}
                alt={img.name}
                className="h-16 w-16 rounded-md object-cover border"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => void handleAttach(e.target.files)}
          onClick={e => {
            ;(e.target as HTMLInputElement).value = ''
          }}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Attach images"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Shift+Enter for new line)"
          className="min-h-[44px] max-h-40 resize-none"
          rows={1}
          disabled={isLoading}
        />

        {isLoading ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="shrink-0"
            onClick={onCancel}
            title="Stop generation"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            onClick={handleSend}
            disabled={!canSend}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
