#!/bin/sh
curl -s -X POST "http://host.docker.internal:8880/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{"input":"Hello Troy, this is a test.","voice":"am_puck","speed":1.0}' \
  -o /tmp/test.wav

if [ -f /tmp/test.wav ]; then
  echo "SUCCESS: Audio file created"
  ls -la /tmp/test.wav
else
  echo "FAILED: No audio file"
fi
