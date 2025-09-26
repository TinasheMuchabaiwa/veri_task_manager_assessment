#!/bin/sh

# Replace environment variables in runtime
# This allows configuration without rebuilding the image

# Replace API URL if environment variable is set
if [ ! -z "$API_URL" ]; then
    echo "Setting API URL to: $API_URL"
    # Replace the API URL in the built JavaScript files
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8080|$API_URL|g" {} \;
fi

# Execute the main command
exec "$@"