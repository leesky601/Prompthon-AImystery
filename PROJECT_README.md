# LG전자 가전제품 구매/구독 결정 지원 챗봇

## 📋 프로젝트 개요

LG전자 가전제품의 구매와 구독 중 최적의 선택을 돕는 AI 기반 멀티 에이전트 챗봇 시스템입니다.

### 주요 특징
- **멀티 에이전트 시스템**: 구매봇, 구독봇, 안내봇이 토론 형식으로 사용자에게 정보 제공
- **Azure 통합**: Azure OpenAI, Cognitive Search, Storage 서비스 활용
- **실시간 대화**: 사용자 상황과 니즈를 파악하여 맞춤형 추천 제공
- **특별한 말투**: LG전자만의 독특한 "~긴해", "~할래말래" 말투 적용

## 🏗 시스템 아키텍처

```
Frontend (Next.js + React)
    ↓
API Gateway (Express.js)
    ↓
Agent Orchestrator
    ↓
┌─────────┬─────────┬─────────┐
│구매봇    │구독봇    │안내봇    │
└─────────┴─────────┴─────────┘
    ↓
Azure Services (OpenAI, Search, Storage)
```

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Azure 계정 및 서비스 설정
  - Azure OpenAI Service
  - Azure Cognitive Search
  - Azure Storage Account

### 설치 및 실행

1. **환경 설정**
```bash
# Backend 환경 변수 설정
cp server/.env.example server/.env
# server/.env 파일을 열어 Azure 서비스 키 입력

# Frontend 환경 변수 설정
cp .env.example .env.local
```

2. **자동 실행 (권장)**
```bash
# 실행 권한 부여
chmod +x start.sh

# 서비스 시작
./start.sh
```

3. **수동 실행**
```bash
# Frontend 의존성 설치
npm install

# Backend 의존성 설치
cd server && npm install && cd ..

# PM2 설치 (전역)
npm install -g pm2

# 서비스 시작
pm2 start ecosystem.config.js
```

4. **서비스 접속**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📁 프로젝트 구조

```
/home/user/webapp/
├── src/                      # Frontend 소스 코드
│   ├── app/                 # Next.js 앱 디렉토리
│   │   ├── page.tsx        # 메인 페이지
│   │   └── product/[id]/   # 제품 상세 페이지
│   └── components/          # React 컴포넌트
│       ├── ChatbotWindow.tsx
│       └── ChatbotButton.tsx
│
├── server/                   # Backend API 서버
│   └── src/
│       ├── agents/          # AI 에이전트 모듈
│       │   ├── BaseAgent.js
│       │   ├── PurchaseAgent.js
│       │   ├── SubscriptionAgent.js
│       │   └── ModeratorAgent.js
│       ├── connectors/      # Azure 서비스 연결
│       │   ├── azureOpenAI.js
│       │   ├── azureSearch.js
│       │   └── azureStorage.js
│       ├── services/        # 비즈니스 로직
│       │   └── AgentOrchestrator.js
│       ├── routes/          # API 라우트
│       │   ├── chat.js
│       │   └── health.js
│       └── index.js         # 서버 진입점
│
├── ecosystem.config.js       # PM2 설정
├── start.sh                 # 시작 스크립트
└── .env.example            # 환경 변수 템플릿
```

## 🔧 주요 모듈 설명

### Frontend Components

#### ChatbotWindow
- 챗봇 대화 인터페이스
- 메시지 표시, 입력 처리, 빠른 응답 버튼
- 에이전트별 색상과 아이콘 구분

#### ChatbotButton
- 챗봇 창을 여는 "할래말래?" 버튼
- 메인 페이지와 제품 상세 페이지에 배치

### Backend Agents

#### PurchaseAgent (구매봇)
- 제품 구매의 장점 강조
- 일시불 구매의 경제성 설명
- 소유권의 가치 어필

#### SubscriptionAgent (구독봇)  
- 구독 서비스의 혜택 설명
- 케어 서비스의 가치 강조
- 초기 비용 부담 없음 어필

#### ModeratorAgent (안내봇)
- 대화 흐름 조율
- 사용자 니즈 파악 질문
- 최종 추천 결론 도출

### Agent Orchestrator
- 에이전트 실행 순서 제어
- 세션 및 대화 상태 관리
- 컨텍스트 유지 및 전달

## 🔑 환경 변수 설정

### Backend (server/.env)
```env
# Azure OpenAI
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4-mini

# Azure Search
AZURE_SEARCH_API_KEY=your-key
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string

# Server
PORT=4000
SESSION_SECRET=your-secret-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📊 모니터링 및 관리

### PM2 명령어
```bash
# 서비스 상태 확인
pm2 status

# 로그 보기
pm2 logs
pm2 logs lg-chatbot-api      # API 서버 로그만
pm2 logs lg-chatbot-frontend  # Frontend 로그만

# 서비스 재시작
pm2 restart all
pm2 restart lg-chatbot-api

# 서비스 중지
pm2 stop all

# 서비스 삭제
pm2 delete all
```

### 헬스체크 엔드포인트
- `GET /api/health` - 기본 헬스체크
- `GET /api/health/ready` - 준비 상태 확인
- `GET /api/health/live` - 라이브니스 체크

## 🧪 API 테스트

### 세션 초기화
```bash
curl -X POST http://localhost:4000/api/chat/init \
  -H "Content-Type: application/json" \
  -d '{"productId": "1"}'
```

### 메시지 전송
```bash
curl -X POST http://localhost:4000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "message": "초기 비용이 부담스러워요",
    "messageType": "text"
  }'
```

## 🚨 트러블슈팅

### Azure 연결 오류
1. `.env` 파일의 Azure 키와 엔드포인트 확인
2. Azure 서비스 활성화 상태 확인
3. 네트워크 방화벽 설정 확인

### PM2 프로세스 오류
```bash
# PM2 프로세스 초기화
pm2 kill
pm2 start ecosystem.config.js
```

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :4000

# 프로세스 종료
kill -9 <PID>
```

## 📝 개발 가이드

### 새로운 에이전트 추가
1. `server/src/agents/` 디렉토리에 새 에이전트 클래스 생성
2. `BaseAgent` 클래스 상속
3. `processMessage` 메서드 구현
4. `AgentOrchestrator`에 에이전트 등록

### 말투 커스터마이징
`BaseAgent.js`의 `getBaseSystemPrompt()` 메서드에서 말투 규칙 수정

## 📄 라이선스

이 프로젝트는 LG전자를 위한 프로토타입입니다.

## 👥 문의

기술 지원이 필요하시면 프로젝트 관리자에게 문의하세요.