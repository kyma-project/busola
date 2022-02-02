#!/usr/bin/env bash

GOARCH=wasm GOOS=js go build -o main.wasm main.go
