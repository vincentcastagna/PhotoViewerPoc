# syntax=docker/dockerfile:1.6

FROM node:20-slim

WORKDIR /app

ENV PNPM_HOME="/root/.local/share/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NODE_ENV=development \
    PORT=5173

RUN corepack enable \
    && corepack prepare pnpm@9.1.0 --activate

# Copy the entrypoint separately so it remains available even when the
# application directory is overridden by a bind mount (e.g. docker compose).
COPY docker/entrypoint.sh /usr/local/bin/pokephotoviewer-entrypoint.sh
RUN chmod +x /usr/local/bin/pokephotoviewer-entrypoint.sh \
    && sed -i 's/\r$//' /usr/local/bin/pokephotoviewer-entrypoint.sh

COPY . .

EXPOSE 5173

ENTRYPOINT ["/usr/local/bin/pokephotoviewer-entrypoint.sh"]
CMD []
