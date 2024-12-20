#!/bin/sh
echo ENVIRONMENT="${ENVIRONMENT}" > /app/core-ui/active.env
echo BACKEND_URL="${BACKEND_URL}" >> /app/core-ui/active.env
nginx -g 'daemon off;'
