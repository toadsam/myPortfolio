#!/usr/bin/env bash
R="$(cd "$(dirname "$0")" && pwd)"; cd "$R"; PORT=4001; OUT="$R/ramp4.jsonl"; : > "$OUT"
for N in 25 50 100 150 200 300; do
  [ -f "$R/server.pid" ] && { kill "$(cat "$R/server.pid")" 2>/dev/null; sleep 1; }
  PORT=$PORT ./node_modules/.bin/tsx src/server.ts > "$R/s4-$N.log" 2>&1 &
  echo $! > "$R/server.pid"; sleep 4
  LPID=$(powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort $PORT -State Listen).OwningProcess" | tr -d '\r')
  for TRY in 1 2 3; do
    if [ "$TRY" = "2" ]; then
      ( sleep 6; powershell -NoProfile -Command "\$a=(Get-Process -Id $LPID).TotalProcessorTime.TotalSeconds; Start-Sleep -Seconds 8; \$p=Get-Process -Id $LPID; \$b=\$p.TotalProcessorTime.TotalSeconds; Write-Output ('{\"CPU_N\":$N,\"cpu_pct\":' + [math]::Round((\$b-\$a)/8*100,1) + ',\"rss_mb\":' + [math]::Round(\$p.WorkingSet64/1MB,1) + '}')" | tr -d '\r' >> "$OUT" ) &
    fi
    L=$(node coord.cjs "$N" 16 "$PORT" 2>&1 | tail -1); echo "$L" >> "$OUT"; echo "try$TRY $L"
    sleep 2
  done
  wait
done
[ -f "$R/server.pid" ] && { kill "$(cat "$R/server.pid")" 2>/dev/null; rm -f "$R/server.pid"; }
echo DONE
