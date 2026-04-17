import { useEffect, useRef } from 'react'
import { Bot, User, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { UIMessage } from '@/hooks/use-chat'

interface ChatMessagesProps {
  messages: UIMessage[]
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

function MessageImages({ images }: { images: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((img, i) => (
        <img
          key={i}
          src={`data:image/jpeg;base64,${img}`}
          alt={`Attached image ${i + 1}`}
          className="max-h-48 max-w-xs rounded-md object-cover border"
        />
      ))}
    </div>
  )
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Bot className="mx-auto h-12 w-12 opacity-30" />
          <p className="text-sm">Start a conversation with the model</p>
          <p className="text-xs opacity-60">You can attach images using the 📎 button</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4 pb-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3',
              message.role === 'user' && 'flex-row-reverse',
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
              <AvatarFallback
                className={cn(
                  'text-xs',
                  message.role === 'assistant'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground',
                )}
              >
                {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                message.role === 'assistant'
                  ? 'bg-muted text-foreground rounded-tl-sm'
                  : 'bg-primary text-primary-foreground rounded-tr-sm',
                message.error && 'border border-destructive',
              )}
            >
              {message.images && message.images.length > 0 && (
                <MessageImages images={message.images} />
              )}

              {message.error ? (
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{message.error}</span>
                </div>
              ) : (
                <span className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                  {message.isStreaming && !message.content && <TypingIndicator />}
                  {message.isStreaming && message.content && (
                    <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
