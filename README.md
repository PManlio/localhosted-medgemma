# localhosted-medgemma

Run [MedGemma](https://huggingface.co/unsloth/medgemma-4b-it-GGUF) locally via [Ollama](https://ollama.com/) inside a Docker container.  
On startup the container automatically pulls the model (if not already cached) and preloads it into memory to eliminate cold-start latency on the first request.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- *(optional)* NVIDIA GPU with [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) for GPU acceleration

## Quick start

**1. Copy the configuration file**

```bash
cp .env.example .env
```

Edit `.env` if you want to change the port, Ollama version, or default model.

**2. Start the container**

```bash
docker compose up -d
```

On the first run the following steps happen automatically:
- model pull from HuggingFace (~2.4 GB)
- warm-up: the model is loaded into memory

You can follow the logs with:

```bash
docker compose logs -f
```

The service is ready when you see:

```
[entrypoint] Model loaded and ready.
```

**3. Check the server is up**

```bash
curl http://localhost:11434/api/tags
```

## Useful commands

| Operation | Command |
|---|---|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Live logs | `docker compose logs -f` |
| Rebuild image | `docker compose build` |
| Shell into container | `docker compose exec ollama bash` |

## CPU-only (no GPU)

Comment out or remove the `deploy` block in [docker-compose.yml](docker-compose.yml):

```yaml
# deploy:
#   resources:
#     reservations:
#       devices:
#         - driver: nvidia
#           count: all
#           capabilities: [gpu]
```

## API calls

All REST calls (chat, generate, embeddings, model management) are documented in [API.md](API.md).
