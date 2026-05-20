# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /app

RUN test -n "${VITE_API_BASE_URL}" || (echo "ERROR: build-arg VITE_API_BASE_URL is required" >&2 && exit 1)

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS serve

# Custom nginx.conf (reference — applied via COPY heredoc below):
# <<'NGINX_CONF'
# server {
#     listen 80;
#     server_name localhost;
#     root /usr/share/nginx/html;
#     index index.html;
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_types text/css application/javascript text/javascript application/json text/plain text/xml application/xml image/svg+xml text/html;
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
# }
# NGINX_CONF

COPY --from=builder /app/dist /usr/share/nginx/html

COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css application/javascript text/javascript application/json text/plain text/xml application/xml image/svg+xml text/html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
