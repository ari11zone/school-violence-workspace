import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = 'teacher1234';

export default function AdminPortal() {
  /* ─── Auth ─── */
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('sv_super_admin') === 'true'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  /* ─── Schools data ─── */
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ─── Add school modal ─── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  /* ─── Delete confirm ─── */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ─── Toast ─── */
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* ─── Fetch schools ─── */
  const fetchSchools = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      showToast('학교 목록을 불러오는데 실패했습니다.', 'error');
    } else {
      setSchools(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchSchools();
  }, [isAuthenticated, fetchSchools]);

  /* ─── Login ─── */
  function handleLogin(e) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sv_super_admin', 'true');
      setAuthError('');
    } else {
      setAuthError('비밀번호가 올바르지 않습니다.');
      setPasswordInput('');
    }
  }

  /* ─── Logout ─── */
  function handleLogout() {
    sessionStorage.removeItem('sv_super_admin');
    setIsAuthenticated(false);
  }

  /* ─── Add school ─── */
  async function handleAddSchool(e) {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) {
      showToast('학교명과 URL을 모두 입력해주세요.', 'error');
      return;
    }
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setAdding(true);
    const { error } = await supabase.from('schools').insert([{ name: newName.trim(), url }]);
    setAdding(false);
    if (error) {
      showToast('학교 추가에 실패했습니다.', 'error');
    } else {
      showToast(`"${newName.trim()}" 학교가 등록되었습니다.`);
      setNewName('');
      setNewUrl('');
      setShowAddModal(false);
      fetchSchools(true);
    }
  }

  /* ─── Toggle block ─── */
  async function handleToggleBlock(school) {
    const { error } = await supabase
      .from('schools')
      .update({ is_blocked: !school.is_blocked })
      .eq('id', school.id);
    if (error) {
      showToast('상태 변경에 실패했습니다.', 'error');
    } else {
      showToast(school.is_blocked ? '접속 차단이 해제되었습니다.' : '접속이 차단되었습니다.');
      fetchSchools(true);
    }
  }

  /* ─── Delete school ─── */
  async function handleDelete(id) {
    const { error } = await supabase.from('schools').delete().eq('id', id);
    setDeleteTarget(null);
    if (error) {
      showToast('삭제에 실패했습니다.', 'error');
    } else {
      showToast('학교가 삭제되었습니다.');
      fetchSchools(true);
    }
  }

  /* ─── Auth screen ─── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#1b2d45] to-[#0d1b2a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-white text-[32px]">shield_person</span>
            </div>
            <h1 className="text-white text-xl font-bold">학폭 사안처리 시스템</h1>
            <p className="text-white/50 text-sm mt-1">슈퍼 관리자 포털</p>
          </div>

          {/* Login card */}
          <form onSubmit={handleLogin}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔒</span>
              <h2 className="text-white text-lg font-bold">관리자 인증</h2>
            </div>

            <div className="mb-4">
              <input
                type="password"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setAuthError(''); }}
                placeholder="관리자 비밀번호를 입력하세요"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all text-sm"
                autoFocus
              />
              {authError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {authError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button"
                onClick={() => window.history.back()}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-2xl text-sm font-medium transition-all border border-white/10">
                취소
              </button>
              <button type="submit"
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30">
                인증하기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ─── Main portal ─── */
  const activeCount = schools.filter(s => !s.is_blocked).length;
  const blockedCount = schools.filter(s => s.is_blocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#1b2d45] to-[#0d1b2a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
              <span className="material-symbols-outlined text-white text-[18px]">shield_person</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm">학폭 사안처리 시스템</span>
              <span className="text-white/40 text-xs ml-2">슈퍼 관리자 포털</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchSchools(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-xl text-xs transition-all ${refreshing ? 'animate-pulse' : ''}`}>
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              새로고침
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-red-300 rounded-xl text-xs transition-all border border-white/10">
              <span className="material-symbols-outlined text-[15px]">logout</span>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: 'school', label: '등록된 학교', value: schools.length + '개', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-300' },
            { icon: 'check_circle', label: '정상 운영', value: activeCount + '개', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
            { icon: 'block', label: '접속 차단', value: blockedCount + '개', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-300' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5 backdrop-blur-sm`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${s.text} text-[24px]`}>{s.icon}</span>
                <div>
                  <p className="text-white/50 text-xs">{s.label}</p>
                  <p className={`${s.text} text-2xl font-bold`}>{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[22px]">corporate_fare</span>
            전체 학교 목록
          </h2>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[18px]">add</span>
            학교 추가
          </button>
        </div>

        {/* School list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/40">
            <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">불러오는 중...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/30">
            <span className="material-symbols-outlined text-[64px] mb-4 opacity-30">school</span>
            <p className="text-lg font-medium">등록된 학교가 없습니다</p>
            <p className="text-sm mt-1 opacity-60">상단의 "학교 추가" 버튼으로 새 학교를 등록하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schools.map((school, idx) => (
              <div key={school.id}
                className={`group flex items-center gap-4 bg-white/5 hover:bg-white/10 border rounded-2xl p-5 transition-all backdrop-blur-sm
                  ${school.is_blocked ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'}`}>
                {/* Index badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${school.is_blocked ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{school.name}</span>
                    {school.is_blocked && (
                      <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                        <span className="material-symbols-outlined text-[11px]">block</span>접속 차단
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 truncate">{school.url}</p>
                  <p className="text-white/25 text-xs mt-0.5">
                    등록일: {new Date(school.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={school.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-blue-500/30 text-white/70 hover:text-blue-300 rounded-xl text-xs font-medium transition-all border border-white/10 hover:border-blue-500/40">
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    방문
                  </a>
                  <button onClick={() => handleToggleBlock(school)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border
                      ${school.is_blocked
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/20 hover:border-amber-500/40'}`}>
                    <span className="material-symbols-outlined text-[15px]">
                      {school.is_blocked ? 'lock_open' : 'block'}
                    </span>
                    {school.is_blocked ? '차단 해제' : '접속 차단'}
                  </button>
                  <button onClick={() => setDeleteTarget(school)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-xl text-xs font-medium transition-all border border-red-500/20 hover:border-red-500/40">
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    완전 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── Add School Modal ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1a2d45] border border-white/20 rounded-3xl p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400 text-[20px]">add_business</span>
              </div>
              <div>
                <h3 className="text-white font-bold">새 학교 등록</h3>
                <p className="text-white/40 text-xs">학교명과 배포 URL을 입력하세요</p>
              </div>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">학교명 *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="예: ○○중학교"
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400 transition-all text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">배포 URL *</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="예: https://school-violence-xx.vercel.app"
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400 transition-all text-sm"
                />
                <p className="text-white/30 text-xs mt-1.5">
                  각 학교별로 별도 배포된 웹앱의 URL을 입력하세요
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setNewName(''); setNewUrl(''); }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-all">
                  취소
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30">
                  {adding ? '등록 중...' : '학교 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1a2d45] border border-red-500/30 rounded-3xl p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-[20px]">warning</span>
              </div>
              <h3 className="text-white font-bold">학교 삭제</h3>
            </div>
            <p className="text-white/60 text-sm mb-6">
              <span className="text-white font-semibold">"{deleteTarget.name}"</span>을(를) 완전히 삭제하시겠습니까?<br />
              <span className="text-red-400">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-all">
                취소
              </button>
              <button onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/30">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium backdrop-blur-xl border transition-all
          ${toast.type === 'error'
            ? 'bg-red-950/80 border-red-500/40 text-red-200'
            : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'}`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
