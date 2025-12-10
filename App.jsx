import React, { useState, useEffect } from 'react';

export default function App() {
  // 현재 단계 (1: 제안, 2: 계약, 3: 착수, 4: 완료)
  const [currentStep, setCurrentStep] = useState(1);
  
  // 기본 데이터
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('contractFormData');
    return saved ? JSON.parse(saved) : {
      // 제안 단계
      과업명: '',
      예산_숫자: '',
      예산_한글: '',
      수행기간_시작: '',
      수행기간_종료: '',
      간단한설명: '',
      대상: '',
      예상결과물: '',
      과업목적: '',
      과업범위및내용: '',
      수행방법: '',
      일정계획: '',
      
      // 계약 정보
      계약건명: '',
      계약금액_숫자: '',
      계약금액_한글: '',
      계약년월일: '',
      착수년월일: '',
      완료년월일: '',
      
      // 회사 정보
      상호: '주식회사 위니브',
      주소: '제주도 제주시 구산로 58, 2층',
      대표자: '이호준',
      
      // 제출일
      제출년: '2025',
      제출월: '',
      제출일: '',
    };
  });

  // 참여연구원
  const [researchers, setResearchers] = useState(() => {
    const saved = localStorage.getItem('contractResearchers');
    return saved ? JSON.parse(saved) : [
      { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' },
    ];
  });

  // 현재 선택된 문서
  const [selectedDoc, setSelectedDoc] = useState('과업지시서');
  
  // AI 생성 중
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem('contractFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('contractResearchers', JSON.stringify(researchers));
  }, [researchers]);

  // 단계별 문서
  const stepDocuments = {
    1: [{ id: '과업지시서', name: '과업지시서' }],
    2: [{ id: '계약서', name: '계약서' }],
    3: [
      { id: '착수계', name: '착수계' },
      { id: '인력투입계획서', name: '인력투입계획서' },
      { id: '공정예정표', name: '공정예정표' },
      { id: '책임연구원선임계', name: '책임연구원 선임계' },
      { id: '보안각서', name: '보안각서' },
    ],
    4: [
      { id: '완료계', name: '완료계' },
      { id: '완료검사원', name: '완료검사원' },
      { id: '완료내역서', name: '완료내역서' },
    ],
  };

  const steps = [
    { id: 1, name: '제안', icon: '📝' },
    { id: 2, name: '계약', icon: '📋' },
    { id: 3, name: '착수', icon: '🚀' },
    { id: 4, name: '완료', icon: '✅' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateResearcher = (index, field, value) => {
    const updated = [...researchers];
    updated[index][field] = value;
    setResearchers(updated);
  };

  const addResearcher = () => {
    setResearchers([...researchers, { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' }]);
  };

  const removeResearcher = (index) => {
    if (researchers.length > 1) {
      setResearchers(researchers.filter((_, i) => i !== index));
    }
  };

  // AI 생성 (OpenAI API 연동 필요)
  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    
    // TODO: OpenAI API 연동
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        과업목적: `${prev.과업명}의 성공적인 수행을 위하여 본 용역을 추진함.`,
        과업범위및내용: `1. ${prev.과업명} 기획 및 설계\n2. ${prev.과업명} 개발 및 구현\n3. 테스트 및 품질 관리\n4. 최종 산출물 납품`,
        수행방법: `1. 착수 단계: 요구사항 분석 및 기획\n2. 실행 단계: 개발 및 구현\n3. 완료 단계: 테스트 및 납품`,
        일정계획: `${prev.수행기간_시작} ~ ${prev.수행기간_종료}`,
      }));
      setIsGeneratingAI(false);
    }, 1500);
  };

  // 다음 단계로
  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setSelectedDoc(stepDocuments[currentStep + 1][0].id);
    }
  };

  // ========== 문서 미리보기 ==========
  
  const A4Page = ({ children }) => (
    <div style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      padding: '25mm', 
      boxSizing: 'border-box',
      backgroundColor: 'white',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }}>
      {children}
    </div>
  );

  const 과업지시서Preview = () => (
    <>
      {/* 표지 */}
      <A4Page>
        <div style={{ 
          height: '100%',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontFamily: "'Nanum Myeongjo', serif"
        }}>
          <div style={{ fontSize: '16pt', marginBottom: '60px' }}>「{formData.과업명 || '(과업명)'}」 용역</div>
          <div style={{ fontSize: '32pt', fontWeight: 'bold', marginBottom: '80px' }}>과업지시서</div>
          <div style={{ fontSize: '16pt' }}>{formData.상호}</div>
        </div>
      </A4Page>
      
      {/* 본문 */}
      <A4Page>
        <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.8' }}>
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '20px', paddingTop: '10px', borderTop: '2px solid black' }}>1. 과업개요</h2>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>가. 과업명</div>
            <div style={{ paddingLeft: '20px' }}>{formData.과업명 || '(입력 필요)'}</div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>나. 과업예산</div>
            <div style={{ paddingLeft: '20px' }}>금 {formData.예산_숫자 || '______'}원 (금 {formData.예산_한글 || '______'}원)</div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>다. 과업목적</div>
            <div style={{ paddingLeft: '20px' }}>{formData.과업목적 || '(AI 생성 또는 직접 입력)'}</div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>라. 수행기간</div>
            <div style={{ paddingLeft: '20px' }}>{formData.수행기간_시작 || '20  .   .   .'} ~ {formData.수행기간_종료 || '20  .   .   .'}</div>
          </div>
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '20px', marginTop: '30px' }}>2. 과업범위 및 내용</h2>
          <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.과업범위및내용 || '(AI 생성 또는 직접 입력)'}</div>
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '20px', marginTop: '30px' }}>3. 수행방법</h2>
          <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.수행방법 || '(AI 생성 또는 직접 입력)'}</div>
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '20px', marginTop: '30px' }}>4. 일정계획</h2>
          <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.일정계획 || '(AI 생성 또는 직접 입력)'}</div>
        </div>
      </A4Page>
    </>
  );

  const 계약서Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 'bold', marginBottom: '50px' }}>용역계약서</h1>
        <p style={{ fontSize: '14pt', marginBottom: '30px' }}>(계약서 내용은 발주처에서 제공)</p>
        <p style={{ color: '#666', fontSize: '12pt' }}>이 단계에서는 발주처에서 제공한 계약서를 확인하고<br/>계약 정보를 다음 단계 서류에 반영합니다.</p>
      </div>
    </A4Page>
  );

  const 착수계Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
        <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>착&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계</span>
        </h1>
        <div style={{ textAlign: 'right', marginBottom: '30px', paddingRight: '40px', whiteSpace: 'pre' }}>경  유 :           (인)</div>
        <div style={{ marginBottom: '3px' }}>○ 계약건명 : {formData.계약건명 || formData.과업명 || '(입력 필요)'}</div>
        <div style={{ marginBottom: '3px' }}>○ 계약금액 : 금 {formData.계약금액_숫자 || formData.예산_숫자 || '______'}원(금 {formData.계약금액_한글 || formData.예산_한글 || '______'}원)</div>
        <div style={{ marginBottom: '3px' }}>○ 계약년월일 : {formData.계약년월일 || '20  .    .    .'}</div>
        <div style={{ marginBottom: '3px' }}>○ 착수년월일 : {formData.착수년월일 || formData.수행기간_시작 || '20  .    .    .'}</div>
        <div style={{ marginBottom: '3px' }}>○ 완료년월일 : {formData.완료년월일 || formData.수행기간_종료 || '20  .    .    .'}</div>
        <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>상기와 같이 착수계를 제출합니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년 || '20  '}년    {formData.제출월 || '  '}월    {formData.제출일 || '  '}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', marginTop: '50px', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 인력투입계획서Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.6' }}>
        <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>인&nbsp;&nbsp;력&nbsp;&nbsp;투&nbsp;&nbsp;입&nbsp;&nbsp;계&nbsp;&nbsp;획&nbsp;&nbsp;서</span>
        </h1>
        <div style={{ marginBottom: '8px' }}>1. 계약건명 : {formData.계약건명 || formData.과업명 || '(입력 필요)'}</div>
        <div style={{ marginBottom: '15px' }}>2. 계약기간 : {formData.착수년월일 || formData.수행기간_시작 || '20  .   .   .'} ~ {formData.완료년월일 || formData.수행기간_종료 || '20  .   .   .'}</div>
        <div style={{ marginBottom: '10px' }}>3. 인력투입계획서</div>
        <div style={{ marginBottom: '10px', paddingLeft: '10px' }}>○ 참여연구원</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '30px' }}>
          <thead>
            <tr>
              <th rowSpan="2" style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>기관<br/>구분</th>
              <th rowSpan="2" style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>성명</th>
              <th rowSpan="2" style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>직급</th>
              <th rowSpan="2" style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>생년월일</th>
              <th colSpan="4" style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>전공 및 학위</th>
              <th rowSpan="2" style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>담당분야</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', padding: '4px', backgroundColor: '#f5f5f5' }}>학교</th>
              <th style={{ border: '1px solid black', padding: '4px', backgroundColor: '#f5f5f5' }}>취득년도</th>
              <th style={{ border: '1px solid black', padding: '4px', backgroundColor: '#f5f5f5' }}>전공</th>
              <th style={{ border: '1px solid black', padding: '4px', backgroundColor: '#f5f5f5' }}>학위</th>
            </tr>
          </thead>
          <tbody>
            {researchers.map((r, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.기관구분}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.성명}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.직급}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.생년월일}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.학교}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.취득년도}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.전공}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.학위}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{r.담당분야}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 6 - researchers.length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(9)].map((_, j) => <td key={j} style={{ border: '1px solid black', padding: '6px', height: '28px' }}></td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>{formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 공정예정표Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.6' }}>
        <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>공&nbsp;&nbsp;정&nbsp;&nbsp;예&nbsp;&nbsp;정&nbsp;&nbsp;표</span>
        </h1>
        <div style={{ marginBottom: '8px' }}>1. 계약건명 : {formData.계약건명 || formData.과업명 || '(입력 필요)'}</div>
        <div style={{ marginBottom: '15px' }}>2. 계약기간 : {formData.착수년월일 || formData.수행기간_시작} ~ {formData.완료년월일 || formData.수행기간_종료}</div>
        <div style={{ marginBottom: '10px' }}>3. 공정예정표</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '30px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '10px', width: '30%', height: '50px', position: 'relative', background: 'linear-gradient(to left bottom, transparent calc(50% - 1px), black, transparent calc(50% + 1px))' }}>
                <span style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '10pt' }}>월 별</span>
                <span style={{ position: 'absolute', bottom: '5px', left: '5px', fontSize: '10pt' }}>연구내용</span>
              </th>
              {['8월', '9월', '10월', '11월'].map((m, i) => <th key={i} style={{ border: '1px solid black', padding: '10px', textAlign: 'center', width: '17.5%' }}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '10px', height: '40px' }}></td>
                {[...Array(4)].map((_, j) => <td key={j} style={{ border: '1px solid black', padding: '10px' }}></td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 책임연구원선임계Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.8' }}>
        <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>책임연구원(기술자)&nbsp;선임계</span>
        </h1>
        <div style={{ marginBottom: '8px' }}>1. 계약건명 : {formData.계약건명 || formData.과업명}</div>
        <div style={{ marginBottom: '8px' }}>2. 계약금액 : 금 {formData.계약금액_숫자 || formData.예산_숫자}원</div>
        <div style={{ marginBottom: '15px' }}>3. 계약기간 : {formData.착수년월일 || formData.수행기간_시작} ~ {formData.완료년월일 || formData.수행기간_종료}</div>
        <div style={{ marginBottom: '8px' }}>4. 책임연구원(기술자)</div>
        <div style={{ paddingLeft: '20px' }}>가. 성      명 : </div>
        <div style={{ paddingLeft: '20px' }}>나. 생년월일 : </div>
        <div style={{ paddingLeft: '20px' }}>다. 소      속 : </div>
        <div style={{ paddingLeft: '20px' }}>라. 직      위 : </div>
        <div style={{ paddingLeft: '20px', marginBottom: '15px' }}>마. 자격(면허)사항 : </div>
        <div style={{ textAlign: 'center', margin: '30px 0', fontSize: '12pt' }}>상기인을 본 용역의 책임연구원(기술자)으로 선임하여 제출하오며<br/>과업 수행에 따른 일체의 행위에 대하여 계약상대자로서의 책임을 집니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 보안각서Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
        <h1 style={{ textAlign: 'center', fontSize: '28pt', fontWeight: 'bold', marginBottom: '50px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>보&nbsp;&nbsp;안&nbsp;&nbsp;각&nbsp;&nbsp;서</span>
        </h1>
        <div style={{ marginBottom: '20px' }}><b>계 약 건 명 : </b>{formData.계약건명 || formData.과업명}</div>
        <div style={{ textAlign: 'justify', lineHeight: '2', marginBottom: '30px' }}>
          &nbsp;&nbsp;&nbsp;&nbsp;본인은 위 용역의 수행과 관련하여 취득한 일체의 자료와 정보에 대하여 
          용역 수행 중은 물론 용역 수행 후에도 이를 외부에 누설, 공개하거나 
          본 용역 이외의 목적으로 사용하지 않을 것을 확약하며, 
          이를 위반할 경우 관련 법령에 따른 모든 민·형사상의 책임을 질 것을 각서합니다.
        </div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '14pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '5px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '5px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '5px' }}>대 표 자 : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 완료계Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
        <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>완&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;료&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계</span>
        </h1>
        <div style={{ textAlign: 'right', marginBottom: '30px', paddingRight: '40px', whiteSpace: 'pre' }}>경  유 :           (인)</div>
        <div style={{ marginBottom: '3px' }}>❍ 용 역 명 : {formData.계약건명 || formData.과업명}</div>
        <div style={{ marginBottom: '3px' }}>❍ 계약금액 : 금 {formData.계약금액_숫자 || formData.예산_숫자}원</div>
        <div style={{ marginBottom: '3px' }}>❍ 완료금액 : 금 {formData.계약금액_숫자 || formData.예산_숫자}원</div>
        <div style={{ marginBottom: '3px' }}>❍ 계약년월일 : {formData.계약년월일}</div>
        <div style={{ marginBottom: '3px' }}>❍ 착수년월일 : {formData.착수년월일 || formData.수행기간_시작}</div>
        <div style={{ marginBottom: '3px' }}>❍ 완료예정일 : {formData.완료년월일 || formData.수행기간_종료}</div>
        <div style={{ marginBottom: '3px' }}>❍ 완료년월일 : {formData.완료년월일 || formData.수행기간_종료}</div>
        <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>상기와 같이 완료되었기에 완료계를 제출합니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년}년    {formData.제출월}월    {formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>성명(대표자) : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 완료검사원Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
        <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>완&nbsp;&nbsp;료&nbsp;&nbsp;검&nbsp;&nbsp;사&nbsp;&nbsp;원</span>
        </h1>
        <div>❍ 용 역 명 : {formData.계약건명 || formData.과업명}</div>
        <div>❍ 계약금액 : 금 {formData.계약금액_숫자 || formData.예산_숫자}원</div>
        <div>❍ 완료금액 : 금 {formData.계약금액_숫자 || formData.예산_숫자}원</div>
        <div>❍ 계약년월일 : {formData.계약년월일}</div>
        <div>❍ 착수년월일 : {formData.착수년월일 || formData.수행기간_시작}</div>
        <div>❍ 완료예정일 : {formData.완료년월일 || formData.수행기간_종료}</div>
        <div style={{ marginBottom: '15px' }}>❍ 완료년월일 : {formData.완료년월일 || formData.수행기간_종료}</div>
        <div style={{ textAlign: 'center', margin: '50px 0' }}>상기와 같이 완료되었기에 검사원을 제출합니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>성명(대표자) : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const 완료내역서Preview = () => (
    <A4Page>
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.6' }}>
        <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>완&nbsp;&nbsp;료&nbsp;&nbsp;내&nbsp;&nbsp;역&nbsp;&nbsp;서</span>
        </h1>
        <div style={{ marginBottom: '10px' }}>❍ 용 역 명 : {formData.계약건명 || formData.과업명}</div>
        <div style={{ marginBottom: '20px' }}>❍ 용역기간 : {formData.착수년월일 || formData.수행기간_시작} ~ {formData.완료년월일 || formData.수행기간_종료}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '30px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '10px', width: '10%' }}>순번</th>
              <th style={{ border: '1px solid black', padding: '10px', width: '50%' }}>항 목</th>
              <th style={{ border: '1px solid black', padding: '10px', width: '20%' }}>수량</th>
              <th style={{ border: '1px solid black', padding: '10px', width: '20%' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '10px', height: '35px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}></td>
                <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}></td>
                <td style={{ border: '1px solid black', padding: '10px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>성명(대표자) : {formData.대표자}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const renderPreview = () => {
    const previews = { 과업지시서: 과업지시서Preview, 계약서: 계약서Preview, 착수계: 착수계Preview, 인력투입계획서: 인력투입계획서Preview, 공정예정표: 공정예정표Preview, 책임연구원선임계: 책임연구원선임계Preview, 보안각서: 보안각서Preview, 완료계: 완료계Preview, 완료검사원: 완료검사원Preview, 완료내역서: 완료내역서Preview };
    const Preview = previews[selectedDoc] || 과업지시서Preview;
    return <Preview />;
  };

  // 단계별 입력 패널
  const renderInputPanel = () => {
    if (currentStep === 1) {
      return (
        <>
          <h2 className="text-lg font-bold text-slate-800 mb-4">과업지시서 작성</h2>
          <div className="mb-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">기본 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">과업명 *</label>
                <input type="text" value={formData.과업명} onChange={(e) => handleChange('과업명', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="예: 2024년 홍보영상 제작" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">예산 (숫자) *</label>
                  <input type="text" value={formData.예산_숫자} onChange={(e) => handleChange('예산_숫자', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="20000000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">예산 (한글)</label>
                  <input type="text" value={formData.예산_한글} onChange={(e) => handleChange('예산_한글', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="이천만" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">수행기간 시작 *</label>
                  <input type="text" value={formData.수행기간_시작} onChange={(e) => handleChange('수행기간_시작', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="2025. 11. 27." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">수행기간 종료 *</label>
                  <input type="text" value={formData.수행기간_종료} onChange={(e) => handleChange('수행기간_종료', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="2026. 01. 08." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">간단한 설명</label>
                <textarea value={formData.간단한설명} onChange={(e) => handleChange('간단한설명', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={2} placeholder="과업에 대한 간단한 설명" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">대상</label>
                <input type="text" value={formData.대상} onChange={(e) => handleChange('대상', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="대상 기관/기업" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">예상 결과물</label>
                <input type="text" value={formData.예상결과물} onChange={(e) => handleChange('예상결과물', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="최종 산출물" />
              </div>
            </div>
          </div>
          <div className="mb-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">AI 자동 생성</h3>
            <button onClick={handleAIGenerate} disabled={isGeneratingAI || !formData.과업명} className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50">
              {isGeneratingAI ? '생성 중...' : '🤖 AI로 생성하기'}
            </button>
            <div className="mt-4 space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">과업목적</label><textarea value={formData.과업목적} onChange={(e) => handleChange('과업목적', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={2} placeholder="AI 생성 또는 직접 입력" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">과업범위 및 내용</label><textarea value={formData.과업범위및내용} onChange={(e) => handleChange('과업범위및내용', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={4} placeholder="AI 생성 또는 직접 입력" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">수행방법</label><textarea value={formData.수행방법} onChange={(e) => handleChange('수행방법', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={4} placeholder="AI 생성 또는 직접 입력" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">일정계획</label><textarea value={formData.일정계획} onChange={(e) => handleChange('일정계획', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={3} placeholder="AI 생성 또는 직접 입력" /></div>
            </div>
          </div>
        </>
      );
    } else if (currentStep === 2) {
      return (
        <>
          <h2 className="text-lg font-bold text-slate-800 mb-4">계약 정보 입력</h2>
          <p className="text-sm text-slate-500 mb-6">계약 체결 후 정보를 입력하세요.</p>
          <div className="space-y-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">계약건명</label><input type="text" value={formData.계약건명 || formData.과업명} onChange={(e) => handleChange('계약건명', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">계약금액 (숫자)</label><input type="text" value={formData.계약금액_숫자 || formData.예산_숫자} onChange={(e) => handleChange('계약금액_숫자', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">계약금액 (한글)</label><input type="text" value={formData.계약금액_한글 || formData.예산_한글} onChange={(e) => handleChange('계약금액_한글', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">계약년월일</label><input type="text" value={formData.계약년월일} onChange={(e) => handleChange('계약년월일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="2025. 11. 27." /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">착수년월일</label><input type="text" value={formData.착수년월일 || formData.수행기간_시작} onChange={(e) => handleChange('착수년월일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">완료년월일</label><input type="text" value={formData.완료년월일 || formData.수행기간_종료} onChange={(e) => handleChange('완료년월일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">회사 정보</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">상호</label><input type="text" value={formData.상호} onChange={(e) => handleChange('상호', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">주소</label><input type="text" value={formData.주소} onChange={(e) => handleChange('주소', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">대표자</label><input type="text" value={formData.대표자} onChange={(e) => handleChange('대표자', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
          </div>
        </>
      );
    } else if (currentStep === 3) {
      return (
        <>
          <h2 className="text-lg font-bold text-slate-800 mb-4">착수 서류 작성</h2>
          <div className="mb-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">제출일</h3>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">년</label><input type="text" value={formData.제출년} onChange={(e) => handleChange('제출년', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">월</label><input type="text" value={formData.제출월} onChange={(e) => handleChange('제출월', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">일</label><input type="text" value={formData.제출일} onChange={(e) => handleChange('제출일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
          </div>
          <div className="mb-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">참여연구원</h3>
            {researchers.map((r, idx) => (
              <div key={idx} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">연구원 {idx + 1}</span>
                  {researchers.length > 1 && <button onClick={() => removeResearcher(idx)} className="text-xs text-red-500">삭제</button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={r.기관구분} onChange={(e) => updateResearcher(idx, '기관구분', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="기관구분" />
                  <input type="text" value={r.성명} onChange={(e) => updateResearcher(idx, '성명', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="성명" />
                  <input type="text" value={r.직급} onChange={(e) => updateResearcher(idx, '직급', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="직급" />
                  <input type="text" value={r.생년월일} onChange={(e) => updateResearcher(idx, '생년월일', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="생년월일" />
                  <input type="text" value={r.학교} onChange={(e) => updateResearcher(idx, '학교', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="학교" />
                  <input type="text" value={r.취득년도} onChange={(e) => updateResearcher(idx, '취득년도', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="취득년도" />
                  <input type="text" value={r.전공} onChange={(e) => updateResearcher(idx, '전공', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="전공" />
                  <input type="text" value={r.학위} onChange={(e) => updateResearcher(idx, '학위', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs" placeholder="학위" />
                  <input type="text" value={r.담당분야} onChange={(e) => updateResearcher(idx, '담당분야', e.target.value)} className="col-span-2 px-2 py-1 border border-slate-200 rounded text-xs" placeholder="담당분야" />
                </div>
              </div>
            ))}
            <button onClick={addResearcher} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs hover:border-blue-400 hover:text-blue-500">+ 연구원 추가</button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h2 className="text-lg font-bold text-slate-800 mb-4">완료 서류 작성</h2>
          <p className="text-sm text-slate-500 mb-6">용역 완료 후 제출할 서류입니다.</p>
          <div className="mb-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">제출일</h3>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">년</label><input type="text" value={formData.제출년} onChange={(e) => handleChange('제출년', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">월</label><input type="text" value={formData.제출월} onChange={(e) => handleChange('제출월', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">일</label><input type="text" value={formData.제출일} onChange={(e) => handleChange('제출일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">✅ 모든 서류가 준비되었습니다.</p>
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <span className="font-bold text-slate-800">{formData.과업명 || '새 프로젝트'}</span>
          </div>
          
          {/* 단계 표시 */}
          <div className="flex items-center gap-1">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button onClick={() => { setCurrentStep(step.id); setSelectedDoc(stepDocuments[step.id][0].id); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentStep === step.id ? 'bg-blue-500 text-white' : currentStep > step.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${currentStep === step.id ? 'bg-white text-blue-500' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-300 text-white'}`}>{currentStep > step.id ? '✓' : step.id}</span>
                  {step.name}
                </button>
                {idx < steps.length - 1 && <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-green-400' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">📥 PDF 다운로드</button>
        </div>
      </header>

      {/* 메인 */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* 입력 패널 */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-5">
          {renderInputPanel()}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button onClick={goToNextStep} disabled={currentStep === 4} className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50">
              {currentStep === 4 ? '완료' : `다음 단계로 (${steps[currentStep]?.name}) →`}
            </button>
          </div>
        </div>

        {/* 미리보기 */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">미리보기:</span>
              <div className="flex gap-2">
                {stepDocuments[currentStep].map(doc => (
                  <button key={doc.id} onClick={() => setSelectedDoc(doc.id)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedDoc === doc.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{doc.name}</button>
                ))}
              </div>
            </div>
            <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200">📥 PDF 다운로드</button>
          </div>
          <div className="flex-1 bg-slate-200 p-8 overflow-auto flex flex-col items-center gap-8">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
