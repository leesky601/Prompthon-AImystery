# Windows 환경에서 LG 챗봇 실행하기

## 📋 사전 준비사항

### 1. 필수 소프트웨어 설치
- **Node.js** (v18 이상): [https://nodejs.org](https://nodejs.org) 에서 LTS 버전 다운로드
- **Git for Windows**: [https://git-scm.com/download/win](https://git-scm.com/download/win)
- **Visual Studio Code** (권장): [https://code.visualstudio.com](https://code.visualstudio.com)

### 2. Azure 계정 및 서비스
- Azure OpenAI Service 키
- Azure Cognitive Search 키
- Azure Storage 연결 문자열

## 🚀 설치 및 실행 방법

### 방법 1: 자동 실행 (권장) - CMD 또는 PowerShell

1. **프로젝트 클론**
```cmd
git clone https://github.com/leesky601/Prompthon-AImystery.git
cd Prompthon-AImystery
git checkout genspark_ai_developer
```

2. **환경 변수 설정**
```cmd
# Backend 환경 변수 복사
copy server\.env.example server\.env

# Frontend 환경 변수 복사  
copy .env.example .env.local
```

3. **환경 변수 편집**
- `server\.env` 파일을 메모장이나 VS Code로 열어서 Azure 키 입력
- `.env.local` 파일 확인 (수정 불필요)

4. **자동 실행 스크립트 실행**
```cmd
start.bat
```

### 방법 2: 수동 실행

1. **의존성 설치**
```cmd
# Frontend 의존성
npm install

# Backend 의존성
cd server
npm install
cd ..
```

2. **PM2 설치** (전역)
```cmd
npm install -g pm2
npm install -g pm2-windows-startup
```

3. **서비스 시작**
```cmd
pm2 start ecosystem.config.js
```

### 방법 3: 개발 모드로 실행 (PM2 없이)

**터미널 1 - Backend 실행:**
```cmd
cd server
npm start
```

**터미널 2 - Frontend 실행:**
```cmd
npm run dev
```

## 📁 환경 변수 설정

### server\.env 파일
```env
# Azure OpenAI 설정
AZURE_OPENAI_API_KEY=여기에_Azure_OpenAI_API_키_입력
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4-mini

# Azure Search 설정
AZURE_SEARCH_API_KEY=여기에_Azure_Search_API_키_입력
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net

# Azure Storage 설정
AZURE_STORAGE_CONNECTION_STRING=여기에_Storage_연결_문자열_입력

# 서버 설정
PORT=4000
SESSION_SECRET=your-secret-key-change-in-production
```

### .env.local 파일
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🌐 서비스 접속

브라우저에서 다음 주소로 접속:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/health

## 🛠 PM2 명령어 (Windows)

```cmd
# 서비스 상태 확인
pm2 status

# 로그 보기
pm2 logs

# 특정 서비스 로그
pm2 logs lg-chatbot-api
pm2 logs lg-chatbot-frontend

# 서비스 재시작
pm2 restart all

# 서비스 중지
pm2 stop all

# PM2 프로세스 삭제
pm2 delete all

# Windows 시작 시 자동 실행 설정
pm2 save
pm2-startup install
```

## 🚨 문제 해결

### 1. Node.js 버전 확인
```cmd
node --version
```
v18 이상이어야 합니다.

### 2. npm 캐시 정리
```cmd
npm cache clean --force
```

### 3. 포트 충돌 해결

**사용 중인 포트 확인:**
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

**프로세스 종료:**
```cmd
taskkill /PID [프로세스_ID] /F
```

### 4. PM2가 실행되지 않는 경우
```cmd
# PM2 재설치
npm uninstall -g pm2
npm install -g pm2
npm install -g pm2-windows-startup

# 관리자 권한으로 CMD 실행 후
pm2 start ecosystem.config.js
```

### 5. PowerShell 실행 정책 오류
관리자 권한으로 PowerShell 실행 후:
```powershell
Set-ExecutionPolicy RemoteSigned
```

### 6. Azure 연결 오류
- `.env` 파일의 Azure 키와 엔드포인트 확인
- Azure 서비스가 활성화되어 있는지 확인
- 방화벽이 Azure 서비스 접근을 차단하지 않는지 확인

## 📝 개발 팁

### VS Code 추천 확장 프로그램
- ESLint
- Prettier
- Azure Tools
- Thunder Client (API 테스트)

### 디버깅
VS Code에서 `F5`키로 디버깅 시작 (launch.json 설정 필요)

### Git Bash 사용
Windows에서도 Unix 명령어를 사용하려면 Git Bash 사용 권장

## 📞 지원

문제가 계속되면 다음 정보와 함께 문의:
- Node.js 버전 (`node --version`)
- npm 버전 (`npm --version`)
- 오류 메시지 스크린샷
- `pm2 logs` 출력 내용