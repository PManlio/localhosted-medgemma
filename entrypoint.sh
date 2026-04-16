#!/bin/bash
# Container entrypoint for the Ollama service.
# Responsibilities:
#   1. Start the Ollama API server in the background.
#   2. Wait until the server accepts connections.
#   3. Pull the default model if it is not already cached in the volume.
#   4. Preload the model into GPU/CPU memory so the first request has no cold-start delay.
#   5. Hand control back to the Ollama server process and wait for it to exit.
#
# No external tools required: readiness and warm-up use the ollama CLI and
# bash built-in /dev/tcp — curl is not installed in the base image.

# Exit immediately if any command returns a non-zero status.
set -e

# Resolve the model to use. Falls back to medgemma:4b if the env var is unset.
MODEL="${OLLAMA_DEFAULT_MODEL:-medgemma:4b}"

# ── 1. Start the Ollama server ───────────────────────────────────────────────
echo "[entrypoint] Starting Ollama server..."
ollama serve &
# Store the PID so we can wait on it at the end and propagate its exit code.
OLLAMA_PID=$!

# ── 2. Wait for the server to be ready ──────────────────────────────────────
# `ollama list` talks to the local API; it exits 0 only when the server is up.
# We suppress output and ignore errors until it succeeds.
echo "[entrypoint] Waiting for Ollama to be ready..."
until ollama list > /dev/null 2>&1; do
    sleep 1
done
echo "[entrypoint] Ollama is up."

# ── 3. Pull the model (skip if already cached in the volume) ─────────────────
# `ollama list` prints one "name:tag  ..." line per downloaded model.
# We anchor the grep to the start of the line (^) to avoid partial matches.
if ollama list 2>/dev/null | grep -q "^${MODEL}"; then
    echo "[entrypoint] Model '${MODEL}' already present, skipping pull."
else
    echo "[entrypoint] Pulling model '${MODEL}'..."
    ollama pull "${MODEL}"
    echo "[entrypoint] Model '${MODEL}' ready."
fi

# ── 4. Warm-up: preload the model into memory ────────────────────────────────
# Sending a generate request with an empty prompt forces Ollama to load the
# model weights into GPU/CPU memory now instead of on the first real request.
# keep_alive=-1 instructs Ollama to never evict the model automatically.
#
# We use bash's built-in /dev/tcp instead of curl (not present in the image).
# The subshell writes a raw HTTP/1.0 POST and discards the response; || true
# prevents the script from aborting if the model rejects an empty prompt.
echo "[entrypoint] Warming up model (preloading into memory)..."
PAYLOAD="{\"model\":\"${MODEL}\",\"prompt\":\"\",\"keep_alive\":-1}"
(
    printf 'POST /api/generate HTTP/1.0\r\nHost: localhost:11434\r\nContent-Type: application/json\r\nContent-Length: %d\r\n\r\n%s' \
        "${#PAYLOAD}" "${PAYLOAD}" >/dev/tcp/localhost/11434
) 2>/dev/null || true
echo "[entrypoint] Model loaded and ready."

# ── 5. Hand off to the Ollama server process ─────────────────────────────────
# Block until the server exits (e.g. on SIGTERM from Docker) and return its
# exit code so Docker can report the correct container status.
wait $OLLAMA_PID
