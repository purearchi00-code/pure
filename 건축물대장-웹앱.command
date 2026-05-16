#!/bin/bash
# ============================================================
# D.A.R.I — 웹 앱 런처 (macOS 더블클릭 실행)
# ============================================================
# Finder에서 이 파일을 더블클릭하면
# 웹 앱 서버가 시작되고 브라우저가 자동으로 열립니다.
# ============================================================

cd "$(dirname "$0")"

clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏢  D.A.R.I — 건축물대장 웹 앱"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Node.js 확인
if ! command -v node &> /dev/null; then
  echo "❌ Node.js가 설치되어 있지 않습니다."
  echo
  echo "   설치 방법: https://nodejs.org"
  echo
  read -p "엔터를 누르면 창이 닫힙니다..."
  exit 1
fi

echo "✓ Node.js $(node -v) 감지됨"

# .env.local 확인
if [ ! -f ".env.local" ]; then
  echo
  echo "⚠️  .env.local 파일이 없습니다. 기본 키로 생성합니다..."
  cat > .env.local <<'ENV_EOF'
DATA_GO_KR_API_KEY=a96b45d2cf830f8009ca2be0c655b6743fba9e45b965be952f16f20879185dd4
VWORLD_API_KEY=
ANTHROPIC_API_KEY=
EUM_API_KEY=
EUM_SECRET_KEY=
ENV_EOF
  echo "✓ .env.local 생성됨"
fi

echo "✓ 환경변수 로드 완료"
echo

# 포트 확인 및 기존 프로세스 종료
echo "✓ 포트 3000 확인 중..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "  → 기존 프로세스 종료 중..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  sleep 1
fi

echo
echo "🚀 웹 앱 서버 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# 서버 시작 (백그라운드)
node scripts/server.mjs &
SERVER_PID=$!

# 서버 준비 대기
sleep 2

# 브라우저 자동 열기
echo
echo "🌐 브라우저에서 http://localhost:3000 열기..."
open "http://localhost:3000"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  웹 앱 실행 중입니다."
echo "  이 창을 닫으면 서버가 종료됩니다."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# 서버 프로세스 유지
wait $SERVER_PID

echo
echo "⏹️  서버가 종료되었습니다."
sleep 1
