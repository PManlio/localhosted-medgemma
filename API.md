# Ollama REST API — riferimento rapido

Base URL: `http://localhost:11434`

---

## Modelli

### Lista modelli scaricati
```
GET /api/tags
```
```bash
curl http://localhost:11434/api/tags
```

### Scarica (o aggiorna) un modello
```
POST /api/pull
```
```bash
curl -X POST http://localhost:11434/api/pull \
  -d '{"name": "llama3:8b"}'
```
Aggiungere `"stream": false` per risposta sincrona.

### Rimuovi un modello
```
DELETE /api/delete
```
```bash
curl -X DELETE http://localhost:11434/api/delete \
  -d '{"name": "llama3:8b"}'
```

### Copia un modello (rinomina / alias)
```
POST /api/copy
```
```bash
curl -X POST http://localhost:11434/api/copy \
  -d '{"source": "hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M", "destination": "mio-modello"}'
```

### Informazioni su un modello
```
POST /api/show
```
```bash
curl -X POST http://localhost:11434/api/show \
  -d '{"name": "hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M"}'
```

### Modelli in esecuzione (in memoria)
```
GET /api/ps
```
```bash
curl http://localhost:11434/api/ps
```

---

## Inferenza

### Chat (formato OpenAI-compatible)
```
POST /api/chat
```
```bash
curl -X POST http://localhost:11434/api/chat \
  -d '{
    "model": "hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M",
    "messages": [
      {"role": "user", "content": "Quali sono i sintomi del diabete di tipo 2?"}
    ],
    "stream": false
  }'
```

#### Da Windows Powershell
```
curl -X POST http://localhost:11434/api/chat -H "Content-Type: application/json" -d "{\"model\":\"hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M\",\"messages\":[{\"role\":\"user\",\"content\":\"Quali sono i sintomi del diabete di tipo 2?\"}],\"stream\":false}"
```

### Generate (completamento testo grezzo)
```
POST /api/generate
```
```bash
curl -X POST http://localhost:11434/api/generate \
  -d '{
    "model": "hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M",
    "prompt": "Spiega brevemente l'\''ipertensione.",
    "stream": false
  }'
```

### Embeddings
```
POST /api/embeddings
```
```bash
curl -X POST http://localhost:11434/api/embeddings \
  -d '{"model": "hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M", "prompt": "testo da embeddare"}'
```

---

## Health check
```
GET /api/tags          → 200 OK se il server è up
```

---

## Cambiare modello di default a runtime

Per caricare un modello diverso in memoria senza riavviare il container:

```bash
# Scarica il nuovo modello
curl -X POST http://localhost:11434/api/pull -d '{"name": "llama3:8b"}'

# Scaricalo dalla memoria (keep_alive=0) e carica il nuovo
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "hf.co/unsloth/medgemma-4b-it-GGUF:Q4_K_M", "prompt": "", "keep_alive": 0}'

curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama3:8b", "prompt": "", "keep_alive": -1}'
```
