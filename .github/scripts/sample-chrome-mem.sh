#!/usr/bin/env bash
# Sample Chrome and Cypress process memory during the integration run so we can
# tell what a "renderer crashed" really is: address-space growth (VSZ climbing
# toward the PartitionAlloc ceiling), physical exhaustion (RSS vs MemAvailable),
# or a flat-memory hang (CPU near zero during the dead air before the crash).
#
# One SYS line per tick with system memory, then one line per matching process.
set -u

interval="${1:-3}"

echo "kind,ts,pid,ptype,vsz_mb,rss_mb,cpu,mem_avail_mb"

while true; do
  ts=$(date +%H:%M:%S)

  avail_kb=$(awk '/MemAvailable/ {print $2}' /proc/meminfo 2>/dev/null)
  avail_mb=$(( ${avail_kb:-0} / 1024 ))
  echo "SYS,$ts,-,-,-,-,-,$avail_mb"

  ps -eo pid=,vsz=,rss=,pcpu=,args= 2>/dev/null \
    | grep -iE "chrome|cypress" \
    | grep -viE "grep|sample-chrome-mem" \
    | while read -r pid vsz rss cpu args; do
        rss_mb=$(( rss / 1024 ))
        # skip the many tiny helpers, keep the processes that actually matter
        [ "$rss_mb" -lt 40 ] && continue
        vsz_mb=$(( vsz / 1024 ))
        case "$args" in
          *--type=renderer*)     ptype="renderer" ;;
          *--type=gpu-process*)  ptype="gpu" ;;
          *--type=utility*)      ptype="utility" ;;
          *--type=zygote*)       ptype="zygote" ;;
          *cypress*|*Cypress*)   ptype="cypress" ;;
          *)                     ptype="browser" ;;
        esac
        echo "PROC,$ts,$pid,$ptype,$vsz_mb,$rss_mb,$cpu,-"
      done

  sleep "$interval"
done
