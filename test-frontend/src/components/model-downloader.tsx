import { Download, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DOWNLOADABLE_MODELS } from '@/model_data/models'
import { useModels } from '@/hooks/use-models'
import { useDeleteModel } from '@/hooks/use-delete-model'
import { usePullModel } from '@/hooks/use-pull-model'
import { formatBytes } from '@/lib/utils'

interface ModelDownloaderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModelDownloader({ open, onOpenChange }: ModelDownloaderProps) {
  const { data: modelsData, isLoading: modelsLoading } = useModels()
  const { mutate: deleteModel, isPending: isDeleting } = useDeleteModel()
  const { pullModel, progress } = usePullModel()

  const downloadedNames = new Set(modelsData?.models.map(m => m.name) ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Model Manager</DialogTitle>
          <DialogDescription>
            Download new models or manage the ones already installed.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="installed">
              Installed
              {modelsData?.models.length ? (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {modelsData.models.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
          </TabsList>

          {/* Installed models */}
          <TabsContent value="installed" className="flex-1 min-h-0">
            <ScrollArea className="h-[50vh]">
              {modelsLoading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading…
                </div>
              )}
              {!modelsLoading && (!modelsData?.models || modelsData.models.length === 0) && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No models installed yet.
                </p>
              )}
              <div className="space-y-1 p-1">
                {modelsData?.models.map((model, i) => (
                  <div key={model.name}>
                    <div className="flex items-center justify-between gap-3 px-2 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(model.size)}
                          {model.details?.parameter_size && ` · ${model.details.parameter_size}`}
                          {model.details?.quantization_level && ` · ${model.details.quantization_level}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={isDeleting}
                        onClick={() => deleteModel(model.name)}
                        title="Delete model"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {i < (modelsData.models.length - 1) && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Browse / download */}
          <TabsContent value="browse" className="flex-1 min-h-0">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-2 p-1">
                {DOWNLOADABLE_MODELS.map(model => {
                  const isInstalled = downloadedNames.has(model.pullName)
                  const prog = progress[model.pullName]
                  const isDownloading = prog && !prog.isDone && !prog.error

                  return (
                    <div key={model.pullName} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.size}</span>
                            {model.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                        </div>

                        <div className="shrink-0">
                          {isInstalled ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Installed
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!!isDownloading}
                              onClick={() => void pullModel(model.pullName)}
                            >
                              {isDownloading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                              {isDownloading ? 'Downloading…' : 'Download'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {prog && !prog.isDone && !prog.error && (
                        <div className="space-y-1">
                          <Progress value={prog.percent} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">
                            {prog.status}
                            {prog.total > 0 && ` · ${prog.percent}%`}
                          </p>
                        </div>
                      )}

                      {prog?.error && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {prog.error}
                        </div>
                      )}

                      {prog?.isDone && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Download complete
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
