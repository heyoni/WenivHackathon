import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { membersAPI, employeesAPI } from '../api/client';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'employees'
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 직원 관리 상태
  const [employees, setEmployees] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    position: '',
    birth_date: '',
    school: '',
    graduation_year: '',
    major: '',
    degree: ''
  });

  // 데이터 로드
  const loadData = async () => {
    try {
      const [membersRes, invitationsRes, employeesRes] = await Promise.all([
        membersAPI.getMembers(),
        membersAPI.getInvitations(),
        employeesAPI.getEmployees(),
      ]);
      setMembers(membersRes.data.members);
      setPendingCount(membersRes.data.pending_count);
      setActiveCount(membersRes.data.active_count);
      setInvitations(invitationsRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 직원 폼 리셋
  const resetEmployeeForm = () => {
    setEmployeeForm({
      name: '',
      position: '',
      birth_date: '',
      school: '',
      graduation_year: '',
      major: '',
      degree: ''
    });
    setEditingEmployee(null);
  };

  // 직원 등록/수정
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingEmployee) {
        await employeesAPI.updateEmployee(editingEmployee.id, employeeForm);
        setSuccess('직원 정보가 수정되었습니다.');
      } else {
        await employeesAPI.createEmployee(employeeForm);
        setSuccess('직원이 등록되었습니다.');
      }
      setShowEmployeeModal(false);
      resetEmployeeForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || '직원 등록/수정에 실패했습니다.');
    }
  };

  // 직원 삭제
  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await employeesAPI.deleteEmployee(employeeId);
      setSuccess('직원이 삭제되었습니다.');
      loadData();
    } catch (err) {
      setError('직원 삭제에 실패했습니다.');
    }
  };

  // 직원 수정 모달 열기
  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name || '',
      position: employee.position || '',
      birth_date: employee.birth_date || '',
      school: employee.school || '',
      graduation_year: employee.graduation_year || '',
      major: employee.major || '',
      degree: employee.degree || ''
    });
    setShowEmployeeModal(true);
  };

  // 회원 상태 변경
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await membersAPI.updateStatus(userId, newStatus);
      setSuccess('상태가 변경되었습니다.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || '상태 변경에 실패했습니다.');
    }
  };

  // 초대 발송
  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await membersAPI.invite(inviteEmail);
      setSuccess('초대가 발송되었습니다.');
      setInviteEmail('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || '초대 발송에 실패했습니다.');
    }
  };

  // 초대 취소
  const handleCancelInvitation = async (invitationId) => {
    try {
      await membersAPI.deleteInvitation(invitationId);
      setSuccess('초대가 취소되었습니다.');
      loadData();
    } catch (err) {
      setError('초대 취소에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h1 className="font-bold text-slate-800">{user?.company?.name}</h1>
              <p className="text-xs text-slate-500">회사 코드: {user?.company?.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              서류 작성
            </button>
            <div className="text-sm text-slate-600">
              {user?.name} ({user?.role === 'admin' ? '관리자' : '회원'})
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'members'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            회원 관리
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'employees'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            직원 관리 ({employees.length})
          </button>
        </div>

        {activeTab === 'members' && (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-slate-800">{members.length}</div>
                <div className="text-slate-500">전체 회원</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-green-600">{activeCount}</div>
                <div className="text-slate-500">활성 회원</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-orange-500">{pendingCount}</div>
                <div className="text-slate-500">승인 대기</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
          {/* 회원 초대 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">회원 초대</h2>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="이메일 주소"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                초대
              </button>
            </form>

            {/* 초대 목록 */}
            <div className="mt-4 space-y-2">
              {invitations.filter((i) => !i.used).map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-slate-700">{invitation.email}</div>
                    <div className="text-xs text-slate-500">
                      만료: {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    취소
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 승인 대기 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">승인 대기 ({pendingCount})</h2>
            <div className="space-y-2">
              {members
                .filter((m) => m.status === 'pending')
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-700">{member.name}</div>
                      <div className="text-sm text-slate-500">{member.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(member.id, 'active')}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleStatusChange(member.id, 'inactive')}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              {pendingCount === 0 && (
                <div className="text-slate-400 text-center py-4">승인 대기 중인 회원이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* 회원 목록 */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">회원 목록</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">이름</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">이메일</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">권한</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">상태</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">가입일</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">관리</th>
              </tr>
            </thead>
            <tbody>
              {members
                .filter((m) => m.status !== 'pending')
                .map((member) => (
                  <tr key={member.id} className="border-b border-slate-100">
                    <td className="py-3 px-4">{member.name}</td>
                    <td className="py-3 px-4 text-slate-500">{member.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.role === 'admin' ? '관리자' : '회원'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {member.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {member.id !== user?.id && (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              member.id,
                              member.status === 'active' ? 'inactive' : 'active'
                            )
                          }
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {member.status === 'active' ? '비활성화' : '활성화'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
          </>
        )}

        {activeTab === 'employees' && (
          <>
            {/* 직원 등록 버튼 */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  resetEmployeeForm();
                  setShowEmployeeModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                + 직원 등록
              </button>
            </div>

            {/* 직원 목록 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">직원 목록</h2>
              {employees.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  등록된 직원이 없습니다. 직원을 등록해주세요.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">성명</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">직급</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">학력</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium">{employee.name}</td>
                        <td className="py-3 px-4 text-slate-600">{employee.position || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {employee.school ? `${employee.school} ${employee.major || ''} ${employee.degree || ''}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(employee)}
                              className="text-sm text-blue-500 hover:underline"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-sm text-red-500 hover:underline"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* 직원 등록/수정 모달 */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editingEmployee ? '직원 정보 수정' : '직원 등록'}
            </h2>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">성명 *</label>
                  <input
                    type="text"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">직급</label>
                  <input
                    type="text"
                    value={employeeForm.position}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="예: 부장, 과장, 책임연구원"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">생년월일</label>
                  <input
                    type="text"
                    value={employeeForm.birth_date}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, birth_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="예: 1985.03.15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">학교</label>
                  <input
                    type="text"
                    value={employeeForm.school}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, school: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="예: 서울대학교"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">취득년도</label>
                  <input
                    type="text"
                    value={employeeForm.graduation_year}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, graduation_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="예: 2010"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">전공</label>
                  <input
                    type="text"
                    value={employeeForm.major}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, major: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="예: 컴퓨터공학"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">학위</label>
                  <input
                    type="text"
                    value={employeeForm.degree}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="예: 학사, 석사, 박사"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeModal(false);
                    resetEmployeeForm();
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
                >
                  {editingEmployee ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
