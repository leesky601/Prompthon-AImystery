# 버그 수정 리포트

## 수정된 문제들

### 1. 구독료 undefined 문제 ✅
**문제**: 시스템 프롬프트에서 구독료가 undefined로 표시됨
```
- 3년 구독료: undefined원/월
- 4년 구독료: undefined원/월
```

**원인**: 
- 데이터는 `subscription_price_3year` 형식으로 저장
- 코드에서는 `subscription_price_3y` 형식으로 참조

**해결방법**:
- 두 형식 모두 지원하도록 수정 (OR 연산자 사용)
- `productInfo.subscription_price_6year || productInfo.subscription_price_6y`

**수정된 파일**:
- `server/src/agents/SubscriptionAgent.js`
- `server/src/agents/PurchaseAgent.js`

---

### 2. 안내봇 질문 반복 문제 ✅
**문제**: 안내봇이 계속 비슷한 질문만 반복함

**원인**:
- 질문 히스토리 추적 메커니즘 부재
- 이전 질문을 기억하지 못함

**해결방법**:
- `ModeratorAgent`에 질문 히스토리 Map 추가
- 세션별로 최대 20개의 질문 기억
- 생성 시 이전 질문 목록을 프롬프트에 포함

**구현 내용**:
```javascript
// 질문 히스토리 관리
this.questionHistory = new Map(); // sessionId -> Set of questions
this.maxQuestionHistory = 20;

// 중복 방지 로직
getSessionQuestions(sessionId)
addQuestionToHistory(sessionId, question)
```

**수정된 파일**:
- `server/src/agents/ModeratorAgent.js`
- `server/src/services/AgentOrchestrator.js`

---

### 3. GUI 스트리밍 미작동 문제 ✅
**문제**: 스트리밍이 활성화되어 있음에도 GUI에서 작동하지 않음

**원인**:
- 클라이언트가 `data.type === 'stream'` 이벤트를 처리하지 않음
- SSE 스트림 타입 핸들러 누락

**해결방법**:
- ChatbotWindow 컴포넌트에 스트림 이벤트 핸들러 추가
- 같은 에이전트의 메시지는 기존 메시지에 추가
- 다른 에이전트의 메시지는 새 메시지로 생성

**구현 내용**:
```typescript
else if (data.type === 'stream') {
  // 청크 단위로 메시지 업데이트
  setMessages(prev => {
    const lastMessage = prev[prev.length - 1];
    if (lastMessage && lastMessage.agent === data.agent) {
      // 같은 에이전트면 내용 추가
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content: lastMessage.content + data.content
      };
    } else {
      // 새로운 에이전트면 새 메시지 생성
      return [...prev, {
        agent: data.agent,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString()
      }];
    }
  });
}
```

**수정된 파일**:
- `src/components/ChatbotWindow.tsx`

---

## 테스트 체크리스트

### 구독료 표시 테스트
- [x] SubscriptionAgent 프롬프트에서 구독료 정상 표시
- [x] PurchaseAgent에서 구독료 비교 정상 작동

### 질문 다양성 테스트
- [x] 안내봇이 이전과 다른 질문 생성
- [x] 세션별 질문 히스토리 독립적 관리
- [x] 20개 제한 이후 오래된 질문 삭제

### 스트리밍 테스트
- [x] Exaone 스트리밍 응답 실시간 표시
- [x] 에이전트별 메시지 올바르게 구분
- [x] 청크 단위 텍스트 누적 정상 작동

---

## 성능 개선 효과

1. **데이터 정확성**: 구독료 정보가 올바르게 표시되어 정확한 비교 가능
2. **사용자 경험**: 다양한 질문으로 더 자연스러운 대화 흐름
3. **응답 속도**: 스트리밍으로 체감 대기 시간 감소

---

## 추가 권장사항

1. **캐싱 구현**: 자주 사용되는 제품 정보 캐싱
2. **에러 리커버리**: 스트리밍 중단 시 폴백 메커니즘
3. **분석 도구**: 질문 효과성 분석을 위한 로깅

---

## 배포 전 확인사항

- ✅ 모든 환경 변수 설정 확인
- ✅ 스트리밍 지원 브라우저 확인
- ✅ 세션 관리 정상 작동
- ✅ 메모리 사용량 모니터링 (질문 히스토리)