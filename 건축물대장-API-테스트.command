#!/bin/bash
# ============================================================
# D.A.R.I — 건축물대장 API 검증 도구 (macOS 더블클릭 실행)
# ============================================================
# Finder에서 이 파일을 더블클릭하면 Terminal이 열리고
# 자동으로 공공데이터포털 API를 호출해 결과를 보여줍니다.
# ============================================================

# 스크립트 자신의 위치로 이동 (프로젝트 루트)
cd "$(dirname "$0")"

clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏢  D.A.R.I — 건축물대장 API 검증 도구"
echo "      국토교통부 건축HUB 건축물대장정보 서비스"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
  echo "❌ Node.js가 설치되어 있지 않습니다."
  echo
  echo "   설치 방법:"
  echo "   1) https://nodejs.org 접속"
  echo "   2) LTS 버전 다운로드 후 설치"
  echo "   3) 이 파일을 다시 더블클릭"
  echo
  read -p "엔터를 누르면 창이 닫힙니다..."
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js $NODE_VERSION 감지됨"

# .env.local 존재 확인
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

# 메뉴 표시
while true; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  테스트할 주소를 선택하세요:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "    1) 서울 강남구 신사동 529   (가로수길)"
  echo "    2) 서울 강남구 압구정동 480 (전형적 주거지)"
  echo "    3) 서울 강남구 청담동 88    (명품거리)"
  echo "    4) 서울 강남구 역삼동 825   (테헤란로 오피스)"
  echo "    5) 서울 강남구 삼성동 167   (대형 부지)"
  echo "    6) 직접 입력"
  echo "    0) 종료"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  printf "  선택 (0-6): "
  read choice
  echo

  case $choice in
    1) node scripts/test-building-api.mjs 신사동 529 ;;
    2) node scripts/test-building-api.mjs 압구정동 480 ;;
    3) node scripts/test-building-api.mjs 청담동 88 ;;
    4) node scripts/test-building-api.mjs 역삼동 825 ;;
    5) node scripts/test-building-api.mjs 삼성동 167 ;;
    6)
      printf "  동 이름 (예: 신사동): "
      read dong
      printf "  지번 (예: 529 또는 529-1): "
      read jibun
      node scripts/test-building-api.mjs "$dong" "$jibun"
      ;;
    0)
      echo "👋 종료합니다."
      exit 0
      ;;
    *)
      echo "❌ 잘못된 선택입니다. 0~6 중에서 선택해주세요."
      ;;
  esac

  echo
  printf "엔터를 누르면 메뉴로 돌아갑니다..."
  read
  clear
done
