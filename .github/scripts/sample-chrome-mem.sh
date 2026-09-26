#!/usr/bin/env bash
#
# Per-Chrome-process RSS/CPU/VSZ sampler for the edit-cluster OOM loop investigation.
#
# Emits one CSV row per Chrome process per tick. The decisive signature is:
#   climbing rss_mb + pegged cpu (>100) on a `renderer` process  -> runaway loop
#   climbing rss_mb + idle cpu                                    -> leak
#   flat rss_mb + idle cpu                                        -> true hang
# vsz_mb is always noise on Linux (kept only for completeness).
#
# Usage: sample-chrome-mem.sh [OUT_CSV] [INTERVAL_SECONDS]
# Runs until killed. Linux-only (reads /proc/meminfo); intended for CI (ubuntu-latest).

set -u
OUT="${1:-chrome-mem.csv}"
INTERVAL="${2:-1}"

mkdir -p "$(dirname "$OUT")"
echo "kind,ts,pid,ptype,vsz_mb,rss_mb,cpu,mem_avail_mb" > "$OUT"

while true; do
  ts=$(date +%s%3N)
  mem_avail=$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo 2>/dev/null)
  : "${mem_avail:=0}"
  # pid, rss(KB), vsz(KB), %cpu, full command line
  ps -eo pid=,rss=,vsz=,pcpu=,args= 2>/dev/null | grep -i '[c]hrome' | \
  while read -r pid rss vsz cpu args; do
    ptype=$(printf '%s' "$args" | grep -oE -- '--type=[a-zA-Z_-]+' | head -1 | sed 's/--type=//')
    [ -z "$ptype" ] && ptype=browser
    echo "sample,$ts,$pid,$ptype,$((vsz/1024)),$((rss/1024)),$cpu,$mem_avail" >> "$OUT"
  done
  sleep "$INTERVAL"
done
