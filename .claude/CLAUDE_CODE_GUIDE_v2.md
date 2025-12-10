# Claude Code 작업 요청서

## 프로젝트 개요
용역 서류 자동 생성 웹 서비스 - **제안 → 계약 → 착수 → 완료** 단계별 관리

## 핵심 컨셉
```
[제안] ────── [계약] ────── [착수] ────── [완료]
   │            │            │            │
   ▼            ▼            ▼            ▼
과업지시서    체크리스트    착수계 외     완료계 외
(AI 생성)    (안내)       5종 서류      2종 서류
```

## 전달 파일

1. **requirements_frontend.md** - 요구사항 명세서 (단계별 구조 포함)
2. **DocumentGenerator.jsx** - 프로토타입 코드 (문서 레이아웃 참고용)
3. **NanumMyeongjo.ttf** - 폰트 파일
4. **용역_서식_모음_산학협력단회계_.hwp** - 원본 양식 (레이아웃 참고용)

---

## 요청 내용

### 1단계: 프로젝트 셋업
```
Vite + React + Tailwind CSS + React Router 프로젝트 생성해줘.
requirements_frontend.md 7번 섹션의 폴더 구조 참고.
```

### 2단계: 프로젝트 목록/상세 화면
```
- 메인: 프로젝트 목록 (카드 형태)
- 상세: 단계 진행 표시 (제안→계약→착수→완료)
- 단계 클릭 시 해당 단계 서류 목록 표시

requirements_frontend.md 4번 섹션 화면 구성 참고.
```

### 3단계: 단계별 화면 구현
```
[제안 단계]
- 과업지시서 입력 폼 (과업명, 예산, 기간, 설명 등)
- AI 생성 버튼 (OpenAI API 연동)
- AI 결과 편집 가능
- 과업지시서 미리보기

[계약 단계]
- 체크리스트 형태 (서류 준비 확인용)
- 계약금액, 계약년월일 입력

[착수 단계]
- 6종 서류: 착수계, 인력투입계획서, 공정예정표, 책임연구원선임계, 보안각서
- DocumentGenerator.jsx 프로토타입 레이아웃 그대로 사용

[완료 단계]
- 3종 서류: 완료계, 완료검사원, 완료내역서
- DocumentGenerator.jsx 프로토타입 레이아웃 그대로 사용
```

### 4단계: 데이터 연동
```
- 제안 단계에서 입력한 과업명, 예산 → 이후 단계에 자동 적용
- 계약 단계에서 입력한 계약금액, 계약일 → 착수/완료 단계에 자동 적용
- localStorage에 프로젝트 데이터 저장
```

### 5단계: PDF 생성
```
html2pdf.js로 PDF 생성.
- 개별 문서 다운로드
- 단계별 서류 일괄 다운로드
```

---

## 중요한 포인트

### 1. 단계별 흐름
- 프로젝트 생성 → 제안 단계부터 시작
- 각 단계 완료 후 다음 단계로 이동
- 단계별 상태 표시 (현재 단계, 완료된 단계)

### 2. 데이터 연동
```javascript
// 예시: 제안 → 착수 데이터 흐름
제안.과업명 → 착수.계약건명
제안.예산 → 계약.계약금액 → 착수.계약금액
제안.기간 → 착수.착수년월일, 완료년월일
```

### 3. AI 과업지시서 (제안 단계)
```
- 사용자가 간단한 정보 입력
- AI가 과업목적, 범위, 방법, 일정 생성
- 생성 결과 편집 가능
- 과업지시서 문서로 미리보기/PDF 출력
```

### 4. 문서 레이아웃
```
DocumentGenerator.jsx의 각 Preview 컴포넌트 스타일 그대로 사용.
- 폰트: 나눔명조
- A4 크기: 210mm x 297mm
- 여백: 25mm
- 공백: &nbsp; 사용
```

---

## 실행 방법

```bash
# 프로젝트 생성
npm create vite@latest contract-docs -- --template react
cd contract-docs

# 의존성 설치
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom html2pdf.js

# Tailwind 설정
npx tailwindcss init -p

# 개발 서버 실행
npm run dev
```

---

## 배포

Vercel 또는 Netlify에 정적 배포
```bash
npm run build
# dist 폴더를 배포
```
