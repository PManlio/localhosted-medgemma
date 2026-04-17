#!/bin/bash
# Container entrypoint for the Ollama service.
# Responsibilities:
#   1. Start the Ollama API server in the background.
#   2. Wait until the server accepts connections.
#   3. Pull the base model declared in /Modelfile (if not already cached).
#   4. Create the local 'medgemma' alias via /Modelfile (pins num_ctx to avoid
#      the Gemma3 SWA KV cache SIGSEGV in llama_init_from_model).
#   5. Preload the model into GPU/CPU memory.
#   6. Hand control back to the Ollama server process.

set -e

LOCAL_MODEL="medgemma"

# ── 1. Start the Ollama server ───────────────────────────────────────────────
echo "[entrypoint] Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

# ── 2. Wait for the server to be ready ──────────────────────────────────────
echo "[entrypoint] Waiting for Ollama to be ready..."
until ollama list > /dev/null 2>&1; do
    sleep 1
done
echo "[entrypoint] Ollama is up."

# ── 3 + 4. Create local model from Modelfile ─────────────────────────────────
# ollama create pulls the FROM base if not cached, then registers the alias
# with the parameters defined in /Modelfile (num_ctx, etc.).
echo "[entrypoint] Creating local model '${LOCAL_MODEL}' from /Modelfile..."
ollama create "${LOCAL_MODEL}" -f /Modelfile
echo "[entrypoint] Model '${LOCAL_MODEL}' ready."

# ── 5. Warm-up: preload the model into memory ────────────────────────────────
echo "[entrypoint] Warming up model (preloading into memory)..."
PAYLOAD="{\"model\":\"${LOCAL_MODEL}\",\"prompt\":\"\",\"keep_alive\":-1}"
(
    printf 'POST /api/generate HTTP/1.0\r\nHost: localhost:11434\r\nContent-Type: application/json\r\nContent-Length: %d\r\n\r\n%s' \
        "${#PAYLOAD}" "${PAYLOAD}" >/dev/tcp/localhost/11434
) 2>/dev/null || true
echo "[entrypoint] Model loaded and ready."

# ── 6. Hand off to the Ollama server process ─────────────────────────────────
wait $OLLAMA_PID
