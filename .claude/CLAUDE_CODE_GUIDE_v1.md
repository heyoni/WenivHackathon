# Claude Code 작업 요청서

## 프로젝트 개요
용역 서류 자동 생성 웹 서비스 개발

## 전달 파일

1. **requirements_frontend.md** - 요구사항 명세서
2. **DocumentGenerator.jsx** - 프로토타입 코드 (레이아웃 참고용)
3. **NanumMyeongjo.ttf** - 폰트 파일
4. **용역_서식_모음_산학협력단회계_.hwp** - 원본 양식 (레이아웃 참고용)

---

## 요청 내용

### 1단계: 프로젝트 셋업
```
Vite + React + Tailwind CSS 프로젝트 생성해줘.
폴더 구조는 requirements_frontend.md 9번 섹션 참고.
```

### 2단계: 레이아웃 구현
```
DocumentGenerator.jsx 프로토타입을 참고해서 
실제 컴포넌트로 분리해서 구현해줘.

- 3단 레이아웃 (입력 패널 | 문서 목록 | 미리보기)
- 기본 정보 입력 폼 (계약정보, 회사정보, 제출일)
- 참여연구원 동적 추가 폼
```

### 3단계: 문서 컴포넌트
```
Documents 폴더에 8종 문서 컴포넌트 만들어줘.
프로토타입의 각 Preview 컴포넌트 스타일 그대로 사용.

주의사항:
- 폰트: 나눔명조
- A4 크기: 210mm x 297mm
- 여백: 25mm
- 공백은 &nbsp; 사용
```

### 4단계: PDF 생성
```
html2pdf.js로 PDF 생성 기능 구현해줘.
- 개별 문서 다운로드
- 전체 문서 일괄 다운로드
```

### 5단계: 데이터 저장
```
localStorage로 입력 데이터 자동 저장/불러오기 구현해줘.
```

---

## 수정이 필요할 수 있는 부분

1. **공정예정표 월 설정**: 현재 8~11월 고정 → 계약기간에 따라 동적 생성하면 좋겠음
2. **책임연구원 정보 입력**: 현재 빈칸 → 입력 폼 추가 필요
3. **완료내역서 항목 입력**: 현재 빈칸 → 동적 입력 폼 추가 필요

---

## 실행 방법

```bash
# 프로젝트 생성
npm create vite@latest contract-docs -- --template react
cd contract-docs

# 의존성 설치
npm install
npm install -D tailwindcss postcss autoprefixer
npm install html2pdf.js

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
