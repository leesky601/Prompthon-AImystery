# Exaone AI 통합 가이드

## 개요
이 문서는 기존 Azure OpenAI 기반 챗봇 시스템에 LG AI Research의 Exaone 모델을 통합하는 방법을 설명합니다.

## 주요 기능
- ✅ Exaone 서버리스 엔드포인트 통합
- ✅ Azure AI Search 데이터 통합
- ✅ 실시간 스트리밍 응답 지원
- ✅ 자동 폴백 메커니즘 (Exaone → Azure OpenAI)
- ✅ 기존 시스템과의 완벽한 호환성

## 설정 방법

### 1. 환경 변수 설정
`server/.env` 파일에 다음 환경 변수를 추가하세요:

```env
# Exaone Configuration
FRIENDLI_TOKEN=your_friendli_token_here  # Friendli 토큰 (필수)
EXAONE_MODEL=LGAI-EXAONE/EXAONE-4.0.1-32B  # 사용할 모델
AI_PROVIDER=exaone  # AI 제공자 선택 ('azure' 또는 'exaone')
ENABLE_STREAMING=true  # 스트리밍 활성화
ENABLE_FALLBACK=true  # 폴백 활성화
EXAONE_MAX_TOKENS=1000  # 최대 토큰 수
EXAONE_TEMPERATURE=0.7  # 생성 온도
EXAONE_TIMEOUT=30000  # 타임아웃 (밀리초)
```

### 2. Friendli 토큰 발급
1. [Friendli Suite](https://suite.friendli.ai) 에 접속
2. 계정 생성 또는 로그인
3. [Tokens 페이지](https://suite.friendli.ai/tokens) 에서 토큰 발급
4. 발급받은 토큰을 `FRIENDLI_TOKEN` 환경 변수에 설정

### 3. AI 제공자 선택
- `AI_PROVIDER=exaone`: Exaone 사용 (권장)
- `AI_PROVIDER=azure`: Azure OpenAI 사용 (기존 방식)

## 아키텍처

### 모듈 구조
```
server/src/
├── config/
│   └── aiProvider.js          # AI 제공자 설정 관리
├── connectors/
│   ├── azureOpenAI.js         # 기존 Azure OpenAI 커넥터
│   ├── exaone.js              # 새로운 Exaone 커넥터
│   └── azureSearch.js         # Azure Search 커넥터
└── agents/
    ├── BaseAgent.js           # 개선된 베이스 에이전트
    ├── PurchaseAgent.js       # 구매봇 (스트리밍 지원)
    └── SubscriptionAgent.js   # 구독봇 (스트리밍 지원)
```

### 데이터 플로우
1. 사용자 메시지 수신
2. Azure AI Search에서 관련 제품 정보 검색
3. 검색 결과를 컨텍스트로 포함하여 Exaone API 호출
4. 스트리밍 또는 일반 응답 반환
5. 실패 시 Azure OpenAI로 자동 폴백

## 주요 개선 사항

### 1. ExaoneConnector
- OpenAI 호환 인터페이스 사용
- Azure Search 결과 자동 통합
- 스트리밍 응답 지원
- 에러 처리 및 재시도 로직

### 2. BaseAgent 개선
- AI 제공자 자동 선택
- 통합된 응답 생성 메서드
- 스트리밍 지원
- 폴백 메커니즘

### 3. 스트리밍 지원
- Server-Sent Events (SSE) 활용
- 실시간 청크 단위 응답
- 각 에이전트별 스트리밍 메서드

## 사용 예시

### 기본 사용 (Exaone)
```javascript
// AI_PROVIDER=exaone 설정 시 자동으로 Exaone 사용
const response = await agent.generateResponse(messages, systemPrompt);
```

### 스트리밍 사용
```javascript
// ENABLE_STREAMING=true 설정 시 자동으로 스트리밍 사용
const response = await agent.processMessageStream(
  context,
  userMessage,
  (chunk) => console.log('Chunk:', chunk)
);
```

### Azure Search 통합
```javascript
// productId가 있을 때 자동으로 검색 결과 포함
const response = await agent.generateResponseWithSearch(
  messages,
  systemPrompt,
  productId
);
```

## 모니터링 및 디버깅

### 로그 확인
```bash
# 서버 로그 확인
cd server && npm run dev

# AI 제공자 확인
# 콘솔에 다음과 같이 표시됨:
# 🤖 AI Provider configured: EXAONE
# 📡 Streaming enabled
# 🔄 Fallback enabled
```

### 상태 확인
- `/api/health` 엔드포인트로 서버 상태 확인
- 각 에이전트 로그에서 사용 중인 AI 제공자 확인

## 트러블슈팅

### Exaone 연결 실패
1. `FRIENDLI_TOKEN` 확인
2. 네트워크 연결 확인
3. `ENABLE_FALLBACK=true` 설정으로 Azure OpenAI 폴백 활성화

### 스트리밍 문제
1. `ENABLE_STREAMING=false` 로 비활성화 가능
2. 클라이언트의 SSE 지원 확인
3. 네트워크 프록시 설정 확인

### 성능 최적화
1. `EXAONE_MAX_TOKENS` 조정으로 응답 길이 제어
2. `EXAONE_TEMPERATURE` 조정으로 창의성 제어
3. `EXAONE_TIMEOUT` 조정으로 타임아웃 설정

## 보안 고려사항
- Friendli 토큰을 환경 변수로만 관리
- `.env` 파일을 `.gitignore`에 포함
- 프로덕션 환경에서는 시크릿 관리 서비스 사용

## 향후 개선 계획
- [ ] 응답 캐싱 구현
- [ ] 메트릭 수집 및 모니터링
- [ ] A/B 테스팅 지원
- [ ] 다중 모델 앙상블 지원