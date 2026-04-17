export interface DownloadableModel {
  name: string
  description: string
  size: string
  tags: string[]
  pullName: string
}

export const DOWNLOADABLE_MODELS: DownloadableModel[] = [
  {
    name: 'MedGemma 4B (default)',
    description: "Google's medical-focused vision-language model — understands clinical text and images",
    size: '~2.4 GB',
    tags: ['medical', 'vision', 'default'],
    pullName: 'hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M',
  },
  {
    name: 'LLaMA 3.2 1B',
    description: "Meta's smallest LLaMA model, ideal for quick tasks on low-end hardware",
    size: '~1.3 GB',
    tags: ['fast', 'small', 'general'],
    pullName: 'llama3.2:1b',
  },
  {
    name: 'LLaMA 3.2 3B',
    description: 'Good balance of speed and capability for everyday tasks',
    size: '~2.0 GB',
    tags: ['balanced', 'general'],
    pullName: 'llama3.2:3b',
  },
  {
    name: 'LLaMA 3.1 8B',
    description: "Meta's capable 8B general-purpose model",
    size: '~4.9 GB',
    tags: ['capable', 'general'],
    pullName: 'llama3.1:8b',
  },
  {
    name: 'Mistral 7B',
    description: 'Fast and efficient European language model with strong reasoning',
    size: '~4.1 GB',
    tags: ['fast', 'general'],
    pullName: 'mistral:7b',
  },
  {
    name: 'Phi-3 Mini',
    description: "Microsoft's compact 3.8B model with surprisingly strong reasoning",
    size: '~2.3 GB',
    tags: ['small', 'reasoning'],
    pullName: 'phi3:mini',
  },
  {
    name: 'Phi-3 Medium',
    description: "Microsoft's 14B model with excellent instruction-following",
    size: '~8.4 GB',
    tags: ['capable', 'reasoning'],
    pullName: 'phi3:medium',
  },
  {
    name: 'Gemma 2 2B',
    description: "Google's efficient 2B parameter model",
    size: '~1.6 GB',
    tags: ['small', 'fast'],
    pullName: 'gemma2:2b',
  },
  {
    name: 'Gemma 2 9B',
    description: "Google's 9B model with strong benchmark performance",
    size: '~5.4 GB',
    tags: ['capable'],
    pullName: 'gemma2:9b',
  },
  {
    name: 'Qwen 2.5 3B',
    description: "Alibaba's multilingual model with strong Chinese and English support",
    size: '~1.9 GB',
    tags: ['multilingual', 'small'],
    pullName: 'qwen2.5:3b',
  },
  {
    name: 'Qwen 2.5 7B',
    description: "Alibaba's stronger multilingual model",
    size: '~4.4 GB',
    tags: ['multilingual', 'capable'],
    pullName: 'qwen2.5:7b',
  },
  {
    name: 'DeepSeek R1 1.5B',
    description: 'Compact reasoning-focused model from DeepSeek',
    size: '~1.1 GB',
    tags: ['reasoning', 'small'],
    pullName: 'deepseek-r1:1.5b',
  },
  {
    name: 'DeepSeek R1 7B',
    description: 'Stronger reasoning model from DeepSeek with chain-of-thought',
    size: '~4.7 GB',
    tags: ['reasoning', 'capable'],
    pullName: 'deepseek-r1:7b',
  },
  {
    name: 'Code LLaMA 7B',
    description: "Meta's code-specialized model for programming tasks",
    size: '~3.8 GB',
    tags: ['code'],
    pullName: 'codellama:7b',
  },
  {
    name: 'Nomic Embed Text',
    description: 'Efficient text embedding model for semantic search and RAG',
    size: '~274 MB',
    tags: ['embeddings'],
    pullName: 'nomic-embed-text',
  },
]
