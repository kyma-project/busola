ARG BASE_IMAGE
FROM $BASE_IMAGE AS source
FROM cgr.dev/sap.com/node:v22.21.1-slim
COPY --from=source /app /app

ENV ADDRESS=0.0.0.0 IS_DOCKER=true ENVIRONMENT="" NODE_ENV=production
EXPOSE 3001
USER 65532:65532
CMD ["--force-fips","backend-production.js"]
