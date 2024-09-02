#!/bin/sh
echo ENVIRONMENT="${ENVIRONMENT}" > /app/core-ui/active.env
node backend-production.js
