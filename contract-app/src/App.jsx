import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { useDocumentSync } from './hooks/useDocumentSync';
import { documentsAPI, filesAPI, membersAPI, employeesAPI } from './api/client';
import { CollaborativeInput, CollaborativeTextarea } from './components/CollaborativeInput';

export default function App() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { user, logout } = useAuthStore();

  // 문서 로딩 상태
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('새 문서');

  // 회사 정보
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    business_number: '',
    representative: '',
    phone: '',
    address: ''
  });

  // 회사 직원 목록
  const [companyEmployees, setCompanyEmployees] = useState([]);

  // 스크롤 영역 ref
  const leftPanelRef = useRef(null);
  const previewPanelRef = useRef(null);


  // 현재 단계 (1: 제안, 2: 계약, 3: 착수, 4: 완료)
  const [currentStep, setCurrentStep] = useState(1);

  // 왼쪽 패널 너비 (리사이즈 가능)
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('contractPanelWidth');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);

  // 패널 너비 저장
  useEffect(() => {
    localStorage.setItem('contractPanelWidth', panelWidth.toString());
  }, [panelWidth]);

  // 리사이즈 핸들러
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(e.clientX, 250), 600);
    setPanelWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  
  // 기본 폼 데이터 초기값
  const defaultFormData = {
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

    // 제출일
    제출년: '2025',
    제출월: '',
    제출일: '',

    // 기타 데이터 (배열/객체는 JSON 문자열로)
    researchers: JSON.stringify([{ 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' }]),
    checklist: JSON.stringify({ 계약서수령: false, 서류준비: false, 계약서검토: false, 계약서서명: false }),
    leadResearcher: JSON.stringify({ 성명: '', 생년월일: '', 소속: '', 직위: '', 자격사항: '' }),
    scheduleData: JSON.stringify([
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
    ]),
    scheduleMonths: JSON.stringify(['1월', '2월', '3월', '4월']),
    scheduleHeader: '',

    // 견적서 데이터
    견적서_견적일: new Date().toISOString().split('T')[0],
    견적서_유효기간: '견적일로부터 3개월',
    견적서_데이터: JSON.stringify({
      categories: [
        {
          name: '인건비',
          items: [
            { name: '운영 총괄', qty1: 1, unit1: '명', qty2: 1, unit2: '개월', price: 2500000, note: '' },
            { name: '멘토', qty1: 3, unit1: '명', qty2: 12, unit2: '시간', price: 100000, note: '' },
            { name: '강사', qty1: 1, unit1: '명', qty2: 12, unit2: '시간', price: 300000, note: '' },
          ]
        },
        {
          name: '임차비',
          items: [
            { name: '임차비', qty1: 1, unit1: '식', qty2: null, unit2: null, price: 0, note: '' },
          ]
        },
        {
          name: '자문비',
          items: [
            { name: '커리큘럼 자문비', qty1: 1, unit1: '건', qty2: 1, unit2: '주', price: 500000, note: '' },
          ]
        },
        {
          name: '인쇄제작비',
          items: [
            { name: '현수막', qty1: 1, unit1: '종', qty2: 1, unit2: '개', price: 150000, note: '' },
            { name: '포스터', qty1: 1, unit1: '종', qty2: 30, unit2: '장', price: 5000, note: '' },
            { name: 'X-배너', qty1: 1, unit1: '종', qty2: 4, unit2: '개', price: 100000, note: '' },
            { name: '디자인비', qty1: 3, unit1: '건', qty2: null, unit2: null, price: 350000, note: '' },
          ]
        },
        {
          name: '식다과비',
          items: [
            { name: '다과비', qty1: 4, unit1: '일', qty2: 35, unit2: '명', price: 16000, note: '스탭, 멘토 등 운영진 포함' },
          ]
        },
        {
          name: '행사부대비용',
          items: [
            { name: '온라인 콘텐츠 제공', qty1: 4, unit1: '식', qty2: 30, unit2: '명', price: 30000, note: '' },
            { name: '사무용품', qty1: 1, unit1: '식', qty2: null, unit2: null, price: 300000, note: '' },
            { name: '기타 운영비', qty1: 1, unit1: '식', qty2: null, unit2: null, price: 2000000, note: '' },
          ]
        },
      ]
    }),
  };

  // 초기 문서 데이터 (서버에서 로드)
  const [initialFormData, setInitialFormData] = useState(null);

  // WebSocket 동기화 훅
  const {
    formData: syncedFormData,
    setFormData: setSyncedFormData,
    updateField,
    updateFields,
    onlineUsers,
    remoteCursors,
    getCursorForField,
    isConnected,
    connectionError,
    sendCursorPosition,
    getUserColor
  } = useDocumentSync(documentId, initialFormData);

  // formData는 syncedFormData를 사용
  const formData = syncedFormData || defaultFormData;
  const setFormData = (newData) => {
    if (typeof newData === 'function') {
      const updated = newData(formData);
      updateFields(updated);
    } else {
      updateFields(newData);
    }
  };

  // 문서 로드
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        navigate('/');
        return;
      }

      try {
        setDocumentLoading(true);
        const response = await documentsAPI.getDocument(documentId);
        const doc = response.data;
        setDocumentTitle(doc.title);

        // 서버의 form_data를 초기값으로 설정
        const serverFormData = doc.form_data || {};
        setInitialFormData({ ...defaultFormData, ...serverFormData });

        // 저장된 현재 단계와 선택된 문서 복원
        if (serverFormData._currentStep) {
          setCurrentStep(serverFormData._currentStep);
        }
        if (serverFormData._selectedDoc) {
          setSelectedDoc(serverFormData._selectedDoc);
        }

        setDocumentError(null);
      } catch (err) {
        console.error('문서 로드 실패:', err);
        setDocumentError('문서를 불러오는데 실패했습니다');
        if (err.response?.status === 404 || err.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setDocumentLoading(false);
      }
    };

    const loadCompanyInfo = async () => {
      try {
        const response = await membersAPI.getCompanyInfo();
        setCompanyInfo({
          name: response.data.name || '',
          business_number: response.data.business_number || '',
          representative: response.data.representative || '',
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      } catch (err) {
        console.error('회사 정보 로드 실패:', err);
      }
    };

    const loadEmployees = async () => {
      try {
        const response = await employeesAPI.getEmployees();
        setCompanyEmployees(response.data);
      } catch (err) {
        console.error('직원 목록 로드 실패:', err);
      }
    };

    loadDocument();
    loadCompanyInfo();
    loadEmployees();
  }, [documentId, navigate]);

  // 문서 또는 단계 변경 시 스크롤 맨 위로
  useEffect(() => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = 0;
    }
    if (previewPanelRef.current) {
      previewPanelRef.current.scrollTop = 0;
    }
  }, [selectedDoc, currentStep]);

  // 참여연구원
  const [researchers, setResearchers] = useState(() => {
    const saved = localStorage.getItem('contractResearchers');
    return saved ? JSON.parse(saved) : [
      { 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' },
    ];
  });

  // 계약 체크리스트
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('contractChecklist');
    return saved ? JSON.parse(saved) : {
      계약서수령: false,
      서류준비: false,
      계약서검토: false,
      계약서서명: false,
    };
  });

  // 계약 정보 수정 모드
  const [isContractEditing, setIsContractEditing] = useState(false);

  // 업로드된 서류 파일 (서버에서 로드)
  const [uploadedFiles, setUploadedFiles] = useState({
    법인등기부등본: null,
    통장사본: null,
    사업자등록증: null,
    인감증명서: null,
  });
  const [filesLoading, setFilesLoading] = useState(true);

  // 서류 보관함 로드
  useEffect(() => {
    if (!user) {
      setFilesLoading(false);
      return;
    }
    const loadFiles = async () => {
      try {
        setFilesLoading(true);
        const response = await filesAPI.getFiles();
        // 서버 응답을 uploadedFiles 형식으로 변환
        const files = {};
        for (const [key, value] of Object.entries(response.data)) {
          if (value) {
            files[key] = {
              name: value.file_name,
              data: value.file_data,
              type: value.file_data?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/*',
              uploadedAt: value.created_at
            };
          } else {
            files[key] = null;
          }
        }
        setUploadedFiles(files);
      } catch (err) {
        console.error('서류 보관함 로드 실패:', err);
      } finally {
        setFilesLoading(false);
      }
    };
    loadFiles();
  }, [user]);

  // 파일 업로드 핸들러
  const handleFileUpload = async (fileType, file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      try {
        await filesAPI.uploadFile({
          file_type: fileType,
          file_name: file.name,
          file_data: base64Data,
        });
        setUploadedFiles(prev => ({
          ...prev,
          [fileType]: {
            name: file.name,
            data: base64Data,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }
        }));
      } catch (err) {
        console.error('파일 업로드 실패:', err);
        alert('파일 업로드에 실패했습니다.');
      }
    };
    reader.readAsDataURL(file);
  };

  // 파일 삭제 핸들러
  const handleFileDelete = async (fileType) => {
    try {
      await filesAPI.deleteFile(fileType);
      setUploadedFiles(prev => ({ ...prev, [fileType]: null }));
    } catch (err) {
      console.error('파일 삭제 실패:', err);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  // 현재 선택된 문서
  const [selectedDoc, setSelectedDoc] = useState('제안서');

  // 현재 단계와 선택된 문서가 변경될 때 서버에 저장
  useEffect(() => {
    if (documentId && !documentLoading && updateFields) {
      updateFields({
        _currentStep: currentStep,
        _selectedDoc: selectedDoc
      });
    }
  }, [currentStep, selectedDoc, documentId, documentLoading, updateFields]);

  // AI 생성 중
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 책임연구원 정보
  const [leadResearcher, setLeadResearcher] = useState(() => {
    const saved = localStorage.getItem('contractLeadResearcher');
    return saved ? JSON.parse(saved) : {
      성명: '',
      생년월일: '',
      소속: '',
      직위: '',
      자격사항: '',
    };
  });

  // 공정예정표 데이터
  const [scheduleData, setScheduleData] = useState(() => {
    const saved = localStorage.getItem('contractScheduleData');
    return saved ? JSON.parse(saved) : [
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
      { 연구내용: '', months: [false, false, false, false] },
    ];
  });

  // 공정예정표 월 라벨
  const [scheduleMonths, setScheduleMonths] = useState(() => {
    const saved = localStorage.getItem('contractScheduleMonths');
    return saved ? JSON.parse(saved) : ['1월', '2월', '3월', '4월'];
  });

  // 공정예정표 상위 라벨 (주별 모드에서 사용)
  const [scheduleHeader, setScheduleHeader] = useState(() => {
    const saved = localStorage.getItem('contractScheduleHeader');
    return saved ? JSON.parse(saved) : '';
  });

  // 로딩 중이면 로딩 화면 표시
  if (documentLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-slate-500">문서 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있으면 에러 화면 표시
  if (documentError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{documentError}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            문서 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 다음 서류로 이동
  const goToNextDoc = () => {
    const docs = stepDocuments[currentStep];
    const currentIndex = docs.findIndex(d => d.id === selectedDoc);
    if (currentIndex < docs.length - 1) {
      setSelectedDoc(docs[currentIndex + 1].id);
    } else if (currentStep < 4) {
      // 다음 단계로
      setCurrentStep(currentStep + 1);
      setSelectedDoc(stepDocuments[currentStep + 1][0].id);
    }
  };

  // 이전 서류로 이동
  const goToPrevDoc = () => {
    const docs = stepDocuments[currentStep];
    const currentIndex = docs.findIndex(d => d.id === selectedDoc);
    if (currentIndex > 0) {
      setSelectedDoc(docs[currentIndex - 1].id);
    } else if (currentStep > 1) {
      // 이전 단계 마지막 서류로
      const prevDocs = stepDocuments[currentStep - 1];
      setCurrentStep(currentStep - 1);
      setSelectedDoc(prevDocs[prevDocs.length - 1].id);
    }
  };

  // 현재 서류 인덱스 정보
  const getCurrentDocInfo = () => {
    const docs = stepDocuments[currentStep];
    const currentIndex = docs.findIndex(d => d.id === selectedDoc);
    return {
      current: currentIndex + 1,
      total: docs.length,
      isFirst: currentIndex === 0 && currentStep === 1,
      isLast: currentIndex === docs.length - 1 && currentStep === 4,
      isStepLast: currentIndex === docs.length - 1,
    };
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = (fileType) => {
    const file = uploadedFiles[fileType];
    if (!file) return;
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 단계별 문서
  const stepDocuments = {
    1: [{ id: '제안서', name: '제안서' }, { id: '견적서', name: '견적서' }],
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

    // 과업명이 변경되면 문서 제목도 업데이트
    if (field === '과업명' && value && documentId) {
      documentsAPI.updateDocument(documentId, { title: value }).catch(console.error);
      setDocumentTitle(value);
    }
  };

  // 숫자에 콤마 추가
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 숫자만 추출
  const extractNumber = (str) => {
    return str.replace(/[^0-9]/g, '');
  };

  // 숫자를 한글로 변환
  const numberToKorean = (num) => {
    if (!num || num === '0') return '';
    
    const number = parseInt(num, 10);
    if (isNaN(number)) return '';
    
    const units = ['', '만', '억', '조'];
    const smallUnits = ['', '십', '백', '천'];
    const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    
    if (number === 0) return '영';
    
    let result = '';
    let unitIndex = 0;
    let remaining = number;
    
    while (remaining > 0) {
      const chunk = remaining % 10000;
      if (chunk > 0) {
        let chunkStr = '';
        let chunkRemaining = chunk;
        
        for (let i = 0; i < 4; i++) {
          const digit = chunkRemaining % 10;
          if (digit > 0) {
            // '일'은 십, 백, 천 앞에서 생략 (단, 만, 억, 조의 첫 자리는 예외)
            if (digit === 1 && i > 0) {
              chunkStr = smallUnits[i] + chunkStr;
            } else {
              chunkStr = digits[digit] + smallUnits[i] + chunkStr;
            }
          }
          chunkRemaining = Math.floor(chunkRemaining / 10);
        }
        
        result = chunkStr + units[unitIndex] + result;
      }
      
      remaining = Math.floor(remaining / 10000);
      unitIndex++;
    }
    
    return result;
  };

  // 예산 입력 핸들러
  const handleBudgetChange = (value, isContract = false) => {
    const numOnly = extractNumber(value);
    const formatted = formatNumber(numOnly);
    const korean = numberToKorean(numOnly);
    
    if (isContract) {
      setFormData(prev => ({
        ...prev,
        계약금액_숫자: formatted,
        계약금액_한글: korean
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        예산_숫자: formatted,
        예산_한글: korean
      }));
    }
  };

  // 날짜를 "2025. 11. 27." 형식으로 변환
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
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
    <div
      className="a4-page"
      style={{
        width: '210mm',
        minWidth: '210mm',
        height: '297mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        pageBreakAfter: 'always',
        breakAfter: 'page',
        flexShrink: 0,
      }}>
      {children}
    </div>
  );

  const 제안서Preview = () => (
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
          <div style={{ fontSize: '32pt', fontWeight: 'bold', marginBottom: '80px' }}>제안서</div>
          <div style={{ fontSize: '16pt' }}>{companyInfo.name}</div>
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
            <div style={{ paddingLeft: '20px' }}>{formatDate(formData.수행기간_시작) || '20  .   .   .'} ~ {formatDate(formData.수행기간_종료) || '20  .   .   .'}</div>
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

  const 견적서Preview = () => {
    const estimateData = getEstimateData();
    const { subtotal, tax, total, applyTruncation } = calculateEstimateTotal();
    const 견적일 = formData.견적서_견적일 ? new Date(formData.견적서_견적일).toLocaleDateString('ko-KR') : '';

    // 항목을 페이지별로 분배 (페이지당 최대 행 수)
    const ITEMS_PER_PAGE = 18;

    // 모든 행을 flat하게 만들기
    const allRows = [];
    estimateData.categories.forEach((category, catIndex) => {
      category.items.forEach((item, itemIndex) => {
        allRows.push({
          type: 'item',
          category,
          catIndex,
          item,
          itemIndex,
          isFirstInCategory: itemIndex === 0,
          categoryItemCount: category.items.length
        });
      });
      allRows.push({
        type: 'subtotal',
        category,
        catIndex
      });
    });

    // 페이지별로 분할
    const pages = [];
    let currentPage = [];
    let currentRowCount = 0;

    allRows.forEach((row, idx) => {
      if (currentRowCount >= ITEMS_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
        currentRowCount = 0;
      }
      currentPage.push(row);
      currentRowCount++;
    });
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // 헤더 컴포넌트
    const TableHeader = () => (
      <thead>
        <tr style={{ backgroundColor: '#e5e7eb' }}>
          <th style={{ border: '1px solid #333', padding: '5px', width: '12%' }}>항목</th>
          <th style={{ border: '1px solid #333', padding: '5px', width: '25%' }}>세부 내역</th>
          <th style={{ border: '1px solid #333', padding: '5px', width: '18%' }}>수량</th>
          <th style={{ border: '1px solid #333', padding: '5px', width: '15%', textAlign: 'right' }}>단가</th>
          <th style={{ border: '1px solid #333', padding: '5px', width: '15%', textAlign: 'right' }}>공급가액</th>
          <th style={{ border: '1px solid #333', padding: '5px', width: '15%' }}>비고</th>
        </tr>
      </thead>
    );

    return (
      <>
        {pages.map((pageRows, pageIndex) => (
          <A4Page key={pageIndex}>
            <div style={{ fontFamily: "'Nanum Gothic', sans-serif", fontSize: '10pt', padding: '10px' }}>
              {/* 첫 페이지에만 헤더 정보 표시 */}
              {pageIndex === 0 && (
                <>
                  <h1 style={{ fontSize: '24pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>견 적 서</h1>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontSize: '9pt' }}>
                      <div style={{ marginBottom: '5px' }}>견적일: {견적일}</div>
                      <div>유효기간: {formData.견적서_유효기간 || '견적일로부터 3개월'}</div>
                    </div>
                    <div style={{ border: '1px solid #333', padding: '10px', width: '45%', fontSize: '9pt' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #333', paddingBottom: '3px' }}>공급자</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '3px' }}>
                        <span>상호:</span><span style={{ fontWeight: 'bold' }}>{companyInfo.name} <span style={{ marginLeft: '10px', color: '#999' }}>(인)</span></span>
                        <span>사업자번호:</span><span>{companyInfo.business_number}</span>
                        <span>대표자:</span><span>{companyInfo.representative}</span>
                        <span>전화번호:</span><span>{companyInfo.phone}</span>
                        <span>주소:</span><span style={{ fontSize: '8pt' }}>{companyInfo.address}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '15px', textAlign: 'center', border: '1px solid #333' }}>
                    <span style={{ fontSize: '11pt' }}>견적금액 (공급가액, VAT 포함): </span>
                    <span style={{ fontSize: '14pt', fontWeight: 'bold', color: '#1e40af' }}>{total.toLocaleString()}원</span>
                  </div>
                </>
              )}

              {/* 이어지는 페이지에는 간단한 헤더 */}
              {pageIndex > 0 && (
                <div style={{ marginBottom: '10px', fontSize: '9pt', color: '#666' }}>
                  견적서 (계속) - {pageIndex + 1} / {pages.length} 페이지
                </div>
              )}

              {/* 테이블 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: '15px' }}>
                <TableHeader />
                <tbody>
                  {pageRows.map((row, rowIndex) => {
                    if (row.type === 'item') {
                      // 현재 페이지에서 이 카테고리의 첫 번째 항목인지 확인
                      const isFirstInThisPage = !pageRows.slice(0, rowIndex).some(
                        r => r.type === 'item' && r.catIndex === row.catIndex
                      );
                      // 현재 페이지에서 이 카테고리의 항목 수
                      const categoryRowsInPage = pageRows.filter(
                        r => (r.type === 'item' || r.type === 'subtotal') && r.catIndex === row.catIndex
                      ).length;

                      return (
                        <tr key={`${row.catIndex}-${row.itemIndex}`}>
                          {isFirstInThisPage && (
                            <td style={{ border: '1px solid #333', padding: '5px', fontWeight: 'bold', verticalAlign: 'top' }} rowSpan={categoryRowsInPage}>
                              {row.category.name}
                            </td>
                          )}
                          <td style={{ border: '1px solid #333', padding: '5px' }}>{row.item.name}</td>
                          <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'center' }}>
                            {row.item.qty1}{row.item.unit1}
                            {row.item.qty2 && ` × ${row.item.qty2}${row.item.unit2}`}
                          </td>
                          <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'right' }}>{row.item.price?.toLocaleString()}</td>
                          <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'right' }}>{calculateItemTotal(row.item).toLocaleString()}</td>
                          <td style={{ border: '1px solid #333', padding: '5px', fontSize: '7pt' }}>{row.item.note}</td>
                        </tr>
                      );
                    } else if (row.type === 'subtotal') {
                      return (
                        <tr key={`${row.catIndex}-subtotal`} style={{ backgroundColor: '#f9fafb' }}>
                          <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'right', fontWeight: 'bold' }} colSpan={3}>소계</td>
                          <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>{calculateCategoryTotal(row.category).toLocaleString()}</td>
                          <td style={{ border: '1px solid #333', padding: '5px' }}></td>
                        </tr>
                      );
                    }
                    return null;
                  })}

                  {/* 마지막 페이지에만 합계 표시 */}
                  {pageIndex === pages.length - 1 && (
                    <>
                      <tr style={{ backgroundColor: '#e5e7eb' }}>
                        <td style={{ border: '1px solid #333', padding: '5px', fontWeight: 'bold' }} colSpan={4}>소계총합</td>
                        <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>{subtotal.toLocaleString()}</td>
                        <td style={{ border: '1px solid #333', padding: '5px' }}></td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #333', padding: '5px', fontWeight: 'bold' }} colSpan={4}>부가세 (10%)</td>
                        <td style={{ border: '1px solid #333', padding: '5px', textAlign: 'right' }}>{tax.toLocaleString()}</td>
                        <td style={{ border: '1px solid #333', padding: '5px' }}></td>
                      </tr>
                      <tr style={{ backgroundColor: '#dbeafe' }}>
                        <td style={{ border: '1px solid #333', padding: '8px', fontWeight: 'bold', fontSize: '10pt' }} colSpan={4}>합계</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: '10pt', color: '#1e40af' }}>{total.toLocaleString()}</td>
                        <td style={{ border: '1px solid #333', padding: '5px', fontSize: '7pt' }}>{applyTruncation ? '만원단위 이하 절사' : ''}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </A4Page>
        ))}
      </>
    );
  };

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
        <div style={{ marginBottom: '3px' }}>○ 계약년월일 : {formatDate(formData.계약년월일) || '20  .    .    .'}</div>
        <div style={{ marginBottom: '3px' }}>○ 착수년월일 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작) || '20  .    .    .'}</div>
        <div style={{ marginBottom: '3px' }}>○ 완료년월일 : {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료) || '20  .    .    .'}</div>
        <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>상기와 같이 착수계를 제출합니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년 || '20  '}년    {formData.제출월 || '  '}월    {formData.제출일 || '  '}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {companyInfo.representative}       (인)</div>
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
        <div style={{ marginBottom: '15px' }}>2. 계약기간 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작) || '20  .   .   .'} ~ {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료) || '20  .   .   .'}</div>
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
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {companyInfo.representative}       (인)</div>
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
        <div style={{ marginBottom: '15px' }}>2. 계약기간 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작)} ~ {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
        <div style={{ marginBottom: '10px' }}>3. 공정예정표</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '30px' }}>
          <thead>
            {scheduleHeader ? (
              <>
                {/* 주별 모드: 2행 헤더 */}
                <tr>
                  <th rowSpan={2} style={{ border: '1px solid black', padding: '10px', width: '30%', height: '70px', position: 'relative', background: 'linear-gradient(to left bottom, transparent calc(50% - 1px), black, transparent calc(50% + 1px))' }}>
                    <span style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '10pt' }}>주 별</span>
                    <span style={{ position: 'absolute', bottom: '8px', left: '5px', fontSize: '10pt' }}>연구내용</span>
                  </th>
                  <th colSpan={4} style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                    {scheduleHeader}
                  </th>
                </tr>
                <tr>
                  {scheduleMonths.map((m, i) => <th key={i} style={{ border: '1px solid black', padding: '10px', textAlign: 'center', width: '17.5%' }}>{m}</th>)}
                </tr>
              </>
            ) : (
              /* 월별 모드: 1행 헤더 */
              <tr>
                <th style={{ border: '1px solid black', padding: '10px', width: '30%', height: '50px', position: 'relative', background: 'linear-gradient(to left bottom, transparent calc(50% - 1px), black, transparent calc(50% + 1px))' }}>
                  <span style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '10pt' }}>월 별</span>
                  <span style={{ position: 'absolute', bottom: '5px', left: '5px', fontSize: '10pt' }}>연구내용</span>
                </th>
                {scheduleMonths.map((m, i) => <th key={i} style={{ border: '1px solid black', padding: '10px', textAlign: 'center', width: '17.5%' }}>{m}</th>)}
              </tr>
            )}
          </thead>
          <tbody>
            {scheduleData.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '10px', height: '40px' }}>{row.연구내용}</td>
                {row.months.map((checked, j) => (
                  <td key={j} style={{ border: '1px solid black', padding: '5px' }}>
                    {checked && (
                      <div style={{ 
                        backgroundColor: '#888', 
                        height: '20px', 
                        margin: '0 -5px',
                        borderRadius: '2px'
                      }} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {companyInfo.representative}       (인)</div>
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
        <div style={{ marginBottom: '15px' }}>3. 계약기간 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작)} ~ {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
        <div style={{ marginBottom: '8px' }}>4. 책임연구원(기술자)</div>
        <div style={{ paddingLeft: '20px' }}>가. 성      명 : {leadResearcher.성명}</div>
        <div style={{ paddingLeft: '20px' }}>나. 생년월일 : {leadResearcher.생년월일}</div>
        <div style={{ paddingLeft: '20px' }}>다. 소      속 : {leadResearcher.소속}</div>
        <div style={{ paddingLeft: '20px' }}>라. 직      위 : {leadResearcher.직위}</div>
        <div style={{ paddingLeft: '20px', marginBottom: '15px' }}>마. 자격(면허)사항 : {leadResearcher.자격사항}</div>
        <div style={{ textAlign: 'center', margin: '30px 0', fontSize: '12pt' }}>상기인을 본 용역의 책임연구원(기술자)으로 선임하여 제출하오며<br/>과업 수행에 따른 일체의 행위에 대하여 계약상대자로서의 책임을 집니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>대 표 자 : {companyInfo.representative}       (인)</div>
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
            <div style={{ marginBottom: '5px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '5px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '5px' }}>대 표 자 : {companyInfo.representative}       (인)</div>
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
        <div style={{ marginBottom: '3px' }}>❍ 계약년월일 : {formatDate(formData.계약년월일)}</div>
        <div style={{ marginBottom: '3px' }}>❍ 착수년월일 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작)}</div>
        <div style={{ marginBottom: '3px' }}>❍ 완료예정일 : {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
        <div style={{ marginBottom: '3px' }}>❍ 완료년월일 : {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
        <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>상기와 같이 완료되었기에 완료계를 제출합니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년}년    {formData.제출월}월    {formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>성명(대표자) : {companyInfo.representative}       (인)</div>
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
        <div>❍ 계약년월일 : {formatDate(formData.계약년월일)}</div>
        <div>❍ 착수년월일 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작)}</div>
        <div>❍ 완료예정일 : {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
        <div style={{ marginBottom: '15px' }}>❍ 완료년월일 : {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
        <div style={{ textAlign: 'center', margin: '50px 0' }}>상기와 같이 완료되었기에 검사원을 제출합니다.</div>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>{formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px', marginBottom: '40px' }}>
          <div style={{ fontSize: '12pt', whiteSpace: 'pre' }}>
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>성명(대표자) : {companyInfo.representative}       (인)</div>
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
        <div style={{ marginBottom: '20px' }}>❍ 용역기간 : {formatDate(formData.착수년월일) || formatDate(formData.수행기간_시작)} ~ {formatDate(formData.완료년월일) || formatDate(formData.수행기간_종료)}</div>
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
            <div style={{ marginBottom: '3px' }}>주    소 : {companyInfo.address}</div>
            <div style={{ marginBottom: '3px' }}>상    호 : {companyInfo.name}</div>
            <div style={{ marginBottom: '3px' }}>성명(대표자) : {companyInfo.representative}       (인)</div>
          </div>
        </div>
        <div style={{ textAlign: 'left', fontSize: '18pt', fontWeight: 'bold' }}>제주대학교 산학협력단 계약관 귀하</div>
      </div>
    </A4Page>
  );

  const renderPreview = () => {
    const previews = { 제안서: 제안서Preview, 견적서: 견적서Preview, 계약서: 계약서Preview, 착수계: 착수계Preview, 인력투입계획서: 인력투입계획서Preview, 공정예정표: 공정예정표Preview, 책임연구원선임계: 책임연구원선임계Preview, 보안각서: 보안각서Preview, 완료계: 완료계Preview, 완료검사원: 완료검사원Preview, 완료내역서: 완료내역서Preview };
    const Preview = previews[selectedDoc] || 제안서Preview;
    return <Preview />;
  };

  // 견적서 데이터 파싱 및 업데이트 헬퍼
  const getEstimateData = () => {
    try {
      return JSON.parse(formData.견적서_데이터 || '{"categories":[]}');
    } catch {
      return { categories: [] };
    }
  };

  const updateEstimateData = (newData) => {
    handleChange('견적서_데이터', JSON.stringify(newData));
  };

  // 견적서 항목 금액 계산
  const calculateItemTotal = (item) => {
    const qty1 = item.qty1 || 0;
    const qty2 = item.qty2 || 1;
    const price = item.price || 0;
    return qty1 * qty2 * price;
  };

  // 견적서 카테고리별 소계 계산
  const calculateCategoryTotal = (category) => {
    return category.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // 견적서 총합계 계산
  const calculateEstimateTotal = () => {
    const data = getEstimateData();
    const subtotal = data.categories.reduce((sum, cat) => sum + calculateCategoryTotal(cat), 0);
    const tax = Math.floor(subtotal * 0.1);
    const rawTotal = subtotal + tax;
    // 만원 단위 이하 절사 옵션 확인 (10만원 단위로 절사)
    const applyTruncation = formData.견적서_만원절사 !== false; // 기본값 true
    const total = applyTruncation ? Math.floor(rawTotal / 100000) * 100000 : rawTotal;
    return { subtotal, tax, total, rawTotal, applyTruncation };
  };

  // 견적서 카테고리 추가
  const addEstimateCategory = () => {
    const data = getEstimateData();
    data.categories.push({
      name: '새 카테고리',
      items: [{ name: '항목명', qty1: 1, unit1: '식', qty2: null, unit2: null, price: 0, note: '' }]
    });
    updateEstimateData(data);
  };

  // 견적서 카테고리 삭제
  const removeEstimateCategory = (catIndex) => {
    const data = getEstimateData();
    data.categories.splice(catIndex, 1);
    updateEstimateData(data);
  };

  // 견적서 카테고리명 수정
  const updateCategoryName = (catIndex, name) => {
    const data = getEstimateData();
    data.categories[catIndex].name = name;
    updateEstimateData(data);
  };

  // 견적서 항목 추가
  const addEstimateItem = (catIndex) => {
    const data = getEstimateData();
    data.categories[catIndex].items.push({ name: '항목명', qty1: 1, unit1: '식', qty2: null, unit2: null, price: 0, note: '' });
    updateEstimateData(data);
  };

  // 견적서 항목 삭제
  const removeEstimateItem = (catIndex, itemIndex) => {
    const data = getEstimateData();
    data.categories[catIndex].items.splice(itemIndex, 1);
    updateEstimateData(data);
  };

  // 견적서 항목 수정
  const updateEstimateItem = (catIndex, itemIndex, field, value) => {
    const data = getEstimateData();
    data.categories[catIndex].items[itemIndex][field] = value;
    updateEstimateData(data);
  };

  // 단계별 입력 패널
  const renderInputPanel = () => {
    if (currentStep === 1 && selectedDoc === '견적서') {
      // 견적서 입력 패널
      const estimateData = getEstimateData();
      const { subtotal, tax, total, rawTotal } = calculateEstimateTotal();

      return (
        <>
          {/* 견적 기본 정보 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3">견적 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">견적일</label>
                <input
                  type="date"
                  value={formData.견적서_견적일 || ''}
                  onChange={(e) => handleChange('견적서_견적일', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">유효기간</label>
                <input
                  type="text"
                  value={formData.견적서_유효기간 || ''}
                  onChange={(e) => handleChange('견적서_유효기간', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="견적일로부터 3개월"
                />
              </div>
            </div>
          </div>

          {/* 카테고리별 항목 */}
          {estimateData.categories.map((category, catIndex) => (
            <details key={catIndex} className="mb-3" open>
              <summary className="p-3 bg-white rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
                <div className="inline-flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateCategoryName(catIndex, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                  />
                  <span className="text-sm text-slate-500 ml-auto mr-2">
                    {calculateCategoryTotal(category).toLocaleString()}원
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (window.confirm('이 카테고리를 삭제하시겠습니까?')) {
                        removeEstimateCategory(catIndex);
                      }
                    }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ×
                  </button>
                </div>
              </summary>
              <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                        placeholder="항목명"
                      />
                      <button
                        onClick={() => removeEstimateItem(catIndex, itemIndex)}
                        className="text-red-400 hover:text-red-600 text-sm px-2"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm flex-wrap">
                      <input
                        type="number"
                        value={item.qty1 || ''}
                        onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'qty1', parseInt(e.target.value) || 0)}
                        className="w-14 px-2 py-1 border border-slate-200 rounded text-center"
                      />
                      <input
                        type="text"
                        value={item.unit1 || ''}
                        onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'unit1', e.target.value)}
                        className="w-12 px-1 py-1 border border-slate-200 rounded text-center"
                        placeholder="단위"
                      />
                      {item.qty2 !== null && (
                        <>
                          <span className="text-slate-400">×</span>
                          <input
                            type="number"
                            value={item.qty2 || ''}
                            onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'qty2', parseInt(e.target.value) || 0)}
                            className="w-14 px-2 py-1 border border-slate-200 rounded text-center"
                          />
                          <input
                            type="text"
                            value={item.unit2 || ''}
                            onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'unit2', e.target.value)}
                            className="w-12 px-1 py-1 border border-slate-200 rounded text-center"
                            placeholder="단위"
                          />
                        </>
                      )}
                      <span className="text-slate-400">×</span>
                      <input
                        type="text"
                        value={item.price?.toLocaleString() || ''}
                        onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'price', parseInt(e.target.value.replace(/,/g, '')) || 0)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-right"
                        placeholder="단가"
                      />
                      <span className="text-slate-500">원</span>
                      <span className="text-slate-400 mx-1">=</span>
                      <span className="font-medium text-blue-600">{calculateItemTotal(item).toLocaleString()}원</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={item.qty2 !== null}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateEstimateItem(catIndex, itemIndex, 'qty2', 1);
                              updateEstimateItem(catIndex, itemIndex, 'unit2', '개');
                            } else {
                              updateEstimateItem(catIndex, itemIndex, 'qty2', null);
                              updateEstimateItem(catIndex, itemIndex, 'unit2', null);
                            }
                          }}
                          className="rounded"
                        />
                        수량2 사용
                      </label>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => updateEstimateItem(catIndex, itemIndex, 'note', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs"
                        placeholder="비고"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addEstimateItem(catIndex)}
                  className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500"
                >
                  + 항목 추가
                </button>
              </div>
            </details>
          ))}

          {/* 카테고리 추가 버튼 */}
          <button
            onClick={addEstimateCategory}
            className="w-full mb-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500"
          >
            + 카테고리 추가
          </button>

          {/* 합계 표시 */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">소계</span>
              <span className="font-medium">{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">부가세 (10%)</span>
              <span className="font-medium">{tax.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2 mt-2">
              <span className="text-blue-700">합계</span>
              <span className="text-blue-700">{total.toLocaleString()}원</span>
            </div>
            {/* 만원 단위 절사 체크박스 */}
            <label className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.견적서_만원절사 !== false}
                onChange={(e) => handleChange('견적서_만원절사', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-slate-600">만원 단위 이하 절사</span>
              {formData.견적서_만원절사 !== false && rawTotal !== total && (
                <span className="text-xs text-slate-400">(-{(rawTotal - total).toLocaleString()}원)</span>
              )}
            </label>
          </div>
        </>
      );
    } else if (currentStep === 1) {
      // 제안서 입력 패널
      const step1Done = formData.과업명 && formData.예산_숫자 && formData.수행기간_시작 && formData.수행기간_종료;
      const step2Done = formData.과업목적 && formData.과업범위및내용;

      return (
        <>
          {/* STEP 1: 기본 정보 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step1Done ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>1</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">기본 정보 입력</h3>
                <p className="text-sm text-slate-500 mb-3">과업의 기본 정보를 입력하세요.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">과업명 *</label>
                    <CollaborativeInput
                      type="text"
                      value={formData.과업명}
                      onChange={(e) => handleChange('과업명', e.target.value)}
                      fieldName="과업명"
                      getCursorForField={getCursorForField}
                      sendCursorPosition={sendCursorPosition}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 2024년 홍보영상 제작"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">간단한 설명 (AI 생성에 활용)</label>
                    <CollaborativeTextarea
                      value={formData.간단한설명}
                      onChange={(e) => handleChange('간단한설명', e.target.value)}
                      fieldName="간단한설명"
                      getCursorForField={getCursorForField}
                      sendCursorPosition={sendCursorPosition}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                      rows={2}
                      placeholder="예: 대학교 홍보를 위한 3분 분량의 영상 제작"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">예산 *</label>
                      <CollaborativeInput
                        type="text"
                        value={formData.예산_숫자}
                        onChange={(e) => handleBudgetChange(e.target.value, false)}
                        fieldName="예산_숫자"
                        getCursorForField={getCursorForField}
                        sendCursorPosition={sendCursorPosition}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="20,000,000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">한글 (자동)</label>
                      <input type="text" value={formData.예산_한글} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">시작일 *</label>
                      <CollaborativeInput
                        type="date"
                        value={formData.수행기간_시작}
                        onChange={(e) => handleChange('수행기간_시작', e.target.value)}
                        fieldName="수행기간_시작"
                        getCursorForField={getCursorForField}
                        sendCursorPosition={sendCursorPosition}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">종료일 *</label>
                      <CollaborativeInput
                        type="date"
                        value={formData.수행기간_종료}
                        onChange={(e) => handleChange('수행기간_종료', e.target.value)}
                        fieldName="수행기간_종료"
                        getCursorForField={getCursorForField}
                        sendCursorPosition={sendCursorPosition}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {step1Done && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">기본 정보 입력 완료</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: AI 자동 생성 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step2Done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">상세 내용 작성</h3>
                <p className="text-sm text-slate-500 mb-3">과업명과 설명을 기반으로 AI가 자동 생성하거나, 직접 입력하세요.</p>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 mb-4">
                  <p className="text-xs text-purple-700 mb-2">💡 <strong>과업명</strong>과 <strong>간단한 설명</strong>을 입력한 후 AI 버튼을 누르면 자동으로 작성됩니다.</p>
                  <button 
                    onClick={handleAIGenerate} 
                    disabled={isGeneratingAI || !formData.과업명} 
                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isGeneratingAI ? '생성 중...' : '✨ AI로 자동 생성하기'}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">과업목적 *</label>
                    <textarea value={formData.과업목적} onChange={(e) => handleChange('과업목적', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={2} placeholder="이 과업의 목적 (AI 생성 또는 직접 입력)" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">과업범위 및 내용 *</label>
                    <textarea value={formData.과업범위및내용} onChange={(e) => handleChange('과업범위및내용', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={3} placeholder="과업의 범위와 내용 (AI 생성 또는 직접 입력)" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">수행방법</label>
                    <textarea value={formData.수행방법} onChange={(e) => handleChange('수행방법', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={3} placeholder="과업 수행 방법 (AI 생성 또는 직접 입력)" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">일정계획</label>
                    <textarea value={formData.일정계획} onChange={(e) => handleChange('일정계획', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={2} placeholder="일정 계획 (AI 생성 또는 직접 입력)" />
                  </div>
                </div>

                {step2Done && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="text-sm">상세 내용 작성 완료</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: 추가 정보 (선택) */}
          <details className="mb-4">
            <summary className="p-4 bg-white rounded-xl border-2 border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-700">추가 정보 (선택사항)</span>
            </summary>
            <div className="mt-2 p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">대상</label>
                <input type="text" value={formData.대상} onChange={(e) => handleChange('대상', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="대상 기관/기업" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">예상 결과물</label>
                <input type="text" value={formData.예상결과물} onChange={(e) => handleChange('예상결과물', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="최종 산출물" />
              </div>
            </div>
          </details>

          {/* 완료 상태 */}
          {step1Done && step2Done && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-green-700 font-medium mt-2">제안서 작성 완료!</p>
              <p className="text-sm text-green-600">다음 단계로 이동하세요.</p>
            </div>
          )}
        </>
      );
    } else if (currentStep === 2) {
      return (
        <>
          <h2 className="text-lg font-bold text-slate-800 mb-2">계약 체결</h2>
          <p className="text-sm text-slate-500 mb-5">아래 순서대로 진행하세요.</p>
          
          {/* STEP 1: 계약서 수령 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${checklist.계약서수령 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">계약서 수령하기</h3>
                <p className="text-sm text-slate-500 mb-3">산학협력단에서 계약서 원본을 받으세요.</p>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={checklist.계약서수령} 
                    onChange={(e) => setChecklist(prev => ({ ...prev, 계약서수령: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-green-500"
                  />
                  <span className="text-sm text-slate-600">받았어요</span>
                </label>
              </div>
            </div>
          </div>

          {/* STEP 2: 첨부 서류 준비 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${checklist.서류준비 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">첨부 서류 준비하기</h3>
                <p className="text-sm text-slate-500 mb-3">계약서와 함께 제출할 서류를 준비하세요.</p>
                
                <div className="space-y-2 mb-3">
                  {[
                    { key: '법인등기부등본', name: '법인등기부등본' },
                    { key: '통장사본', name: '통장 사본' },
                    { key: '사업자등록증', name: '사업자등록증' },
                    { key: '인감증명서', name: '인감증명서' },
                  ].map(doc => (
                    <div key={doc.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{doc.name}</span>
                      {uploadedFiles[doc.key] ? (
                        <button 
                          onClick={() => handleFileDownload(doc.key)} 
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          다운로드
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">홈에서 등록 필요</span>
                      )}
                    </div>
                  ))}
                </div>

{/* 전자수입인지 계산 및 발급 */}
                {(() => {
                  const contractAmount = parseInt((formData.계약금액_숫자 || formData.예산_숫자 || '0').replace(/,/g, ''));
                  let stampDuty = 0;
                  let stampDutyText = '';

                  if (contractAmount <= 10000000) {
                    stampDuty = 0;
                    stampDutyText = '1천만원 이하';
                  } else if (contractAmount <= 30000000) {
                    stampDuty = 20000;
                    stampDutyText = '1천만원 초과 ~ 3천만원 이하';
                  } else if (contractAmount <= 50000000) {
                    stampDuty = 40000;
                    stampDutyText = '3천만원 초과 ~ 5천만원 이하';
                  } else if (contractAmount <= 100000000) {
                    stampDuty = 70000;
                    stampDutyText = '5천만원 초과 ~ 1억원 이하';
                  } else if (contractAmount <= 1000000000) {
                    stampDuty = 150000;
                    stampDutyText = '1억원 초과 ~ 10억원 이하';
                  } else {
                    stampDuty = 350000;
                    stampDutyText = '10억원 초과';
                  }

                  // 비과세인 경우 - 회색 박스로 "발급 불필요" 표시
                  if (stampDuty === 0) {
                    return (
                      <div className="p-3 bg-slate-100 rounded-lg mb-3 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-lg">📋</span>
                            <span className="text-slate-400 text-sm line-through">전자수입인지</span>
                          </div>
                          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">발급 불필요</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          계약금액 1천만원 이하 → 인지세 면제
                        </p>
                      </div>
                    );
                  }

                  // 과세 대상인 경우 - 보라색 박스로 발급 필요 안내
                  return (
                    <div className="p-3 bg-purple-50 rounded-lg mb-3 border-2 border-purple-300">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⚠️</span>
                        <span className="font-bold text-purple-800">전자수입인지 발급 필요!</span>
                      </div>
                      <div className="space-y-1 text-sm mb-3 p-2 bg-white rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-slate-600">계약금액</span>
                          <span className="font-medium text-slate-800">{contractAmount.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">적용 구간</span>
                          <span className="text-slate-700 text-xs">{stampDutyText}</span>
                        </div>
                        <div className="flex justify-between pt-2 mt-2 border-t border-slate-200">
                          <span className="text-purple-700 font-medium">납부할 인지세</span>
                          <span className="font-bold text-purple-800 text-lg">{stampDuty.toLocaleString()}원</span>
                        </div>
                      </div>
                      <a
                        href="https://www.e-revenuestamp.or.kr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-bold"
                      >
                        전자수입인지 발급하러 가기 →
                      </a>
                      <p className="text-xs text-purple-600 text-center mt-2">
                        ※ Windows PC에서만 발급 가능합니다
                      </p>
                    </div>
                  );
                })()}

                <div className="block">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.서류준비} 
                      onChange={(e) => setChecklist(prev => ({ ...prev, 서류준비: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-green-500"
                    />
                    <span className="text-sm text-slate-600">준비 완료</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: 계약서 검토 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${checklist.계약서검토 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">계약 내용 확인하기</h3>
                <p className="text-sm text-slate-500 mb-3">계약서의 금액, 기간이 아래 내용과 맞는지 확인하세요.</p>
                
                <div className="p-3 bg-slate-50 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">계약 정보</span>
                    <button 
                      onClick={() => setIsContractEditing(!isContractEditing)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {isContractEditing ? '수정 완료' : '수정하기'}
                    </button>
                  </div>
                  
                  {isContractEditing ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">계약건명</label>
                        <input type="text" value={formData.계약건명 || formData.과업명} onChange={(e) => handleChange('계약건명', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">계약금액</label>
                        <input type="text" value={formData.계약금액_숫자 || formData.예산_숫자} onChange={(e) => handleBudgetChange(e.target.value, true)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">계약일</label>
                          <input type="date" value={formData.계약년월일} onChange={(e) => handleChange('계약년월일', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">착수일</label>
                          <input type="date" value={formData.착수년월일 || formData.수행기간_시작} onChange={(e) => handleChange('착수년월일', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">완료일</label>
                          <input type="date" value={formData.완료년월일 || formData.수행기간_종료} onChange={(e) => handleChange('완료년월일', e.target.value)} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">계약건명</span>
                        <span className="font-medium text-slate-800">{formData.계약건명 || formData.과업명 || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">계약금액</span>
                        <span className="font-medium text-slate-800">{formData.계약금액_숫자 || formData.예산_숫자 || '-'}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">계약기간</span>
                        <span className="font-medium text-slate-800">
                          {formatDate(formData.착수년월일 || formData.수행기간_시작)} ~ {formatDate(formData.완료년월일 || formData.수행기간_종료)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={checklist.계약서검토} 
                    onChange={(e) => setChecklist(prev => ({ ...prev, 계약서검토: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-green-500"
                  />
                  <span className="text-sm text-slate-600">확인했어요</span>
                </label>
              </div>
            </div>
          </div>

          {/* STEP 4: 서명 및 제출 */}
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${checklist.계약서서명 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>4</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">서명하고 제출하기</h3>
                <p className="text-sm text-slate-500 mb-3">계약서에 대표자 서명(또는 법인인감 날인) 후 제출하세요.</p>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={checklist.계약서서명} 
                    onChange={(e) => setChecklist(prev => ({ ...prev, 계약서서명: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-green-500"
                  />
                  <span className="text-sm text-slate-600">제출 완료</span>
                </label>
              </div>
            </div>
          </div>

          {/* 완료 상태 */}
          {checklist.계약서수령 && checklist.서류준비 && checklist.계약서검토 && checklist.계약서서명 && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-green-700 font-medium mt-2">계약 체결 완료!</p>
              <p className="text-sm text-green-600">다음 단계로 이동하세요.</p>
            </div>
          )}
        </>
      );
    } else if (currentStep === 3) {
      // 착수 단계 - 서류별 입력폼
      if (selectedDoc === '착수계') {
        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium mb-1">📋 착수계란?</p>
              <p className="text-xs text-blue-600">계약 착수를 알리는 서류입니다. 계약 정보를 입력하세요.</p>
            </div>

            <div className="mb-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">계약 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">계약년월일</label>
                  <input
                    type="date"
                    value={formData.계약년월일 || ''}
                    onChange={(e) => handleChange('계약년월일', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">착수년월일</label>
                  <input
                    type="date"
                    value={formData.착수년월일 || formData.수행기간_시작 || ''}
                    onChange={(e) => handleChange('착수년월일', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">완료년월일</label>
                  <input
                    type="date"
                    value={formData.완료년월일 || formData.수행기간_종료 || ''}
                    onChange={(e) => handleChange('완료년월일', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">제출일 입력</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">년</label>
                  <input type="text" value={formData.제출년} onChange={(e) => handleChange('제출년', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center" placeholder="2024" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">월</label>
                  <input type="text" value={formData.제출월} onChange={(e) => handleChange('제출월', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center" placeholder="12" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">일</label>
                  <input type="text" value={formData.제출일} onChange={(e) => handleChange('제출일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center" placeholder="15" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-700">✅ 오른쪽 미리보기에서 결과를 확인하세요.</p>
            </div>
          </>
        );
      } else if (selectedDoc === '인력투입계획서') {
        // API에서 가져온 직원을 한글 필드명으로 변환 (기관구분, 담당분야는 문서별로 직접 입력)
        const mappedEmployees = companyEmployees.map(emp => ({
          성명: emp.name || '',
          직급: emp.position || '',
          기관구분: '',  // 문서별 직접 입력
          생년월일: emp.birth_date || '',
          학교: emp.school || '',
          취득년도: emp.graduation_year || '',
          전공: emp.major || '',
          학위: emp.degree || '',
          담당분야: ''  // 문서별 직접 입력
        }));

        const addEmployeeAsResearcher = (employee) => {
          const newResearcher = { ...employee };
          setResearchers(prev => [...prev, newResearcher]);
        };

        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium mb-1">👥 인력투입계획서란?</p>
              <p className="text-xs text-blue-600">과업에 참여하는 연구원 정보를 작성하는 서류입니다.</p>
            </div>

            {/* 직원 선택 */}
            <div className="mb-5">
              <h3 className="font-semibold text-slate-700 mb-2 text-sm">직원 선택</h3>
              <p className="text-xs text-slate-500 mb-3">클릭하면 연구원으로 추가됩니다. (직원은 관리자가 등록합니다)</p>
              {mappedEmployees.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-lg">
                  등록된 직원이 없습니다. 관리자 페이지에서 직원을 등록해주세요.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mappedEmployees.map((emp, idx) => (
                    <button
                      key={idx}
                      onClick={() => addEmployeeAsResearcher(emp)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {emp.성명} <span className="text-slate-400">({emp.직급 || '직급 없음'})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-slate-700 text-sm">참여 연구원 ({researchers.length}명)</h3>
                {researchers.length > 0 && (
                  <button
                    onClick={() => setResearchers([{ 기관구분: '', 성명: '', 직급: '', 생년월일: '', 학교: '', 취득년도: '', 전공: '', 학위: '', 담당분야: '' }])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    전체 초기화
                  </button>
                )}
              </div>
              {researchers.map((r, idx) => (
                <details key={idx} className="mb-2 bg-slate-50 rounded-lg border border-slate-100" open={idx === 0}>
                  <summary className="p-3 cursor-pointer flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {r.성명 || `연구원 ${idx + 1}`}
                      {r.직급 && <span className="text-slate-400 ml-2">({r.직급})</span>}
                    </span>
                    {researchers.length > 1 && (
                      <button onClick={(e) => { e.preventDefault(); removeResearcher(idx); }} className="text-xs text-red-500 hover:underline">삭제</button>
                    )}
                  </summary>
                  <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                    <input type="text" value={r.성명} onChange={(e) => updateResearcher(idx, '성명', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="성명 *" />
                    <input type="text" value={r.직급} onChange={(e) => updateResearcher(idx, '직급', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="직급" />
                    <input type="text" value={r.기관구분} onChange={(e) => updateResearcher(idx, '기관구분', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="기관구분" />
                    <input type="text" value={r.생년월일} onChange={(e) => updateResearcher(idx, '생년월일', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="생년월일" />
                    <input type="text" value={r.학교} onChange={(e) => updateResearcher(idx, '학교', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="학교" />
                    <input type="text" value={r.취득년도} onChange={(e) => updateResearcher(idx, '취득년도', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="취득년도" />
                    <input type="text" value={r.전공} onChange={(e) => updateResearcher(idx, '전공', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="전공" />
                    <input type="text" value={r.학위} onChange={(e) => updateResearcher(idx, '학위', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="학위" />
                    <input type="text" value={r.담당분야} onChange={(e) => updateResearcher(idx, '담당분야', e.target.value)} className="col-span-2 px-2 py-1.5 border border-slate-200 rounded text-xs" placeholder="담당분야" />
                  </div>
                </details>
              ))}
              <button onClick={addResearcher} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs hover:border-blue-400 hover:text-blue-500">+ 직접 추가</button>
            </div>
          </>
        );
      } else if (selectedDoc === '공정예정표') {
        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium mb-1">📅 공정예정표란?</p>
              <p className="text-xs text-blue-600">과업 기간 동안의 일정 계획을 보여주는 서류입니다.</p>
            </div>

            {/* 빠른 설정 */}
            <div className="mb-4 p-3 bg-slate-100 rounded-lg">
              <h3 className="font-semibold text-slate-600 mb-2 text-xs">⚡ 기간 단위 선택</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setScheduleMonths(['1월', '2월', '3월', '4월']); setScheduleHeader(''); }}
                  className={`flex-1 px-3 py-1.5 text-xs border rounded-lg ${!scheduleHeader ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-200'}`}
                >월별</button>
                <button 
                  onClick={() => { setScheduleMonths(['1주', '2주', '3주', '4주']); setScheduleHeader('12월'); }}
                  className={`flex-1 px-3 py-1.5 text-xs border rounded-lg ${scheduleHeader ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-200'}`}
                >주별</button>
              </div>
            </div>

            {/* 기간 라벨 */}
            <div className="mb-4">
              <h3 className="font-semibold text-slate-700 mb-2 text-xs">📆 기간 라벨 (수정 가능)</h3>
              <div className="grid grid-cols-4 gap-1">
                {scheduleMonths.map((month, idx) => (
                  <input key={idx} type="text" value={month} onChange={(e) => { const newMonths = [...scheduleMonths]; newMonths[idx] = e.target.value; setScheduleMonths(newMonths); }} className="px-2 py-1 border border-slate-200 rounded text-xs text-center" />
                ))}
              </div>
            </div>

            {/* 연구내용 */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-700 text-xs">📝 연구내용별 일정 ({scheduleData.length}개)</h3>
                {scheduleData.length > 1 && (
                  <button
                    onClick={() => setScheduleData([{ 연구내용: '', months: [false, false, false, false] }])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    전체 초기화
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">해당 기간을 체크하면 일정 막대가 표시됩니다.</p>
              {scheduleData.map((row, idx) => (
                <div key={idx} className="mb-2 p-2 bg-slate-50 rounded-lg">
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={row.연구내용} onChange={(e) => { const newData = [...scheduleData]; newData[idx].연구내용 = e.target.value; setScheduleData(newData); }} className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs" placeholder={`연구내용 ${idx + 1}`} />
                    {scheduleData.length > 1 && (
                      <button
                        onClick={() => {
                          const newData = scheduleData.filter((_, i) => i !== idx);
                          setScheduleData(newData);
                        }}
                        className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-xs"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {scheduleMonths.map((m, mIdx) => (
                      <label key={mIdx} className="flex items-center justify-center gap-1 cursor-pointer text-xs">
                        <input type="checkbox" checked={row.months[mIdx] === true} onChange={(e) => { const newData = [...scheduleData]; newData[idx].months[mIdx] = e.target.checked; setScheduleData(newData); }} className="w-3 h-3" />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setScheduleData([...scheduleData, { 연구내용: '', months: [false, false, false, false] }])}
                className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs hover:border-blue-400 hover:text-blue-500"
              >
                + 연구내용 추가
              </button>
            </div>
          </>
        );
      } else if (selectedDoc === '책임연구원선임계') {
        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium mb-1">👤 책임연구원 선임계란?</p>
              <p className="text-xs text-blue-600">과업을 총괄하는 책임연구원을 지정하는 서류입니다.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">성명 *</label>
                <input type="text" value={leadResearcher.성명} onChange={(e) => setLeadResearcher(prev => ({ ...prev, 성명: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="홍길동" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">생년월일</label>
                <input type="text" value={leadResearcher.생년월일} onChange={(e) => setLeadResearcher(prev => ({ ...prev, 생년월일: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="1990. 01. 01." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">소속</label>
                <input type="text" value={leadResearcher.소속} onChange={(e) => setLeadResearcher(prev => ({ ...prev, 소속: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="주식회사 위니브" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">직위</label>
                <input type="text" value={leadResearcher.직위} onChange={(e) => setLeadResearcher(prev => ({ ...prev, 직위: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="대표이사" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">자격(면허)사항</label>
                <input type="text" value={leadResearcher.자격사항} onChange={(e) => setLeadResearcher(prev => ({ ...prev, 자격사항: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="정보처리기사" />
              </div>
            </div>
          </>
        );
      } else if (selectedDoc === '보안각서') {
        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium mb-1">🔒 보안각서란?</p>
              <p className="text-xs text-blue-600">과업 수행 중 취득한 정보의 보안을 서약하는 서류입니다.</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
              <p className="text-sm text-amber-800 mb-2">📝 보안각서 내용</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                본인은 위 용역의 수행과 관련하여 취득한 일체의 자료와 정보에 대하여 
                용역 수행 중은 물론 용역 수행 후에도 이를 외부에 누설, 공개하거나 
                본 용역 이외의 목적으로 사용하지 않을 것을 확약합니다.
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-700">✅ 제출일과 회사 정보가 자동으로 반영됩니다.</p>
            </div>
          </>
        );
      }
      return null;
    } else {
      // 완료 단계 - 서류별 입력폼
      if (selectedDoc === '완료계') {
        return (
          <>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-5">
              <p className="text-xs text-blue-700">💡 계약 정보는 이전 단계에서 자동으로 반영됩니다.</p>
            </div>
            <div className="mb-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">제출일</h3>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">년</label><input type="text" value={formData.제출년} onChange={(e) => handleChange('제출년', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">월</label><input type="text" value={formData.제출월} onChange={(e) => handleChange('제출월', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">일</label><input type="text" value={formData.제출일} onChange={(e) => handleChange('제출일', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              </div>
            </div>
          </>
        );
      } else if (selectedDoc === '완료검사원') {
        return (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">✅ 제출일과 계약 정보가 자동으로 반영됩니다.</p>
            </div>
          </>
        );
      } else if (selectedDoc === '완료내역서') {
        return (
          <>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-5">
              <p className="text-xs text-amber-700">💡 현재 버전에서는 미리보기에서 직접 항목을 확인할 수 있습니다. 향후 항목 입력 기능이 추가될 예정입니다.</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">🎉 모든 서류 작성이 완료되었습니다!</p>
              <p className="text-xs text-green-600 mt-1">PDF 다운로드 버튼을 눌러 서류를 저장하세요.</p>
            </div>
          </>
        );
      }
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 출력용 스타일 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print-area .a4-page {
            width: 100% !important;
            height: auto !important;
            min-height: 257mm !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: visible !important;
          }
          .print-area .a4-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          .screen-only {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
      
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50 no-print">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-2">
          {/* 왼쪽: 문서 제목 & 접속자 */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-shrink-0">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-70 transition-opacity min-w-0">
              <span className="text-xl flex-shrink-0">📄</span>
              <span className="font-bold text-slate-800 truncate max-w-[120px] lg:max-w-[200px]">{documentTitle || '새 문서'}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">← 목록</span>
            </button>

            {/* 연결 상태 & 접속자 표시 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? '연결됨' : '연결 끊김'} />
              {onlineUsers.length > 0 && (
                <div className="flex items-center gap-1">
                  {onlineUsers.slice(0, 3).map((u, i) => (
                    <div
                      key={u.id}
                      className="w-6 h-6 lg:w-7 lg:h-7 rounded-full text-white text-xs flex items-center justify-center font-medium border-2 border-white shadow-sm"
                      title={u.name}
                      style={{
                        marginLeft: i > 0 ? '-8px' : '0',
                        zIndex: 10 - i,
                        backgroundColor: getUserColor(u.id)
                      }}
                    >
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {onlineUsers.length > 3 && (
                    <span className="text-xs text-slate-500 ml-1">+{onlineUsers.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 중앙: 단계 표시 */}
          <div className="flex items-center gap-0.5 lg:gap-1 flex-shrink-0 overflow-x-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => { setCurrentStep(step.id); setSelectedDoc(stepDocuments[step.id][0].id); }}
                  className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${currentStep === step.id ? 'bg-blue-500 text-white' : currentStep > step.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  <span className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center text-xs ${currentStep === step.id ? 'bg-white text-blue-500' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-300 text-white'}`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </span>
                  <span className="hidden sm:inline">{step.name}</span>
                </button>
                {idx < steps.length - 1 && <div className={`w-4 lg:w-8 h-0.5 flex-shrink-0 ${currentStep > step.id ? 'bg-green-400' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* 오른쪽: 버튼들 */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            <button
              onClick={() => window.print()}
              className="px-2 lg:px-4 py-1.5 lg:py-2 bg-slate-100 text-slate-600 rounded-lg text-xs lg:text-sm font-medium hover:bg-slate-200"
            >
              <span className="hidden lg:inline">🖨️ </span>출력
            </button>
            <button
              onClick={() => {
                alert('출력 대화상자에서 "PDF로 저장"을 선택하세요.');
                window.print();
              }}
              className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-500 text-white rounded-lg text-xs lg:text-sm font-medium hover:bg-blue-600"
            >
              <span className="hidden lg:inline">📥 </span>PDF
            </button>
            {user?.role === 'admin' && (
              <>
                <div className="w-px h-5 bg-slate-200 mx-1 hidden lg:block" />
                <button
                  onClick={() => navigate('/admin')}
                  className="px-2 lg:px-4 py-1.5 lg:py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs lg:text-sm font-medium hidden lg:block"
                >
                  관리자
                </button>
              </>
            )}
            <div className="w-px h-5 bg-slate-200 mx-1 hidden lg:block" />
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-2 lg:px-4 py-1.5 lg:py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs lg:text-sm font-medium"
            >
              <span className="hidden lg:inline">로그아웃</span>
              <span className="lg:hidden">나가기</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 - 헤더 높이만큼 상단 여백 */}
      <div className="flex h-[calc(100vh-57px)] mt-[57px]">
        {currentStep === 2 ? (
          /* 계약 단계: 전체 너비 레이아웃 */
          <div ref={leftPanelRef} className="flex-1 bg-slate-50 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-8">
              {renderInputPanel()}
              
              {/* 네비게이션 버튼 */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex gap-3">
                  <button
                    onClick={goToPrevDoc}
                    disabled={getCurrentDocInfo().isFirst}
                    className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← 이전
                  </button>
                  {getCurrentDocInfo().isStepLast ? (
                    // 다음 단계로 가는 버튼 - 더 강조된 스타일
                    <button
                      onClick={goToNextDoc}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 hover:shadow-xl transition-all border-2 border-green-400"
                    >
                      🚀 {steps[currentStep]?.name} 단계로 →
                    </button>
                  ) : (
                    // 다음 서류 버튼 - 기본 스타일
                    <button
                      onClick={goToNextDoc}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:bg-blue-600 hover:shadow-xl transition-all"
                    >
                      다음 서류 →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 다른 단계: 입력 패널 + 미리보기 레이아웃 */
          <>
            {/* 입력 패널 - 화면에 완전 고정 */}
            <div style={{
              position: 'fixed',
              left: 0,
              top: '57px',
              width: `${panelWidth}px`,
              height: 'calc(100vh - 57px)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10
            }} className="bg-white border-r border-slate-200 no-print">
              {/* 제목 - 상단 고정 */}
              <div style={{ flexShrink: 0 }} className="p-5 pb-3 border-b border-slate-100 bg-white">
                <h2 className="text-lg font-bold text-slate-800">
                  {stepDocuments[currentStep].find(d => d.id === selectedDoc)?.name || ''}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {currentStep === 1 && selectedDoc === '제안서' && '제안 정보를 입력하세요.'}
                  {currentStep === 1 && selectedDoc === '견적서' && '견적 항목을 입력하세요.'}
                  {currentStep === 3 && selectedDoc === '착수계' && '착수 서류를 확인하세요.'}
                  {currentStep === 3 && selectedDoc === '인력투입계획서' && '참여 연구원 정보를 입력하세요.'}
                  {currentStep === 3 && selectedDoc === '공정예정표' && '기간별 일정을 체크하세요.'}
                  {currentStep === 3 && selectedDoc === '책임연구원선임계' && '책임연구원 정보를 입력하세요.'}
                  {currentStep === 3 && selectedDoc === '보안각서' && '보안 서약 서류입니다.'}
                  {currentStep === 4 && selectedDoc === '완료계' && '완료 서류를 확인하세요.'}
                  {currentStep === 4 && selectedDoc === '완료검사원' && '완료 검사 서류입니다.'}
                  {currentStep === 4 && selectedDoc === '완료내역서' && '납품 항목 서류입니다.'}
                </p>
              </div>

              {/* 내용 - 스크롤 영역 */}
              <div ref={leftPanelRef} style={{ flex: 1, overflowY: 'auto' }} className="p-5">
                {renderInputPanel()}
              </div>
              
              {/* 서류 네비게이션 - 하단 고정 */}
              <div style={{ flexShrink: 0 }} className="p-5 pt-4 border-t border-slate-100 bg-white">
                {/* 현재 위치 표시 */}
                <div className="text-center mb-3">
                  <span className="text-xs text-slate-400">
                    {steps[currentStep - 1]?.name} 단계 ({getCurrentDocInfo().current}/{getCurrentDocInfo().total})
                  </span>
                </div>
                
                {/* 네비게이션 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={goToPrevDoc}
                    disabled={getCurrentDocInfo().isFirst}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← 이전
                  </button>
                  {getCurrentDocInfo().isStepLast && currentStep < 4 ? (
                    // 다음 단계로 가는 버튼 - 더 강조된 스타일
                    <button
                      onClick={goToNextDoc}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 hover:shadow-xl transition-all border-2 border-green-400"
                    >
                      🚀 {steps[currentStep]?.name} 단계로 →
                    </button>
                  ) : (
                    // 다음 서류 버튼 - 기본 스타일
                    <button
                      onClick={goToNextDoc}
                      disabled={getCurrentDocInfo().isLast}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:bg-blue-600 hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {getCurrentDocInfo().isLast ? '✓ 완료' : '다음 서류 →'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 리사이즈 핸들 */}
            <div
              ref={resizeRef}
              onMouseDown={handleMouseDown}
              style={{
                position: 'fixed',
                left: `${panelWidth - 3}px`,
                top: '57px',
                width: '6px',
                height: 'calc(100vh - 57px)',
                cursor: 'col-resize',
                zIndex: 20,
              }}
              className="no-print group"
            >
              <div
                style={{
                  position: 'absolute',
                  left: '2px',
                  top: 0,
                  width: '2px',
                  height: '100%',
                  transition: 'background-color 0.2s',
                }}
                className={`${isResizing ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-400'}`}
              />
            </div>

            {/* 미리보기 탭 바 - 화면에 고정 */}
            <div style={{
              position: 'fixed',
              left: `${panelWidth}px`,
              right: 0,
              top: '57px',
              zIndex: 10,
              height: '49px'
            }} className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">미리보기:</span>
                <div className="flex gap-2">
                  {stepDocuments[currentStep].map(doc => (
                    <button key={doc.id} onClick={() => setSelectedDoc(doc.id)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedDoc === doc.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{doc.name}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 미리보기 콘텐츠 - 탭 바 아래 (화면용) */}
            <div ref={previewPanelRef} style={{ marginLeft: `${panelWidth}px`, marginTop: '49px' }} className="flex-1 bg-slate-200 p-8 overflow-auto flex flex-col items-center gap-8 screen-only">
              {renderPreview()}
            </div>
          </>
        )}
      </div>

      {/* 출력 전용 영역 */}
      <div className="print-area print-only">
        {renderPreview()}
      </div>
    </div>
  );
}
