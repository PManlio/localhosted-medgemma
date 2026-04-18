import { useState } from 'react'
import { Activity, Package, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { ModelSelector } from '@/components/model-selector'
import { ModelDownloader } from '@/components/model-downloader'
import { useChat } from '@/hooks/use-chat'
import { useModels } from '@/hooks/use-models'
import { useRunningModels } from '@/hooks/use-running-models'

const DEFAULT_MODEL = 'hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M'

export default function App() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [modelsOpen, setModelsOpen] = useState(false)

  const { messages, isLoading, sendMessage, cancelStream, clearMessages } = useChat()
  const { data: modelsData } = useModels()
  const { data: runningData } = useRunningModels()

  const runningModelNames = runningData?.models.map(m => m.name) ?? []

  // Pre-select first downloaded model if the default isn't available
  const downloadedModels = modelsData?.models ?? []
  const effectiveModel =
    downloadedModels.some(m => m.name === selectedModel)
      ? selectedModel
      : (downloadedModels[0]?.name ?? selectedModel)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">MedGemma Chat</span>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelector
            models={downloadedModels}
            runningModels={runningModelNames}
            selected={effectiveModel}
            onSelect={setSelectedModel}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModelsOpen(true)}
            title="Manage models"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Models</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            disabled={messages.length === 0}
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Separator />

      {/* Chat area */}
      <div className='mx-auto flex w-full flex-1 flex-col overflow-hidden max-w-screen-xl'>
        <main className="min-h-0 flex-1 overflow-hidden">
          <ChatMessages messages={messages} />
        </main>

        {/* Input */}
        <div className="shrink-0 border-t px-4 py-3">
          <ChatInput
            onSend={(content, images) => void sendMessage(effectiveModel, content, images)}
            isLoading={isLoading}
            onCancel={cancelStream}
          />
        </div>
      </div>

      <ModelDownloader open={modelsOpen} onOpenChange={setModelsOpen} />
    </div>
  )
}
