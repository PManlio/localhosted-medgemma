# OLLAMA_VERSION is passed at build time from .env via docker-compose build args.
# To pin a different version, change OLLAMA_VERSION in the .env file.
ARG OLLAMA_VERSION=0.20.7
FROM ollama/ollama:${OLLAMA_VERSION}

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default model — override via OLLAMA_DEFAULT_MODEL env var
ENV OLLAMA_DEFAULT_MODEL=medgemma:4b

# Listen on all interfaces so the port is reachable from the host
ENV OLLAMA_HOST=0.0.0.0

EXPOSE 11434

ENTRYPOINT ["/entrypoint.sh"]
