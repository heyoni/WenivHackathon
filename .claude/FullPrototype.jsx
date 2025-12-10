import React, { useState } from 'react';

// ============================================================
// 메인 앱 - 라우팅 역할
// ============================================================
export default function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'project'
  const [currentProject, setCurrentProject] = useState(null);
  
  const openProject = (project) => {
    setCurrentProject(project);
    setCurrentView('project');
  };
  
  const goToList = () => {
    setCurrentView('list');
    setCurrentProject(null);
  };
  
  if (currentView === 'list') {
    return <ProjectList onOpenProject={openProject} />;
  }
  
  return <ProjectDetail project={currentProject} onBack={goToList} />;
}

// ============================================================
// 프로젝트 목록 화면
// ============================================================
function ProjectList({ onOpenProject }) {
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: '성인학습자 취·창업 역량강화 실무 교육',
      budget: '20,000,000',
      status: 'start', // proposal, contract, start, complete
      createdAt: '2025-11-20',
    },
    {
      id: '2', 
      name: 'AI 교육 콘텐츠 개발',
      budget: '15,000,000',
      status: 'proposal',
      createdAt: '2025-12-01',
    },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const createProject = () => {
    if (!newProjectName.trim()) return;
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName,
      budget: '',
      status: 'proposal',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects([newProject, ...projects]);
    setNewProjectName('');
    setShowModal(false);
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      proposal: '제안',
      contract: '계약', 
      start: '착수',
      complete: '완료'
    };
    return labels[status];
  };
  
  const getStatusColor = (status) => {
    const colors = {
      proposal: 'bg-blue-100 text-blue-700',
      contract: 'bg-yellow-100 text-yellow-700',
      start: 'bg-green-100 text-green-700', 
      complete: 'bg-gray-100 text-gray-700'
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">📑 용역 서류 자동 생성</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + 새 프로젝트
          </button>
        </div>
      </header>
      
      {/* 프로젝트 목록 */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">{project.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                {project.budget && (
                  <span>💰 {project.budget}원</span>
                )}
                <span>📅 {project.createdAt}</span>
              </div>
              
              {/* 단계 진행 표시 */}
              <div className="mt-4 flex items-center gap-2">
                {['proposal', 'contract', 'start', 'complete'].map((stage, idx) => {
                  const stages = ['proposal', 'contract', 'start', 'complete'];
                  const currentIdx = stages.indexOf(project.status);
                  const isComplete = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  
                  return (
                    <React.Fragment key={stage}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isComplete ? 'bg-green-500 text-white' : 
                          isCurrent ? 'bg-blue-500 text-white' : 
                          'bg-gray-200 text-gray-500'}`}
                      >
                        {isComplete ? '✓' : idx + 1}
                      </div>
                      {idx < 3 && (
                        <div className={`flex-1 h-1 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-400 px-1">
                <span>제안</span>
                <span>계약</span>
                <span>착수</span>
                <span>완료</span>
              </div>
            </div>
          ))}
        </div>
        
        {projects.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📁</div>
            <p>프로젝트가 없습니다.</p>
            <p className="text-sm">새 프로젝트를 만들어 시작하세요.</p>
          </div>
        )}
      </main>
      
      {/* 새 프로젝트 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">새 프로젝트 만들기</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="프로젝트명 (과업명)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={createProject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 프로젝트 상세 화면
// ============================================================
function ProjectDetail({ project, onBack }) {
  const [currentStage, setCurrentStage] = useState(project.status);
  const stages = ['proposal', 'contract', 'start', 'complete'];
  const stageLabels = { proposal: '제안', contract: '계약', start: '착수', complete: '완료' };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← 목록
          </button>
          <h1 className="text-lg font-bold text-gray-800">{project.name}</h1>
        </div>
      </header>
      
      {/* 단계 탭 */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center justify-center py-4">
          {stages.map((stage, idx) => {
            const currentIdx = stages.indexOf(project.status);
            const isComplete = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isActive = stage === currentStage;
            
            return (
              <React.Fragment key={stage}>
                <button
                  onClick={() => setCurrentStage(stage)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isComplete ? 'bg-green-500 text-white' : 
                      isCurrent ? 'bg-blue-500 text-white' : 
                      'bg-gray-300 text-white'}`}
                  >
                    {isComplete ? '✓' : idx + 1}
                  </div>
                  <span className="font-medium">{stageLabels[stage]}</span>
                </button>
                {idx < 3 && (
                  <div className={`w-16 h-0.5 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* 단계별 컨텐츠 */}
      <main>
        {currentStage === 'proposal' && <ProposalStage project={project} />}
        {currentStage === 'contract' && <ContractStage project={project} />}
        {currentStage === 'start' && <StartStage project={project} />}
        {currentStage === 'complete' && <CompleteStage project={project} />}
      </main>
    </div>
  );
}

// ============================================================
// 제안 단계 - 과업지시서
// ============================================================
function ProposalStage({ project }) {
  const [formData, setFormData] = useState({
    taskName: project.name,
    budget: '20000000',
    budgetKorean: '이천만',
    periodStart: '2025. 11. 27.',
    periodEnd: '2026. 01. 08.',
    description: '바이브코딩을 활용한 AI 리터러시 교육',
    target: '성인학습자 30명',
    expectedOutput: '결과보고서, 교육 수료자',
    // AI 생성 결과
    purpose: '',
    scope: '',
    method: '',
    schedule: '',
  });
  
  const [previewDoc, setPreviewDoc] = useState('과업지시서');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    // TODO: 실제 OpenAI API 호출
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        purpose: '본 과업은 성인학습자를 대상으로 AI 리터러시 역량을 강화하여 디지털 전환 시대에 필요한 실무 능력을 배양하고자 함.',
        scope: '1. 교육 프로그램 기획 및 설계\n2. 교육 콘텐츠 개발\n3. 교육 운영 및 관리\n4. 교육 성과 평가',
        method: '1단계: 교육 수요조사 및 커리큘럼 설계\n2단계: 교육 자료 개발\n3단계: 교육 실시\n4단계: 성과 평가 및 보고서 작성',
        schedule: '1주차: 수요조사\n2-3주차: 커리큘럼 설계\n4-5주차: 콘텐츠 개발\n6주차: 교육 실시 및 평가',
      }));
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* 왼쪽: 입력 패널 */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">📝 과업지시서 작성</h2>
        
        {/* 기본 정보 */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">기본 정보</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">과업명 *</label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => handleChange('taskName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예산 (숫자) *</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예산 (한글)</label>
                <input
                  type="text"
                  value={formData.budgetKorean}
                  onChange={(e) => handleChange('budgetKorean', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">수행기간 시작 *</label>
                <input
                  type="text"
                  value={formData.periodStart}
                  onChange={(e) => handleChange('periodStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">수행기간 종료 *</label>
                <input
                  type="text"
                  value={formData.periodEnd}
                  onChange={(e) => handleChange('periodEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">간단한 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대상</label>
              <input
                type="text"
                value={formData.target}
                onChange={(e) => handleChange('target', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예상 결과물</label>
              <input
                type="text"
                value={formData.expectedOutput}
                onChange={(e) => handleChange('expectedOutput', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* AI 생성 */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">AI 자동 생성</h3>
          
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 mb-4"
          >
            {isGenerating ? '🔄 생성 중...' : '🤖 AI로 생성하기'}
          </button>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">과업목적</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="AI 생성 또는 직접 입력"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">과업범위 및 내용</label>
              <textarea
                value={formData.scope}
                onChange={(e) => handleChange('scope', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="AI 생성 또는 직접 입력"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수행방법</label>
              <textarea
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="AI 생성 또는 직접 입력"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">일정계획</label>
              <textarea
                value={formData.schedule}
                onChange={(e) => handleChange('schedule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="AI 생성 또는 직접 입력"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 오른쪽: 미리보기 */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">미리보기: 과업지시서</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            📥 PDF 다운로드
          </button>
        </div>
        
        {/* A4 미리보기 - 정확한 비율 */}
        <div 
          className="bg-white shadow-lg mx-auto"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '25mm',
            fontFamily: "'Nanum Myeongjo', serif",
            fontSize: '12pt',
            lineHeight: '1.8',
            transformOrigin: 'top center',
            transform: 'scale(0.7)',
            marginBottom: '-200px'
          }}
        >
          {/* 표지 */}
          <div style={{ height: '247mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '18pt', marginBottom: '80px' }}>
              「{formData.taskName}」 용역
            </div>
            <div style={{ fontSize: '36pt', fontWeight: 'bold', marginBottom: '100px' }}>
              과업지시서
            </div>
            <div style={{ fontSize: '16pt' }}>
              주식회사 위니브
            </div>
          </div>
          
          {/* 페이지 구분 */}
          <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
            <h2 style={{ fontSize: '18pt', fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
              1. 과업개요
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>가. 과업명</div>
              <div style={{ paddingLeft: '20px' }}>{formData.taskName}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>나. 과업예산</div>
              <div style={{ paddingLeft: '20px' }}>금 {Number(formData.budget).toLocaleString()}원 (금 {formData.budgetKorean}원)</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>다. 과업목적</div>
              <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.purpose || '(AI 생성 또는 직접 입력)'}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>라. 수행기간</div>
              <div style={{ paddingLeft: '20px' }}>{formData.periodStart} ~ {formData.periodEnd}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>마. 과업개요</div>
              <div style={{ paddingLeft: '20px' }}>{formData.description}</div>
              <div style={{ paddingLeft: '30px', marginTop: '10px' }}>- 대상: {formData.target}</div>
              <div style={{ paddingLeft: '30px' }}>- 예상 결과물: {formData.expectedOutput}</div>
            </div>
            
            <h2 style={{ fontSize: '18pt', fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px', marginTop: '50px' }}>
              2. 세부사항
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>가. 과업범위 및 내용</div>
              <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.scope || '(AI 생성 또는 직접 입력)'}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>나. 수행방법</div>
              <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.method || '(AI 생성 또는 직접 입력)'}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>다. 일정계획</div>
              <div style={{ paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>{formData.schedule || '(AI 생성 또는 직접 입력)'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 계약 단계 - 체크리스트
// ============================================================
function ContractStage({ project }) {
  const [formData, setFormData] = useState({
    contractAmount: '20,000,000',
    contractAmountKorean: '이천만',
    contractDate: '2025. 11. 27.',
  });
  
  const [checklist, setChecklist] = useState({
    계약보증금지급각서: false,
    청렴서약서: false,
    서약서: false,
    수의계약각서: false,
    인감증명서: false,
    사업자등록증: false,
    법인등기부등본: false,
    통장사본: false,
    정부수입인지: false,
  });
  
  const toggleCheck = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };
  
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">📋 계약 정보</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">계약금액 (숫자)</label>
            <input
              type="text"
              value={formData.contractAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, contractAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">계약금액 (한글)</label>
            <input
              type="text"
              value={formData.contractAmountKorean}
              onChange={(e) => setFormData(prev => ({ ...prev, contractAmountKorean: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">계약년월일</label>
            <input
              type="text"
              value={formData.contractDate}
              onChange={(e) => setFormData(prev => ({ ...prev, contractDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">✅ 계약 서류 체크리스트</h2>
          <span className="text-sm text-gray-500">{completedCount} / {totalCount} 완료</span>
        </div>
        
        {/* 진행 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* 업체 제공 서류 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">📄 업체 제공 서류</h3>
            <div className="space-y-2">
              {['계약보증금지급각서', '청렴서약서', '서약서', '수의계약각서'].map(item => (
                <label key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={checklist[item]}
                    onChange={() => toggleCheck(item)}
                    className="w-5 h-5 rounded"
                  />
                  <span className={checklist[item] ? 'text-gray-500 line-through' : 'text-gray-700'}>{item}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 고정 서류 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">📎 고정 서류</h3>
            <div className="space-y-2">
              {['인감증명서', '사업자등록증', '법인등기부등본', '통장사본', '정부수입인지'].map(item => (
                <label key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={checklist[item]}
                    onChange={() => toggleCheck(item)}
                    className="w-5 h-5 rounded"
                  />
                  <span className={checklist[item] ? 'text-gray-500 line-through' : 'text-gray-700'}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 정부수입인지는 <a href="https://www.e-revenuestamp.or.kr" target="_blank" className="underline">전자수입인지 사이트</a>에서 납부하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 착수 단계 - 서류 작성
// ============================================================
function StartStage({ project }) {
  const [formData, setFormData] = useState({
    계약건명: project.name,
    계약금액_숫자: '20,000,000',
    계약금액_한글: '이천만',
    계약년월일: '2025. 11. 27.',
    착수년월일: '2025. 11. 27.',
    완료년월일: '2026. 01. 08.',
    상호: '주식회사 위니브',
    주소: '제주도 제주시 구산로 58, 2층',
    대표자: '이호준',
    제출년: '2025',
    제출월: '11',
    제출일: '27',
  });
  
  const [researchers, setResearchers] = useState([
    { 기관구분: '위니브', 성명: '이호준', 직급: '대표', 생년월일: '1985.01.01', 학교: '제주대', 취득년도: '2010', 전공: '컴퓨터공학', 학위: '학사', 담당분야: '총괄' },
  ]);
  
  const [previewDoc, setPreviewDoc] = useState('착수계');
  
  const documents = [
    { id: '착수계', name: '착수계' },
    { id: '인력투입계획서', name: '인력투입계획서' },
    { id: '공정예정표', name: '공정예정표' },
    { id: '책임연구원선임계', name: '책임연구원(기술자) 선임계' },
    { id: '보안각서', name: '보안각서' },
  ];
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* 왼쪽: 입력 패널 */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">📝 착수 서류 작성</h2>
        
        {/* 계약 정보 */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">계약 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계약건명</label>
              <input
                type="text"
                value={formData.계약건명}
                onChange={(e) => handleChange('계약건명', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">계약금액 (한글)</label>
                <input
                  type="text"
                  value={formData.계약금액_한글}
                  onChange={(e) => handleChange('계약금액_한글', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">착수년월일</label>
              <input
                type="text"
                value={formData.착수년월일}
                onChange={(e) => handleChange('착수년월일', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">완료년월일</label>
              <input
                type="text"
                value={formData.완료년월일}
                onChange={(e) => handleChange('완료년월일', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
              <input
                type="text"
                value={formData.제출월}
                onChange={(e) => handleChange('제출월', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">일</label>
              <input
                type="text"
                value={formData.제출일}
                onChange={(e) => handleChange('제출일', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 중앙: 문서 목록 */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">📄 문서 목록</h3>
          <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
            전체 PDF
          </button>
        </div>
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
      
      {/* 오른쪽: 미리보기 */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">미리보기: {previewDoc}</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            📥 PDF 다운로드
          </button>
        </div>
        
        {/* A4 미리보기 - 정확한 크기 */}
        <div 
          className="bg-white shadow-lg mx-auto"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '25mm',
            fontFamily: "'Nanum Myeongjo', serif",
            fontSize: '14pt',
            lineHeight: '1.8',
            transformOrigin: 'top center',
            transform: 'scale(0.6)',
            marginBottom: '-300px'
          }}
        >
          {previewDoc === '착수계' && (
            <>
              <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
                <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>
                  착&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계
                </span>
              </h1>
              
              <div style={{ textAlign: 'right', marginBottom: '30px', paddingRight: '40px', whiteSpace: 'pre' }}>
                경  유 :           (인)
              </div>
              
              <div style={{ marginBottom: '3px' }}>○ 계약건명 : {formData.계약건명}</div>
              <div style={{ marginBottom: '3px' }}>○ 계약금액 : 금 {formData.계약금액_숫자}원(금 {formData.계약금액_한글}원)</div>
              <div style={{ marginBottom: '3px' }}>○ 계약년월일 : {formData.계약년월일}</div>
              <div style={{ marginBottom: '3px' }}>○ 착수년월일 : {formData.착수년월일}</div>
              <div style={{ marginBottom: '3px' }}>○ 완료년월일 : {formData.완료년월일}</div>
              
              <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>
                상기와 같이 착수계를 제출합니다.
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                {formData.제출년}년    {formData.제출월}월    {formData.제출일}일
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
            </>
          )}
          
          {previewDoc === '인력투입계획서' && (
            <>
              <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', marginBottom: '40px' }}>
                <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>
                  인&nbsp;&nbsp;력&nbsp;&nbsp;투&nbsp;&nbsp;입&nbsp;&nbsp;계&nbsp;&nbsp;획&nbsp;&nbsp;서
                </span>
              </h1>
              
              <div style={{ marginBottom: '8px', fontSize: '13pt' }}>1. 계약건명 : {formData.계약건명}</div>
              <div style={{ marginBottom: '15px', fontSize: '13pt' }}>2. 계약기간 : {formData.착수년월일} ~ {formData.완료년월일}</div>
              <div style={{ marginBottom: '10px', fontSize: '13pt' }}>3. 인력투입계획서</div>
              <div style={{ marginBottom: '10px', paddingLeft: '10px', fontSize: '13pt' }}>○ 참여연구원</div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '30px' }}>
                <thead>
                  <tr>
                    <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>기관<br/>구분</th>
                    <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>성명</th>
                    <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>직급<br/>(위)</th>
                    <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>생년월일</th>
                    <th colSpan="4" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>전공 및 학위</th>
                    <th rowSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f5f5f5' }}>과제<br/>담당<br/>분야</th>
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
                      <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{r.기관구분}</td>
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
                  {[...Array(Math.max(0, 8 - researchers.length))].map((_, i) => (
                    <tr key={`empty-${i}`}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} style={{ border: '1px solid black', padding: '8px', height: '30px' }}></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
                {formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일
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
            </>
          )}
          
          {previewDoc === '공정예정표' && (
            <>
              <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', marginBottom: '40px' }}>
                <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>
                  공&nbsp;&nbsp;정&nbsp;&nbsp;예&nbsp;&nbsp;정&nbsp;&nbsp;표
                </span>
              </h1>
              
              <div style={{ marginBottom: '8px', fontSize: '13pt' }}>1. 계약건명 : {formData.계약건명}</div>
              <div style={{ marginBottom: '15px', fontSize: '13pt' }}>2. 계약기간 : {formData.착수년월일} ~ {formData.완료년월일}</div>
              <div style={{ marginBottom: '10px', fontSize: '13pt' }}>3. 공정예정표</div>
              
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
                    {['11월', '12월', '1월'].map((month, i) => (
                      <th key={i} style={{ border: '1px solid black', padding: '10px', textAlign: 'center', width: '23%' }}>
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid black', padding: '10px', height: '40px' }}></td>
                      <td style={{ border: '1px solid black', padding: '10px' }}></td>
                      <td style={{ border: '1px solid black', padding: '10px' }}></td>
                      <td style={{ border: '1px solid black', padding: '10px' }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
                {formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일
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
            </>
          )}
          
          {previewDoc === '책임연구원선임계' && (
            <>
              <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', marginBottom: '40px' }}>
                <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>
                  책임연구원(기술자)&nbsp;선임계
                </span>
              </h1>
              
              <div style={{ marginBottom: '8px', fontSize: '13pt' }}>1. 계약건명 : {formData.계약건명}</div>
              <div style={{ marginBottom: '8px', fontSize: '13pt' }}>2. 계약금액 : 금 {formData.계약금액_숫자}원(금 {formData.계약금액_한글}원)</div>
              <div style={{ marginBottom: '15px', fontSize: '13pt' }}>3. 계약기간 : {formData.착수년월일} ~ {formData.완료년월일}</div>
              
              <div style={{ marginBottom: '8px', fontSize: '13pt' }}>4. 책임연구원(기술자)</div>
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
                {formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일
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
            </>
          )}
          
          {previewDoc === '보안각서' && (
            <>
              <h1 style={{ textAlign: 'center', fontSize: '28pt', fontWeight: 'bold', marginBottom: '50px' }}>
                <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>
                  보&nbsp;&nbsp;안&nbsp;&nbsp;각&nbsp;&nbsp;서
                </span>
              </h1>
              
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold' }}>계 약 건 명 : </span>{formData.계약건명}
              </div>
              
              <div style={{ textAlign: 'justify', lineHeight: '2', marginBottom: '30px' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;본인은 위 용역의 수행과 관련하여 취득한 일체의 자료와 정보에 대하여 
                용역 수행 중은 물론 용역 수행 후에도 이를 외부에 누설, 공개하거나 
                본 용역 이외의 목적으로 사용하지 않을 것을 확약하며, 
                이를 위반할 경우 관련 법령에 따른 모든 민·형사상의 책임을 질 것을 각서합니다.
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '50px' }}>
                {formData.제출년}년&nbsp;&nbsp;{formData.제출월}월&nbsp;&nbsp;&nbsp;&nbsp;{formData.제출일}일
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 완료 단계 - 서류 작성
// ============================================================
function CompleteStage({ project }) {
  const [formData, setFormData] = useState({
    계약건명: project.name,
    계약금액_숫자: '20,000,000',
    계약금액_한글: '이천만',
    계약년월일: '2025. 11. 27.',
    착수년월일: '2025. 11. 27.',
    완료년월일: '2026. 01. 08.',
    상호: '주식회사 위니브',
    주소: '제주도 제주시 구산로 58, 2층',
    대표자: '이호준',
    제출년: '2026',
    제출월: '01',
    제출일: '08',
  });
  
  const [previewDoc, setPreviewDoc] = useState('완료계');
  
  const documents = [
    { id: '완료계', name: '완료계' },
    { id: '완료검사원', name: '완료검사원' },
    { id: '완료내역서', name: '완료내역서' },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* 왼쪽: 입력 패널 (착수 단계와 유사) */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">📝 완료 서류 작성</h2>
        {/* 입력 폼 - StartStage와 동일 구조 */}
        <p className="text-sm text-gray-500">* 착수 단계에서 입력한 정보가 자동으로 적용됩니다.</p>
      </div>
      
      {/* 중앙: 문서 목록 */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">📄 문서 목록</h3>
          <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
            전체 PDF
          </button>
        </div>
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
      
      {/* 오른쪽: 미리보기 */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">미리보기: {previewDoc}</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            📥 PDF 다운로드
          </button>
        </div>
        
        {/* A4 미리보기 */}
        <div 
          className="bg-white shadow-lg mx-auto"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '25mm',
            fontFamily: "'Nanum Myeongjo', serif",
            fontSize: '14pt',
            lineHeight: '1.8',
            transformOrigin: 'top center',
            transform: 'scale(0.6)',
            marginBottom: '-300px'
          }}
        >
          {previewDoc === '완료계' && (
            <>
              <h1 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: 'bold', marginBottom: '40px' }}>
                <span style={{ borderBottom: '2px solid black', paddingBottom: '4px' }}>
                  완&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;료&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계
                </span>
              </h1>
              
              <div style={{ textAlign: 'right', marginBottom: '30px', paddingRight: '40px', whiteSpace: 'pre' }}>
                경  유 :           (인)
              </div>
              
              <div style={{ marginBottom: '3px' }}>❍ 용 역 명 : {formData.계약건명}</div>
              <div style={{ marginBottom: '3px' }}>❍ 계약금액 : 금 {formData.계약금액_숫자}원(금 {formData.계약금액_한글}원)</div>
              <div style={{ marginBottom: '3px' }}>❍ 완료금액 : 금 {formData.계약금액_숫자}원(금 {formData.계약금액_한글}원)</div>
              <div style={{ marginBottom: '3px' }}>❍ 계약년월일 : {formData.계약년월일}</div>
              <div style={{ marginBottom: '3px' }}>❍ 착수년월일 : {formData.착수년월일}</div>
              <div style={{ marginBottom: '3px' }}>❍ 완료예정일 : {formData.완료년월일}</div>
              <div style={{ marginBottom: '3px' }}>❍ 완료년월일 : {formData.완료년월일}</div>
              
              <div style={{ textAlign: 'center', margin: '60px 0 50px 0' }}>
                상기와 같이 완료되었기에 완료계를 제출합니다.
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                {formData.제출년}년    {formData.제출월}월    {formData.제출일}일
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
