import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

const VIOLENCE_TYPES = ['언어폭력', '신체폭력', '사이버불링', '금품갈취', '강요·협박', '성폭력', '따돌림', '기타'];

const statusConfig = {
  investigation: { label: '사안 조사 중', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', route: '/investigation' },
  statements: { label: '진술서 작성 중', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', route: '/statements' },
  deliberation: { label: '전담기구 심의', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', route: '/deliberation' },
  packaging: { label: '패키징 완료', color: 'bg-teal-100 text-teal-700 hover:bg-teal-200', route: '/packaging' },
  closed: { label: '종결', color: 'bg-gray-100 text-gray-500 hover:bg-gray-200', route: '/' },
};

export default function Admin() {
  const navigate = useNavigate();
  const {
    cases,
    allowCaseRegistration,
    toggleAllowCaseRegistration,
    toggleLockCase,
    clearClosedCases,
    resetCases,
    createCase,
    selectCase,
    showToast,
    deleteCase
  } = useCase();

  // Authentication state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('school_violence_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // New case form state
  const [newType, setNewType] = useState('');
  const [newVictim, setNewVictim] = useState('');
  const [newPerp, setNewPerp] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');

  function handleLogin(e) {
    if (e) e.preventDefault();
    if (password === 'teacher1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('school_violence_admin_auth', 'true');
      setAuthError('');
      showToast('관리자 인증에 성공했습니다.');
    } else {
      setAuthError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  }

  function handleCloseAdmin() {
    navigate('/');
  }

  function handleCreateCaseInAdmin(e) {
    e.preventDefault();
    if (!newType || !newVictim) {
      showToast('사안 유형과 피해학생 이름을 입력해주세요.', 'error');
      return;
    }
    const id = createCase({
      investigation: {
        incidentType: newType,
        victimName: newVictim,
        perpetratorName: newPerp,
        incidentDate: newDate,
        incidentTime: newTime,
        incidentLocation: newLocation,
      }
    });

    if (id) {
      setShowAddModal(false);
      setNewType('');
      setNewVictim('');
      setNewPerp('');
      setNewDate('');
      setNewTime('');
      setNewLocation('');
      showToast('새 사안이 등록되었습니다.');
    }
  }

  function handleVisitCase(c) {
    selectCase(c.id);
    const cfg = statusConfig[c.status];
    navigate(cfg.route);
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1520]/90 backdrop-blur-md">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4 relative border border-outline-variant">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-on-surface flex items-center justify-center gap-2">
              <span className="text-2xl">🔒</span> 관리자 인증
            </h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
              className="w-full border border-outline-variant bg-surface-container-lowest rounded-xl px-4 py-3 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono tracking-widest"
            />
            {authError && (
              <p className="text-error text-xs text-center font-semibold animate-pulse">{authError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCloseAdmin}
                className="flex-1 py-3 bg-secondary-container text-on-secondary-container rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#1e2530] text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                인증하기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1280px] mx-auto min-h-screen">
      {/* Admin Title Banner */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">shield_person</span>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">사안 통합 관리 시스템</h1>
        </div>
        <button
          onClick={handleCloseAdmin}
          className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant text-on-surface-variant rounded-xl text-sm font-bold bg-white hover:bg-surface-container transition-all"
        >
          닫기
        </button>
      </div>

      {/* Top Controls Board */}
      <div className="bg-white rounded-2xl border border-outline-variant p-6 mb-8 flex flex-wrap items-center gap-6 shadow-sm">
        {/* Toggle Switch */}
        <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant px-5 py-3.5 rounded-2xl flex-1 min-w-[200px]">
          <div>
            <p className="text-xs text-on-surface-variant font-bold mb-0.5">사안 자동 생성</p>
            <p className={`text-sm font-extrabold ${allowCaseRegistration ? 'text-primary' : 'text-error'}`}>
              {allowCaseRegistration ? '활성' : '비활성'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={allowCaseRegistration}
              onChange={toggleAllowCaseRegistration}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e2530]"></div>
          </label>
        </div>

        {/* Total Cases Stats */}
        <div className="bg-surface-container-low border border-outline-variant px-5 py-3.5 rounded-2xl flex-1 min-w-[150px]">
          <p className="text-xs text-on-surface-variant font-bold mb-0.5">전체 클래스 (사안)</p>
          <p className="text-sm font-extrabold text-on-surface">
            <span className="text-xl text-primary">{cases.length}</span> 개
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 items-center min-w-[240px]">
          <button
            onClick={() => {
              if (window.confirm('종결된 모든 사안을 목록에서 삭제하시겠습니까?')) {
                clearClosedCases();
              }
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 border border-[#ffb4ab] text-error bg-error-container/10 rounded-2xl text-sm font-bold hover:bg-error-container/20 transition-all flex-1"
          >
            <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
            일괄 정리
          </button>
          <button
            onClick={() => {
              if (!allowCaseRegistration) {
                showToast('사안 자동 생성 상태가 비활성 상태입니다.', 'warn');
              }
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 bg-[#1e2530] text-white rounded-2xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md flex-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            학급 추가
          </button>
        </div>
      </div>

      {/* Case Table List */}
      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-extrabold text-primary text-base">전체 학급 (사안) 목록</h2>
          <span className="text-xs text-on-surface-variant font-bold bg-secondary-container px-2.5 py-1 rounded-full">{cases.length}건</span>
        </div>
        <div className="divide-y divide-outline-variant">
          {cases.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">folder_off</span>
              <p className="text-sm font-bold">등록된 사안이 없습니다.</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">상단의 "학급 추가" 버튼을 눌러 새 사안을 등록하세요.</p>
            </div>
          ) : (
            cases.map(c => {
              const statusCfg = statusConfig[c.status] || statusConfig.closed;
              return (
                <div key={c.id} className="flex flex-wrap items-center justify-between p-5 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-on-surface tracking-tight">
                          {c.id.startsWith('202') ? `${c.id.substring(0, 4)}학년도 ` : ''}사안 {c.id}호
                        </span>
                        <span className="text-xs font-mono bg-surface-container-high border border-outline-variant text-on-secondary-container px-2 py-0.5 rounded-full">
                          {c.id}
                        </span>
                        {c.isLocked && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[12px]">lock</span>
                            접속 차단됨
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          피해: {c.investigation.victimName || '미작성'}{c.investigation.victimGrade ? ` (${c.investigation.victimGrade}학년)` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person_alert</span>
                          가해: {c.investigation.perpetratorName || '미작성'}{c.investigation.perpetratorGrade ? ` (${c.investigation.perpetratorGrade}학년)` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          생성: {c.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 mt-4 md:mt-0 flex-wrap">
                    {/* Status Badge Link */}
                    <button
                      onClick={() => handleVisitCase(c)}
                      className={`text-xs font-bold px-3 py-2.5 rounded-xl transition-all ${statusCfg.color} mr-1`}
                    >
                      {statusCfg.label}
                    </button>

                    {/* Visit */}
                    <button
                      onClick={() => handleVisitCase(c)}
                      className="px-4 py-2 border border-outline-variant bg-white text-on-surface font-bold text-xs rounded-xl hover:bg-surface-container transition-all"
                    >
                      방문
                    </button>

                    {/* Lock / Unlock */}
                    <button
                      onClick={() => toggleLockCase(c.id)}
                      className={`px-4 py-2 border font-bold text-xs rounded-xl transition-all ${
                        c.isLocked
                          ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {c.isLocked ? '접속허용' : '접속차단'}
                    </button>

                    {/* Delete Permanently */}
                    <button
                      onClick={() => {
                        if (window.confirm(`${c.id}호 사안을 정말로 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                          deleteCase(c.id);
                          showToast('사안이 영구 삭제되었습니다.');
                        }
                      }}
                      className="px-4 py-2 bg-error-container/20 border border-[#ffb4ab] text-error font-bold text-xs rounded-xl hover:bg-error-container/30 transition-all"
                    >
                      완전삭제
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 border border-outline-variant" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-outline-variant">
              <div className="w-10 h-10 bg-[#1e2530] text-white rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </div>
              <div>
                <h2 className="font-bold text-on-surface text-lg">사안 (학급) 추가</h2>
                <p className="text-on-surface-variant text-xs">새 사안 번호를 부여하고 조사를 생성합니다.</p>
              </div>
            </div>

            <form onSubmit={handleCreateCaseInAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">사안 유형 *</label>
                <div className="grid grid-cols-2 gap-2">
                  {VIOLENCE_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`px-3 py-2 rounded-lg text-xs border font-medium transition-all ${
                        newType === t ? 'bg-[#1e2530] text-white border-[#1e2530] font-bold' : 'border-outline-variant text-on-surface hover:border-primary'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">피해학생 이름 *</label>
                <input
                  type="text"
                  value={newVictim}
                  onChange={e => setNewVictim(e.target.value)}
                  placeholder="예: 김○○"
                  required
                  className="w-full border border-outline-variant bg-surface-container-lowest rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">가해학생 이름</label>
                <input
                  type="text"
                  value={newPerp}
                  onChange={e => setNewPerp(e.target.value)}
                  placeholder="예: 이○○"
                  className="w-full border border-outline-variant bg-surface-container-lowest rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">발생 일자</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-lowest rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">발생 시각</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-lowest rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">발생 장소</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="예: 교실, 운동장 등"
                  className="w-full border border-outline-variant bg-surface-container-lowest rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-xl text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1e2530] text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  등록 및 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
