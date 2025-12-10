# v4: 회사별 로그인 및 권한 관리 기능

## 개요
회사별로 서비스를 판매하기 위한 로그인/회원관리 시스템

## 사용자 구조

```
회사 (Company)
├── 관리자 (Admin) - 1명 이상
│   ├── 회원 초대 가능
│   ├── 가입 승인/거절 가능
│   └── 회원 관리 가능
└── 일반 회원 (Member) - N명
    └── 서류 작성 기능만 사용
```

## 가입 플로우

### 방법 1: 관리자가 초대
```
관리자가 이메일로 초대 → 초대 링크 발송 → 회원이 링크 클릭 → 비밀번호 설정 → 가입 완료
```

### 방법 2: 회원이 직접 가입 신청
```
회원이 회사 코드로 가입 신청 → 관리자에게 알림 → 관리자 승인/거절 → 승인 시 가입 완료
```

## 데이터 모델

### Company (회사)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| name | string | 회사명 |
| code | string | 회사 고유 코드 (가입 시 사용) |
| created_at | datetime | 생성일 |

### User (사용자)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | string | 이메일 (로그인 ID) |
| password | string | 비밀번호 (해시) |
| name | string | 이름 |
| company_id | UUID | FK → Company |
| role | enum | 'admin' / 'member' |
| status | enum | 'pending' / 'active' / 'inactive' |
| created_at | datetime | 생성일 |

### Invitation (초대)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | string | 초대 이메일 |
| company_id | UUID | FK → Company |
| invited_by | UUID | FK → User (관리자) |
| token | string | 초대 토큰 |
| expires_at | datetime | 만료일 |
| used | boolean | 사용 여부 |

## 화면 구성

### 1. 로그인 페이지
- 이메일/비밀번호 입력
- 회원가입 링크
- 비밀번호 찾기

### 2. 회원가입 페이지
- 회사 코드 입력
- 이메일/비밀번호/이름 입력
- 가입 신청 → 관리자 승인 대기

### 3. 관리자 대시보드
- 가입 승인 대기 목록
- 회원 목록 관리
- 초대 링크 생성

## 기술 스택

### Backend
- FastAPI
- PostgreSQL
- JWT 인증

### Frontend
- React (기존)
- 로그인 상태 관리 (Context 또는 Zustand)
- Protected Route

## 결정사항

1. **최초 회사/관리자 계정** → 회원가입으로 생성
2. **비밀번호 찾기** → 불필요
3. **요금제/결제** → 프로토타입이라 지금 구현 안함
4. **소셜 로그인** → 버튼만 만들어두기 (Google, Kakao)

## 프로토타입 범위

### 구현할 것
- 회원가입 (회사 생성 + 관리자 계정)
- 로그인/로그아웃
- 관리자: 회원 초대, 가입 승인/거절, 회원 목록
- 일반 회원: 서류 작성 기능 사용
- 소셜 로그인 버튼 (UI만)

### 나중에 구현
- 실제 소셜 로그인 연동
- 요금제/결제 시스템
