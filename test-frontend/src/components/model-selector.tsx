import { Cpu } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OllamaModel } from '@/types/ollama'

interface ModelSelectorProps {
  models: OllamaModel[]
  runningModels: string[]
  selected: string
  onSelect: (value: string) => void
}

export function ModelSelector({ models, runningModels, selected, onSelect }: ModelSelectorProps) {
  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-64 truncate">
        <div className="flex items-center gap-1.5 truncate">
          <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Select a model…" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {models.length === 0 ? (
          <SelectGroup>
            <SelectLabel className="font-normal text-muted-foreground">
              No models downloaded yet
            </SelectLabel>
          </SelectGroup>
        ) : (
          <SelectGroup>
            <SelectLabel>Downloaded models</SelectLabel>
            {models.map(model => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex items-center gap-2">
                  {runningModels.includes(model.name) && (
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 shrink-0" title="Loaded in memory" />
                  )}
                  <span className="truncate max-w-[220px]">{model.name}</span>
                  {model.details?.parameter_size && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {model.details.parameter_size}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}
