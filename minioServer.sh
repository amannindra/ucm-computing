pids=($(lsof -tiTCP:9000 -sTCP:LISTEN 2>/dev/null; lsof -tiTCP:9001 -sTCP:LISTEN 2>/dev/null)); (( ${#pids[@]} )) && kill -9 ${pids[@]}

minio server /tmp/minio --license ~/minio/minio.license

