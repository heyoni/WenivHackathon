# Claude Code 작업 요청서

## ⚠️ 중요: 프로토타입 그대로 사용할 것

**FullPrototype.jsx 파일을 베이스로 사용해.**
UI, 레이아웃, 스타일 모두 이 파일 그대로 가져가.
임의로 변경하지 마.

---

## 핵심 컨셉
```
[제안] ────── [계약] ────── [착수] ────── [완료]
   │            │            │            │
   ▼            ▼            ▼            ▼
과업지시서    체크리스트    착수계 외     완료계 외
(AI 생성)    (안내)       5종 서류      2종 서류
```

---

## 전달 파일

1. **FullPrototype.jsx** - ⭐ 전체 UI 프로토타입 (이거 그대로 써!)
2. **DocumentGenerator.jsx** - 문서 레이아웃 상세 (참고용)
3. **requirements_frontend.md** - 요구사항 명세서
4. **NanumMyeongjo.ttf** - 폰트 파일

---

## A4 크기 - 정확하게!

```jsx
// 미리보기 A4 - 이 스타일 그대로 사용
<div 
  style={{
    width: '210mm',           // A4 너비 정확히
    minHeight: '297mm',       // A4 높이 정확히
    padding: '25mm',          // 여백
    fontFamily: "'Nanum Myeongjo', serif",
    fontSize: '14pt',
    lineHeight: '1.8',
    transformOrigin: 'top center',
    transform: 'scale(0.6)',  // 화면에 맞게 축소
    marginBottom: '-300px'    // 축소로 인한 여백 보정
  }}
>
```

**절대로 width/height를 px나 %로 바꾸지 마. mm 단위 그대로 유지.**

---

## UI 스타일 규칙

### 색상
- 배경: `bg-gray-50` (회색 배경)
- 카드: `bg-white rounded-xl border border-gray-200`
- 버튼: `bg-blue-600 text-white rounded-lg hover:bg-blue-700`
- 진행 표시: 완료=`bg-green-500`, 현재=`bg-blue-500`, 대기=`bg-gray-200`

### 레이아웃
- 프로젝트 목록: 카드 형태, 단계 진행 바 포함
- 서류 작성 화면: 3단 구조 (입력 | 문서목록 | 미리보기)
- 입력 패널: `w-96` (384px)
- 문서 목록: `w-64` (256px)
- 미리보기: `flex-1` (나머지)

### 폰트
```css
/* 미리보기 문서용 */
font-family: 'Nanum Myeongjo', serif;

/* UI용 */
font-family: system-ui, -apple-system, sans-serif;
```

---

## 요청 방법

### 1단계: 프로젝트 셋업
```
Vite + React + Tailwind + React Router 프로젝트 만들어줘.
FullPrototype.jsx를 컴포넌트로 분리해서 구현해.
```

### 2단계: 라우팅
```
/ → 프로젝트 목록 (ProjectList)
/project/:id → 프로젝트 상세 (ProjectDetail)
/project/:id/:stage → 단계별 화면
```

### 3단계: 상태 관리
```
- 프로젝트 데이터: localStorage 저장
- 단계 간 데이터 연동 (제안 → 계약 → 착수 → 완료)
```

### 4단계: PDF 생성
```
html2pdf.js로 A4 PDF 생성
- 개별 문서 다운로드
- 단계별 일괄 다운로드
```

### 5단계: AI 연동 (선택)
```
OpenAI API로 과업지시서 자동 생성
- 사용자가 API 키 입력
- localStorage에 저장
```

---

## 절대 하지 말 것

1. ❌ A4 크기를 px나 %로 바꾸지 마
2. ❌ 프로토타입 UI를 임의로 변경하지 마
3. ❌ Tailwind 클래스를 다른 스타일로 바꾸지 마
4. ❌ 단계별 구조를 없애지 마

---

## 확인 사항

구현 후 다음 체크:
- [ ] 프로젝트 목록에서 단계 진행 바 보이는가?
- [ ] 각 단계 클릭 시 해당 화면으로 이동하는가?
- [ ] 미리보기가 A4 비율 (210mm x 297mm)인가?
- [ ] 입력한 데이터가 미리보기에 실시간 반영되는가?
- [ ] PDF 다운로드가 A4 크기로 되는가?
