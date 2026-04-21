# WeSign - 용역 계약 서류 자동화 서비스

> **"We Sign Together"** - 팀원들과 함께 실시간으로 계약 서류를 작성하고 관리하는 협업 플랫폼

## 프로젝트 소개

WeSign은 용역 계약에 필요한 서류를 **자동으로 생성**하고, **실시간 협업**을 지원하는 웹 서비스입니다.

제안서부터 완료 서류까지, 복잡한 계약 프로세스를 단계별로 안내하며 필요한 모든 서류를 손쉽게 작성할 수 있습니다.

---

## 시연 영상 / 스크린샷

### 주요 화면

1. **로그인 & 회원가입**
   - 회사 생성 또는 회사 코드로 가입
   - JWT 기반 인증

2. **문서 목록**
   - 회사별 문서 관리
   - 새 문서 생성/삭제

3. **문서 편집 (실시간 협업)**
   - 4단계 프로세스: 제안 → 계약 → 착수 → 완료
   - 동시 접속자 표시 (아바타)
   - 입력 내용 실시간 동기화

4. **A4 미리보기 & PDF 출력**
   - 실제 인쇄 품질의 미리보기
   - 브라우저 인쇄 기능으로 PDF 저장

---

## 주요 기능

### 1. 계약 서류 자동 생성
| 단계 | 서류 |
|------|------|
| 제안 | 제안서 (표지 + 본문) |
| 계약 | 계약 체크리스트, 첨부 서류 관리 |
| 착수 | 착수계, 인력투입계획서, 공정예정표, 책임연구원선임계, 보안각서 |
| 완료 | 완료계, 완료검사원, 완료내역서 |

### 2. 실시간 공동 편집
- WebSocket 기반 실시간 데이터 동기화
- 동시 접속자 표시
- 변경사항 즉시 반영

### 3. AI 자동 생성 (OpenAI API)
- 간단한 정보 입력 → AI가 제안서 내용 자동 작성
- 과업목적, 과업범위, 수행방법, 일정계획 등

### 4. 팀/회사 관리
- 회사 코드로 팀원 초대
- 관리자 승인 시스템
- 역할 기반 접근 제어 (Admin/Member)

---

## 기술 스택

### Frontend
| 기술 | 용도 |
|------|------|
| **React 18** | UI 컴포넌트 |
| **Vite 5** | 빌드 도구 |
| **Tailwind CSS 3** | 스타일링 |
| **Zustand** | 상태 관리 |
| **React Router v6** | 라우팅 |
| **Axios** | HTTP 클라이언트 |
| **WebSocket** | 실시간 통신 |

### Backend
| 기술 | 용도 |
|------|------|
| **FastAPI** | REST API 서버 |
| **PostgreSQL** | 데이터베이스 |
| **SQLAlchemy** | ORM |
| **WebSocket** | 실시간 동기화 |
| **JWT** | 인증 |
| **bcrypt** | 비밀번호 암호화 |

### 개발 도구
| 도구 | 용도 |
|------|------|
| **Claude Code (Opus 4.5)** | AI 페어 프로그래밍 |
| **VS Code** | 코드 에디터 |
| **Git/GitHub** | 버전 관리 |

---

## 실행 방법

### 1. 사전 요구사항
- Node.js 18+
- Python 3.8+
- PostgreSQL

### 2. 데이터베이스 설정
```bash
# PostgreSQL에서 데이터베이스 생성
createdb contract_db
```

### 3. 백엔드 실행
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# .env 파일 설정
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/contract_db" > .env
echo "SECRET_KEY=your-secret-key" >> .env

# 서버 실행
uvicorn app.main:app --reload
```

### 4. 프론트엔드 실행
```bash
# 프로젝트 루트에서
npm install
npm run dev
```

### 5. 브라우저 접속
```
http://localhost:5173
```

---

## 사용한 프롬프트 예시

### 프로젝트 초기 설정
```
FastAPI 백엔드와 React 프론트엔드로 용역 계약 서류 자동화 서비스를 만들어줘.
회원가입, 로그인, 회사 관리 기능이 필요해.
```

### 실시간 협업 기능
```
이제 뭘할거냐면 다른 사용자도 동시 접속이 되도록 만들거야
(선택: 같은 문서를 여러 명이 실시간 공동 편집)
```

### 기능 수정/개선
```
제안서의 A4 크기가 반응형으로 바뀌어서 화면을 줄이거나 키울때마다 움직여..
출력은 A4 크기로 잘 되는데 반응형만 수정해줘
```

### 문제 해결
```
회원가입하는데 오류가 발생했습니다.
localhost:5173 아무것도 안나와
```

---

## 프로젝트 구조

```
contract-app/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx          # 라우팅 설정
│   ├── App.jsx           # 문서 편집 페이지
│   ├── index.css         # 전역 스타일
│   ├── api/
│   │   └── client.js     # API 클라이언트
│   ├── hooks/
│   │   └── useDocumentSync.js  # WebSocket 훅
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── DocumentListPage.jsx
│   └── store/
│       └── authStore.js  # Zustand 스토어
│
└── backend/
    ├── app/
    │   ├── main.py       # FastAPI 앱
    │   ├── config.py     # 설정
    │   ├── database.py   # DB 연결
    │   ├── models.py     # SQLAlchemy 모델
    │   ├── schemas.py    # Pydantic 스키마
    │   ├── auth.py       # 인증 유틸
    │   └── routers/
    │       ├── auth.py       # 인증 API
    │       ├── members.py    # 멤버 관리 API
    │       └── documents.py  # 문서 API + WebSocket
    └── requirements.txt
```

---

## 느낀점

### Claude Code 활용 경험

1. **빠른 프로토타이핑**
   - 복잡한 기능도 대화하듯 요청하면 구현됨
   - 에러 발생 시 로그를 공유하면 즉시 해결

2. **CLAUDE.md 컨벤션의 중요성**
   - 복잡한 기능은 먼저 가이드 문서 작성 후 승인받는 프로세스
   - 계획 없이 바로 구현하면 방향이 틀어질 수 있음

3. **실시간 협업 기능 구현**
   - WebSocket 연동이 생각보다 복잡했음
   - 백엔드-프론트엔드 동시 수정이 필요한 작업

4. **버전 호환성 이슈**
   - bcrypt 5.0 + passlib 호환 문제 → bcrypt 4.0.1로 다운그레이드
   - 라이브러리 버전 충돌은 AI도 바로 해결해줌

### 개선하고 싶은 점

- 충돌 해결 로직 (현재는 Last Write Wins)
- 커서 위치 공유 (누가 어디를 편집 중인지)
- 오프라인 지원
- 문서 버전 히스토리

---

## 라이선스

MIT License

---

## 팀 정보

- **해커톤**: 위니브 해커톤 2025
- **서비스명**: WeSign
- **개발 도구**: Claude Code (Opus 4.5)
