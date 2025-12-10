import React, { useState } from 'react';

export default function DocumentGenerator() {
  // 공통 데이터 (한 번 입력하면 모든 양식에 적용)
  const [formData, setFormData] = useState({
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
  });

  const [previewDoc, setPreviewDoc] = useState('착수계');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 참여연구원 데이터
  const [researchers, setResearchers] = useState([
    { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' },
    { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' },
    { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' },
  ]);

  const updateResearcher = (index, field, value) => {
    const updated = [...researchers];
    updated[index][field] = value;
    setResearchers(updated);
  };

  const addResearcher = () => {
    setResearchers([...researchers, { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' }]);
  };

  const documents = [
    { id: '착수계', name: '착수계', status: 'ready' },
    { id: '인력투입계획서', name: '인력투입계획서', status: 'ready' },
    { id: '공정예정표', name: '공정예정표', status: 'ready' },
    { id: '책임연구원선임계', name: '책임연구원(기술자) 선임계', status: 'ready' },
    { id: '보안각서', name: '보안각서', status: 'ready' },
    { id: '완료계', name: '완료계', status: 'ready' },
    { id: '완료검사원', name: '완료검사원', status: 'ready' },
    { id: '완료내역서', name: '완료내역서', status: 'ready' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    // PDF 생성 로직
    setTimeout(() => {
      setIsGenerating(false);
      alert('PDF 생성 완료! (실제로는 다운로드됨)');
    }, 2000);
  };

  // 착수계 미리보기 컴포넌트
  const 착수계Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
      <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>착&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계</span>
      </h1>
      
      <div style={{ textAlign: 'right', marginBottom: '30px', paddingRight: '40px', whiteSpace: 'pre' }}>
        경  유 :           (인)
      </div>
      
      <div style={{ marginBottom: '3px' }}>○ 계약건명 : {formData.계약건명 || '(입력 필요)'}</div>
      <div style={{ marginBottom: '3px' }}>○ 계약금액 : 금 {formData.계약금액_숫자 || '______'}원(금 {formData.계약금액_한글 || '______'}원)</div>
      <div style={{ marginBottom: '3px' }}>○ 계약년월일 : {formData.계약년월일 || '20  .    .    .'}</div>
      <div style={{ marginBottom: '3px' }}>○ 착수년월일 : {formData.착수년월일 || '20  .    .    .'}</div>
      <div style={{ marginBottom: '3px' }}>○ 완료년월일 : {formData.완료년월일 || '20  .    .    .'}</div>
      
      <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>
        상기와 같이 착수계를 제출합니다.
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        {formData.제출년 || '20  '}년    {formData.제출월 || '  '}월    {formData.제출일 || '  '}일
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'left', marginTop: '50px', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  // 완료계 미리보기
  const 완료계Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
      <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>완&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;료&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계</span>
      </h1>
      
      <div style={{ textAlign: 'right', marginBottom: '30px', paddingRight: '40px', whiteSpace: 'pre' }}>
        경  유 :           (인)
      </div>
      
      <div style={{ marginBottom: '3px' }}>❍ 용 역 명 : {formData.계약건명 || '(입력 필요)'}</div>
      <div style={{ marginBottom: '3px' }}>❍ 계약금액 : 금 {formData.계약금액_숫자 || '______'}원(금 {formData.계약금액_한글 || '______'}원)</div>
      <div style={{ marginBottom: '3px' }}>❍ 완료금액 : 금 {formData.계약금액_숫자 || '______'}원(금 {formData.계약금액_한글 || '______'}원)</div>
      <div style={{ marginBottom: '3px' }}>❍ 계약년월일 : {formData.계약년월일 || '20  년  월  일'}</div>
      <div style={{ marginBottom: '3px' }}>❍ 착수년월일 : {formData.착수년월일 || '20  년  월  일'}</div>
      <div style={{ marginBottom: '3px' }}>❍ 완료예정일 : {formData.완료년월일 || '20  년  월  일'}</div>
      <div style={{ marginBottom: '3px' }}>❍ 완료년월일 : {formData.완료년월일 || '20  년  월  일'}</div>
      
      <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>
        상기와 같이 완료되었기에 완료계를 제출합니다.
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        {formData.제출년 || '20  '}년    {formData.제출월 || '  '}월    {formData.제출일 || '  '}일
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '3px' }}>성명(대표자) : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'left', marginTop: '50px', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  // 인력투입계획서 미리보기
  const 인력투입계획서Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.6' }}>
      <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', marginBottom: '40px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>인&nbsp;&nbsp;력&nbsp;&nbsp;투&nbsp;&nbsp;입&nbsp;&nbsp;계&nbsp;&nbsp;획&nbsp;&nbsp;서</span>
      </h1>
      
      <div style={{ marginBottom: '8px' }}>1. 계약건명 : {formData.계약건명 || '(입력 필요)'}</div>
      <div style={{ marginBottom: '15px' }}>2. 계약기간 : {formData.착수년월일 || '20  .   .   .'} ~ {formData.완료년월일 || '20  .   .   .'}</div>
      <div style={{ marginBottom: '10px' }}>3. 인력투입계획서</div>
      <div style={{ marginBottom: '10px', paddingLeft: '10px' }}>○ 참여연구원</div>
      
      {/* 표 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5', width: '60px' }}>기관<br/>구분</th>
            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5', width: '70px' }}>성명</th>
            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5', width: '50px' }}>직급<br/>(위)</th>
            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5', width: '80px' }}>생년월일</th>
            <th colSpan="4" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>전공 및 학위</th>
            <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5', width: '80px' }}>과제<br/>담당<br/>분야</th>
          </tr>
          <tr>
            <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>학교</th>
            <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>취득<br/>년도</th>
            <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>전공</th>
            <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f5f5f5' }}>학위</th>
          </tr>
        </thead>
        <tbody>
          {researchers.map((r, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid black', padding: '8px', height: '30px', textAlign: 'center' }}>{r.기관구분}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.성명}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.직급}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.생년월일}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.학교}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.취득년도}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.전공}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.학위}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.담당분야}</td>
            </tr>
          ))}
          {/* 빈 행 추가 (최소 8행 유지) */}
          {[...Array(Math.max(0, 8 - researchers.length))].map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ border: '1px solid black', padding: '8px', height: '30px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* 날짜 */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
        {formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일
      </div>
      
      {/* 서명 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      {/* 수신자 */}
      <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  // 공정예정표 미리보기
  const 공정예정표Preview = () => {
    const months = ['8월', '9월', '10월', '11월'];
    
    return (
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.6' }}>
        <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', marginBottom: '40px' }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>공&nbsp;&nbsp;정&nbsp;&nbsp;예&nbsp;&nbsp;정&nbsp;&nbsp;표</span>
        </h1>
        
        <div style={{ marginBottom: '8px' }}>1. 계약건명 : {formData.계약건명 || '(입력 필요)'}</div>
        <div style={{ marginBottom: '15px' }}>2. 계약기간 : {formData.착수년월일 || '20  .   .   .'} ~ {formData.완료년월일 || '20  .   .   .'}</div>
        <div style={{ marginBottom: '10px' }}>3. 공정예정표</div>
        
        {/* 표 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '30px' }}>
          <thead>
            <tr>
              <th style={{ 
                border: '1px solid black', 
                padding: '10px', 
                width: '30%',
                height: '50px',
                position: 'relative',
                background: 'linear-gradient(to left bottom, transparent calc(50% - 1px), black, transparent calc(50% + 1px))'
              }}>
                <span style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '10pt' }}>월 별</span>
                <span style={{ position: 'absolute', bottom: '5px', left: '5px', fontSize: '10pt' }}>연구내용</span>
              </th>
              {months.map((month, i) => (
                <th key={i} style={{ border: '1px solid black', padding: '10px', textAlign: 'center', width: '17.5%' }}>
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '10px', height: '40px' }}></td>
                {months.map((_, j) => (
                  <td key={j} style={{ border: '1px solid black', padding: '10px' }}></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* 날짜 */}
        <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
          {formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일
        </div>
        
        {/* 서명 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
          </div>
        </div>
        
        {/* 수신자 */}
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>
          제주대학교 산학협력단 계약관 귀하
        </div>
      </div>
    );
  };

  // 책임연구원 선임계 미리보기
  const 책임연구원선임계Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.8' }}>
      <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', marginBottom: '40px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>책임연구원(기술자)&nbsp;선임계</span>
      </h1>
      
      <div style={{ marginBottom: '8px' }}>1. 계약건명 : {formData.계약건명 || '(입력 필요)'}</div>
      <div style={{ marginBottom: '8px' }}>2. 계약금액 : 금 {formData.계약금액_숫자 || '______'}원(금 {formData.계약금액_한글 || '______'}원)</div>
      <div style={{ marginBottom: '15px' }}>3. 계약기간 : {formData.착수년월일 || '20  .   .   .'} ~ {formData.완료년월일 || '20  .   .   .'}</div>
      
      <div style={{ marginBottom: '8px' }}>4. 책임연구원(기술자)</div>
      <div style={{ paddingLeft: '20px', marginBottom: '5px' }}>가. 성      명 : </div>
      <div style={{ paddingLeft: '20px', marginBottom: '5px' }}>나. 생년월일 : </div>
      <div style={{ paddingLeft: '20px', marginBottom: '5px' }}>다. 소      속 : </div>
      <div style={{ paddingLeft: '20px', marginBottom: '5px' }}>라. 직      위 : </div>
      <div style={{ paddingLeft: '20px', marginBottom: '15px' }}>마. 자격(면허)사항 : </div>
      
      <div style={{ textAlign: 'center', margin: '30px 0', fontSize: '12pt', lineHeight: '1.6' }}>
        상기인을 본 용역의 책임연구원(기술자)으로 선임하여 제출하오며<br/>
        과업 수행에 따른 일체의 행위에 대하여 계약상대자로서의 책임을 집니다.
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
        {formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '3px' }}>대 표 자 : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  // 보안각서 미리보기
  const 보안각서Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
      <h1 style={{ textAlign: 'center', fontSize: '28pt', fontWeight: 'bold', marginBottom: '50px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>보&nbsp;&nbsp;안&nbsp;&nbsp;각&nbsp;&nbsp;서</span>
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold' }}>계 약 건 명 : </span>{formData.계약건명 || '(입력 필요)'}
      </div>
      
      <div style={{ textAlign: 'justify', lineHeight: '2', marginBottom: '30px' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;본인은 위 용역의 수행과 관련하여 취득한 일체의 자료와 정보에 대하여 
        용역 수행 중은 물론 용역 수행 후에도 이를 외부에 누설, 공개하거나 
        본 용역 이외의 목적으로 사용하지 않을 것을 확약하며, 
        이를 위반할 경우 관련 법령에 따른 모든 민·형사상의 책임을 질 것을 각서합니다.
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '50px' }}>
        {formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '14pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '5px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '5px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '5px' }}>대 표 자 : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  // 완료검사원 미리보기
  const 완료검사원Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14pt', lineHeight: '1.8' }}>
      <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>완&nbsp;&nbsp;료&nbsp;&nbsp;검&nbsp;&nbsp;사&nbsp;&nbsp;원</span>
      </h1>
      
      <div style={{ marginBottom: '5px' }}>❍ 용 역 명 : {formData.계약건명 || '(입력 필요)'}</div>
      <div style={{ marginBottom: '5px' }}>❍ 계약금액 : 금 {formData.계약금액_숫자 || '______'}원(금 {formData.계약금액_한글 || '______'}원)</div>
      <div style={{ marginBottom: '5px' }}>❍ 완료금액 : 금 {formData.계약금액_숫자 || '______'}원(금 {formData.계약금액_한글 || '______'}원)</div>
      <div style={{ marginBottom: '5px' }}>❍ 계약년월일 : {formData.계약년월일 || '20  년  월  일'}</div>
      <div style={{ marginBottom: '5px' }}>❍ 착수년월일 : {formData.착수년월일 || '20  년  월  일'}</div>
      <div style={{ marginBottom: '5px' }}>❍ 완료예정일 : {formData.완료년월일 || '20  년  월  일'}</div>
      <div style={{ marginBottom: '15px' }}>❍ 완료년월일 : {formData.완료년월일 || '20  년  월  일'}</div>
      
      <div style={{ textAlign: 'center', margin: '50px 0' }}>
        상기와 같이 완료되었기에 검사원을 제출합니다.
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        {formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '3px' }}>성명(대표자) : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  // 완료내역서 미리보기
  const 완료내역서Preview = () => (
    <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '13pt', lineHeight: '1.6' }}>
      <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
        <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>완&nbsp;&nbsp;료&nbsp;&nbsp;내&nbsp;&nbsp;역&nbsp;&nbsp;서</span>
      </h1>
      
      <div style={{ marginBottom: '10px' }}>❍ 용 역 명 : {formData.계약건명 || '(입력 필요)'}</div>
      <div style={{ marginBottom: '20px' }}>❍ 용역기간 : {formData.착수년월일 || '20  .   .   .'} ~ {formData.완료년월일 || '20  .   .   .'}</div>
      
      {/* 표 */}
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
      
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
        {formData.제출년 || '20  '}년&nbsp;&nbsp;{formData.제출월 || '  '}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일 || '  '}일
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
        <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
          <div style={{ marginBottom: '3px' }}>주    소 : {formData.주소}</div>
          <div style={{ marginBottom: '3px' }}>상    호 : {formData.상호}</div>
          <div style={{ marginBottom: '3px' }}>성명(대표자) : {formData.대표자}       (인)</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>
        제주대학교 산학협력단 계약관 귀하
      </div>
    </div>
  );

  const renderPreview = () => {
    switch(previewDoc) {
      case '착수계': return <착수계Preview />;
      case '완료계': return <완료계Preview />;
      case '인력투입계획서': return <인력투입계획서Preview />;
      case '공정예정표': return <공정예정표Preview />;
      case '책임연구원선임계': return <책임연구원선임계Preview />;
      case '보안각서': return <보안각서Preview />;
      case '완료검사원': return <완료검사원Preview />;
      case '완료내역서': return <완료내역서Preview />;
      default: return <착수계Preview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">📑 용역 서류 자동 생성</h1>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating || !formData.계약건명}
            className={`px-6 py-2 rounded-lg font-medium ${
              isGenerating || !formData.계약건명
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? '생성 중...' : '📥 전체 PDF 다운로드'}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* 좌측: 데이터 입력 */}
        <div className="w-96 bg-white border-r border-gray-200 p-6 h-screen overflow-auto">
          <h2 className="text-lg font-bold mb-4">📝 기본 정보 입력</h2>
          <p className="text-sm text-gray-500 mb-6">한 번 입력하면 모든 양식에 자동 적용됩니다.</p>
          
          {/* 계약 정보 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">계약 정보</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">계약건명 *</label>
                <input
                  type="text"
                  value={formData.계약건명}
                  onChange={(e) => handleChange('계약건명', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="예: 성인학습자 역량강화 교육"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계약금액 (숫자)</label>
                  <input
                    type="text"
                    value={formData.계약금액_숫자}
                    onChange={(e) => handleChange('계약금액_숫자', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="20,000,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계약금액 (한글)</label>
                  <input
                    type="text"
                    value={formData.계약금액_한글}
                    onChange={(e) => handleChange('계약금액_한글', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="이천만"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">계약년월일</label>
                <input
                  type="text"
                  value={formData.계약년월일}
                  onChange={(e) => handleChange('계약년월일', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="2025. 11. 27."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">착수년월일</label>
                <input
                  type="text"
                  value={formData.착수년월일}
                  onChange={(e) => handleChange('착수년월일', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="2025. 11. 27."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">완료년월일</label>
                <input
                  type="text"
                  value={formData.완료년월일}
                  onChange={(e) => handleChange('완료년월일', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="2026. 01. 08."
                />
              </div>
            </div>
          </div>

          {/* 회사 정보 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">회사 정보</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상호</label>
                <input
                  type="text"
                  value={formData.상호}
                  onChange={(e) => handleChange('상호', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <input
                  type="text"
                  value={formData.주소}
                  onChange={(e) => handleChange('주소', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대표자</label>
                <input
                  type="text"
                  value={formData.대표자}
                  onChange={(e) => handleChange('대표자', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* 제출일 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">제출일</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">년</label>
                <input
                  type="text"
                  value={formData.제출년}
                  onChange={(e) => handleChange('제출년', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
                <input
                  type="text"
                  value={formData.제출월}
                  onChange={(e) => handleChange('제출월', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">일</label>
                <input
                  type="text"
                  value={formData.제출일}
                  onChange={(e) => handleChange('제출일', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="27"
                />
              </div>
            </div>
          </div>

          {/* 참여연구원 (인력투입계획서용) */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">참여연구원</h3>
            <p className="text-xs text-gray-500 mb-3">인력투입계획서에 표시됩니다.</p>
            
            {researchers.map((r, idx) => (
              <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-2">연구원 {idx + 1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={r.기관구분}
                    onChange={(e) => updateResearcher(idx, '기관구분', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="기관구분"
                  />
                  <input
                    type="text"
                    value={r.성명}
                    onChange={(e) => updateResearcher(idx, '성명', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="성명"
                  />
                  <input
                    type="text"
                    value={r.직급}
                    onChange={(e) => updateResearcher(idx, '직급', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="직급"
                  />
                  <input
                    type="text"
                    value={r.생년월일}
                    onChange={(e) => updateResearcher(idx, '생년월일', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="생년월일"
                  />
                  <input
                    type="text"
                    value={r.학교}
                    onChange={(e) => updateResearcher(idx, '학교', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="학교"
                  />
                  <input
                    type="text"
                    value={r.취득년도}
                    onChange={(e) => updateResearcher(idx, '취득년도', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="취득년도"
                  />
                  <input
                    type="text"
                    value={r.전공}
                    onChange={(e) => updateResearcher(idx, '전공', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="전공"
                  />
                  <input
                    type="text"
                    value={r.학위}
                    onChange={(e) => updateResearcher(idx, '학위', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="학위"
                  />
                  <input
                    type="text"
                    value={r.담당분야}
                    onChange={(e) => updateResearcher(idx, '담당분야', e.target.value)}
                    className="col-span-2 px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="담당분야"
                  />
                </div>
              </div>
            ))}
            
            <button
              onClick={addResearcher}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-blue-400 hover:text-blue-500"
            >
              + 연구원 추가
            </button>
          </div>
        </div>

        {/* 중앙: 문서 목록 */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-3">📄 생성될 문서</h3>
          <div className="space-y-2">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => setPreviewDoc(doc.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  previewDoc === doc.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">✓</span>
                {doc.name}
              </button>
            ))}
          </div>
        </div>

        {/* 우측: 미리보기 */}
        <div className="flex-1 p-6 overflow-auto">
          <h3 className="font-semibold text-gray-700 mb-4">👁️ 미리보기: {previewDoc}</h3>
          <div className="bg-white shadow-lg mx-auto" style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '25mm',
          }}>
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
