#!/bin/sh

# Remove 'set -e' temporarily to not exit on errors
echo "=== ENTRYPOINT STARTED ===" >&2
echo "=== ENTRYPOINT STARTED ===" >&1

# Print everything to both stdout and stderr
exec 1>&2

echo "Script is running"
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "All env vars:"
env
echo "--- PORT env var ---"
echo "PORT=${PORT}"

# Use Railway's PORT or default to 80
PORT=${PORT:-80}

echo "Using port: $PORT"

# Create nginx config with the correct port
echo "Creating nginx config..."
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen $PORT;
    listen [::]:$PORT;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle client-side routing (React Router)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

echo "Nginx config created successfully"
echo "Testing nginx config..."
nginx -t || echo "Nginx config test FAILED"

echo "Starting nginx on port $PORT..."
nginx -g "daemon off;" &
NGINX_PID=$!

echo "Nginx started with PID: $NGINX_PID"
echo "Waiting for nginx..."
sleep 2

echo "Checking if nginx is running..."
ps aux | grep nginx || echo "Nginx not in process list"

echo "Checking port..."
netstat -tlnp | grep $PORT || echo "Port $PORT not listening"

# Test if nginx is responding
echo "Testing nginx HTTP response (IPv4)..."
sleep 3
wget -O- http://127.0.0.1:$PORT/ 2>&1 | head -20 || echo "WARNING: Nginx not responding on IPv4"

echo "Testing nginx HTTP response (IPv6)..."
wget -O- http://[::1]:$PORT/ 2>&1 | head -20 || echo "WARNING: Nginx not responding on IPv6"

echo "=== Container fully ready ==="

# Keep container alive
echo "Container running, waiting for nginx process..."
wait $NGINX_PID
