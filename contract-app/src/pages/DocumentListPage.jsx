import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI, filesAPI, membersAPI } from '../api/client';
import useAuthStore from '../store/authStore';

function DocumentListPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  // 서류 보관함
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [filesLoading, setFilesLoading] = useState(true);

  // 회사 정보
  const [companyInfo, setCompanyInfo] = useState({
    business_number: '',
    representative: '',
    phone: '',
    address: ''
  });
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(null); // 수정 중인 임시 데이터
  const [companyInfoSaving, setCompanyInfoSaving] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadFiles();
    loadCompanyInfo();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getDocuments();
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError('문서 목록을 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      setFilesLoading(true);
      const response = await filesAPI.getFiles();
      // 백엔드에서 dict 형식으로 반환: { "법인등기부등본": {...}, "통장사본": null, ... }
      const filesMap = {};
      Object.entries(response.data).forEach(([fileType, fileData]) => {
        if (fileData) {
          filesMap[fileType] = {
            name: fileData.file_name,
            data: fileData.file_data,
            type: fileData.mime_type,
            uploadedAt: fileData.created_at
          };
        }
      });
      setUploadedFiles(filesMap);
    } catch (err) {
      console.error('파일 로드 실패:', err);
    } finally {
      setFilesLoading(false);
    }
  };

  const loadCompanyInfo = async () => {
    try {
      const response = await membersAPI.getCompanyInfo();
      setCompanyInfo({
        business_number: response.data.business_number || '',
        representative: response.data.representative || '',
        phone: response.data.phone || '',
        address: response.data.address || ''
      });
    } catch (err) {
      console.error('회사 정보 로드 실패:', err);
    }
  };

  const handleCompanyInfoChange = (field, value) => {
    setEditingCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const startEditingCompany = () => {
    setEditingCompanyInfo({ ...companyInfo });
    setIsEditingCompany(true);
  };

  const cancelEditingCompany = () => {
    setEditingCompanyInfo(null);
    setIsEditingCompany(false);
  };

  const saveCompanyInfo = async () => {
    try {
      setCompanyInfoSaving(true);
      await membersAPI.updateCompanyInfo(editingCompanyInfo);
      setCompanyInfo(editingCompanyInfo);
      setEditingCompanyInfo(null);
      setIsEditingCompany(false);
    } catch (err) {
      console.error('회사 정보 저장 실패:', err);
      alert('회사 정보 저장에 실패했습니다');
    } finally {
      setCompanyInfoSaving(false);
    }
  };

  const handleFileUpload = async (fileType, file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await filesAPI.uploadFile({
          file_type: fileType,
          file_name: file.name,
          file_data: e.target.result
        });
        loadFiles();
      } catch (err) {
        console.error('파일 업로드 실패:', err);
        alert('파일 업로드에 실패했습니다');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDownload = (fileType) => {
    const file = uploadedFiles[fileType];
    if (file) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      link.click();
    }
  };

  const handleFileDelete = async (fileType) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await filesAPI.deleteFile(fileType);
      loadFiles();
    } catch (err) {
      console.error('파일 삭제 실패:', err);
      alert('파일 삭제에 실패했습니다');
    }
  };

  const handleCreateDocument = async () => {
    try {
      setCreating(true);
      const response = await documentsAPI.createDocument({ title: '새 용역' });
      navigate(`/document/${response.data.id}`);
    } catch (err) {
      setError('문서 생성에 실패했습니다');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await documentsAPI.deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      setError('문서 삭제에 실패했습니다');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    // 서버에서 UTC로 저장되지만 timezone 정보가 없으므로 명시적으로 UTC로 파싱
    const utcDate = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(utcDate);
    return date.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">WeSign</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name} ({user?.company?.name})</span>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                회원 관리
              </button>
            )}
            <button
              onClick={logout}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 문서 목록 */}
          <div className="lg:col-span-2">
            {/* 새 문서 버튼 */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-700">📄 용역 문서</h2>
              <button
                onClick={handleCreateDocument}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 용역 문서
                  </>
                )}
              </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {/* 문서 목록 */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-slate-500">로딩 중...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-slate-500">아직 문서가 없습니다</p>
                <p className="text-sm text-slate-400">'새 용역 문서'를 눌러 시작하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  // 과업명이 있으면 과업명, 없으면 '제목 없음'
                  const docTitle = doc.form_data?.과업명 || '제목 없음';
                  const budget = doc.form_data?.예산_숫자;
                  const startDate = doc.form_data?.수행기간_시작;
                  const endDate = doc.form_data?.수행기간_종료;

                  // 현재 단계 정보
                  const currentStep = doc.form_data?._currentStep || 1;
                  const selectedDoc = doc.form_data?._selectedDoc || '제안서';
                  const stepInfo = {
                    1: { name: '제안', color: 'bg-blue-100 text-blue-700', icon: '📝' },
                    2: { name: '계약', color: 'bg-purple-100 text-purple-700', icon: '📋' },
                    3: { name: '착수', color: 'bg-orange-100 text-orange-700', icon: '🚀' },
                    4: { name: '완료', color: 'bg-green-100 text-green-700', icon: '✅' }
                  };
                  const step = stepInfo[currentStep] || stepInfo[1];

                  return (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800 text-lg">{docTitle}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${step.color}`}>
                              {step.icon} {step.name} - {selectedDoc}
                            </span>
                          </div>
                          {(budget || startDate) && (
                            <p className="text-sm text-slate-500 mt-1">
                              {budget && <span>{parseInt(budget.replace(/,/g, '')).toLocaleString()}원</span>}
                              {budget && startDate && <span className="mx-2">·</span>}
                              {startDate && <span>{startDate} ~ {endDate}</span>}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            수정: {formatDate(doc.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="삭제"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 오른쪽: 회사 정보 + 서류 보관함 */}
          <div className="lg:col-span-1">
            {/* 회사 정보 */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-700">🏢 회사 정보</h2>
                <p className="text-sm text-slate-500 mt-1">견적서 및 서류에 사용됩니다</p>
              </div>
              {user?.role === 'admin' && !isEditingCompany && (
                <button
                  onClick={startEditingCompany}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  수정
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              {isEditingCompany ? (
                // 수정 모드
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">사업자등록번호</label>
                      <input
                        type="text"
                        value={editingCompanyInfo?.business_number || ''}
                        onChange={(e) => handleCompanyInfoChange('business_number', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="000-00-00000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">대표자명</label>
                      <input
                        type="text"
                        value={editingCompanyInfo?.representative || ''}
                        onChange={(e) => handleCompanyInfoChange('representative', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">전화번호</label>
                      <input
                        type="text"
                        value={editingCompanyInfo?.phone || ''}
                        onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="02-0000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">주소</label>
                      <input
                        type="text"
                        value={editingCompanyInfo?.address || ''}
                        onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="서울시 강남구..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={saveCompanyInfo}
                      disabled={companyInfoSaving}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      {companyInfoSaving ? '저장 중...' : '적용'}
                    </button>
                    <button
                      onClick={cancelEditingCompany}
                      disabled={companyInfoSaving}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                // 보기 모드
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-24 text-slate-500">사업자번호</span>
                    <span className="text-slate-700">{companyInfo.business_number || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">대표자명</span>
                    <span className="text-slate-700">{companyInfo.representative || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">전화번호</span>
                    <span className="text-slate-700">{companyInfo.phone || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">주소</span>
                    <span className="text-slate-700">{companyInfo.address || '-'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 서류 보관함 */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-700">📁 서류 보관함</h2>
              <p className="text-sm text-slate-500 mt-1">자주 쓰는 서류를 미리 등록해두세요</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="space-y-3">
                {[
                  { key: '법인등기부등본', name: '법인등기부등본', desc: '인터넷등기소' },
                  { key: '통장사본', name: '통장 사본', desc: '법인 통장' },
                  { key: '사업자등록증', name: '사업자등록증', desc: '홈택스' },
                  { key: '인감증명서', name: '인감증명서', desc: '등기소' },
                ].map(doc => (
                  <div key={doc.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-700 block truncate">{doc.name}</span>
                      <span className="text-xs text-slate-400">{doc.desc}</span>
                    </div>
                    {uploadedFiles[doc.key] ? (
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-green-600">✓</span>
                        <button
                          onClick={() => handleFileDownload(doc.key)}
                          className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
                          title="다운로드"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleFileDelete(doc.key)}
                          className="p-1.5 text-xs text-red-500 hover:bg-red-50 rounded"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 ml-2">
                        등록
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files[0] && handleFileUpload(doc.key, e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  {Object.values(uploadedFiles).filter(Boolean).length} / 4 등록됨
                </p>
              </div>
            </div>

            {/* 안내 */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 서류 보관함에 등록된 파일은 계약 단계에서<br/>바로 다운로드할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentListPage;
