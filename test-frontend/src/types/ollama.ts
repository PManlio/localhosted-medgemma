export interface OllamaModelDetails {
  format: string
  family: string
  families: string[] | null
  parameter_size: string
  quantization_level: string
}

export interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: OllamaModelDetails
}

export interface OllamaTagsResponse {
  models: OllamaModel[]
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  images?: string[]
}

export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  options?: Record<string, unknown>
}

export interface ChatStreamChunk {
  model: string
  created_at: string
  message: ChatMessage
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
  eval_duration?: number
}

export interface GenerateRequest {
  model: string
  prompt: string
  images?: string[]
  stream?: boolean
  keep_alive?: number | string
  options?: Record<string, unknown>
}

export interface GenerateStreamChunk {
  model: string
  created_at: string
  response: string
  done: boolean
  total_duration?: number
  eval_count?: number
}

export interface PullRequest {
  name: string
  stream?: boolean
}

export interface PullStreamChunk {
  status: string
  digest?: string
  total?: number
  completed?: number
}

export interface DeleteRequest {
  name: string
}

export interface CopyRequest {
  source: string
  destination: string
}

export interface ShowRequest {
  name: string
}

export interface ShowResponse {
  license: string
  modelfile: string
  parameters: string
  template: string
  details: OllamaModelDetails
}

export interface EmbeddingsRequest {
  model: string
  prompt: string
}

export interface EmbeddingsResponse {
  embedding: number[]
}

export interface RunningModel {
  name: string
  model: string
  size: number
  digest: string
  details: OllamaModelDetails
  expires_at: string
  size_vram: number
}

export interface PsResponse {
  models: RunningModel[]
}
