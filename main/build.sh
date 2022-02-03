#!/usr/bin/env bash

GOARCH=wasm GOOS=js go build -o ../core-ui/public/main.wasm main.go
