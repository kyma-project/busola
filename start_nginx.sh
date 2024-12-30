#!/bin/sh
echo ENVIRONMENT="${ENVIRONMENT}" > /app/core-ui/active.env
nginx -g 'daemon off;'
