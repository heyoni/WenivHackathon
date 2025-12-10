import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { membersAPI } from '../api/client';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 데이터 로드
  const loadData = async () => {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        membersAPI.getMembers(),
        membersAPI.getInvitations(),
      ]);
      setMembers(membersRes.data.members);
      setPendingCount(membersRes.data.pending_count);
      setActiveCount(membersRes.data.active_count);
      setInvitations(invitationsRes.data);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      </div>
    </div>
  );
}
