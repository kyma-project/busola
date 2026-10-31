# Testing the terminal reconnect mechanism

## Run frontend and backend separately

Two terminals (not `npm start`):

```bash
ENVIRONMENT=local npm run busola     # frontend, port 8080
```

```bash
ENVIRONMENT=local npm run backend    # backend, port 3001
```

Open http://localhost:8080, connect to a cluster.

## Test reconnect

1. Open a terminal session, wait for `connected`.
2. Hard-kill the backend:

```bash
kill -9 $(lsof -ti tcp:3001 -sTCP:LISTEN)
```

Use `kill -9` (SIGKILL) — a graceful stop closes the socket cleanly and won't
reconnect. `-sTCP:LISTEN` kills only the server, not clients on 3001.

If you want to re-establish connection run backend again

```bash
ENVIRONMENT=local npm run backend    # backend, port 3001
```

Do NOT use Ctrl+C in backend process as the WebConnection will be still alive.
