#!/bin/sh
set -e
echo "API_URL is: $import.meta.VITE_API_URL"

cat <<EOF > /usr/share/nginx/html/env-config.js
window.env_ = {
  VITE_API_URL: "${import.meta.VITE_API_URL}",
};

console.log("Loaded env config:", window.env_);
EOF

exec "$@"