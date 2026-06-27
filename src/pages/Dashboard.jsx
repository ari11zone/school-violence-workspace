import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

const statusConfig = {
  investigation: { label: '사안 조사 중', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', route: '/investigation' },
  statements: { label: '진술서 작성 중', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', route: '/statements' },
  deliberation: { label: '전담기구 심의', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', route: '/deliberation' },
  packaging: { label: '패키징 완료', color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500', route: '/packaging' },
  closed: { label: '종결', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', route: '/' },
};

const violenceTypes = ['언어폭력', '신체폭력', '사이버불링', '금품갈취', '강요·협박', '성폭력', '따돌림', '기타'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { cases, createCase, selectCase, showToast, deleteCase, allowCaseRegistration } = useCase();
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTypes, setNewTypes] = useState([]);
  const [newVictim, setNewVictim] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const urgentCase = cases.find(c => c.status === 'statements' || c.status === 'investigation');

  // 검색 & 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 실제 D-Day 계산 (48시간 기준)
  function calcDDay(createdAt) {
    if (!createdAt) return null;
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return null;
    const deadline = new Date(created.getTime() + 48 * 60 * 60 * 1000);
    const diffMs = deadline - new Date();
    if (diffMs <= 0) return { label: '기한초과', overdue: true };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours < 24) return { label: `${hours}시간 ${minutes}분`, overdue: hours < 6 };
    const days = Math.floor(hours / 24);
    return { label: `D-${days}`, overdue: false };
  }

  const urgentDeadline = urgentCase ? calcDDay(urgentCase.createdAt) : null;

  // 이번 달 종결 건수 계산
  const thisMonthClosed = useMemo(() => {
    const now = new Date();
    return cases.filter(c => {
      if (c.status !== 'closed') return false;
      const d = new Date(c.createdAt);
      return !isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [cases]);

  // 검색 & 필터 적용
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        c.id.toLowerCase().includes(q) ||
        (c.investigation?.victimName || '').toLowerCase().includes(q) ||
        (c.investigation?.incidentType || '').toLowerCase().includes(q) ||
        (c.investigation?.incidentLocation || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [cases, searchQuery, filterStatus]);

  function handleCreateCase() {
    if (newTypes.length === 0 || !newVictim) {
      showToast('사안 유형과 피해학생 이름을 입력해주세요.', 'error');
      return;
    }
    createCase({
      investigation: {
        incidentType: newTypes.join(','),
        victimName: newVictim,
        incidentDate: newDate,
        incidentTime: newTime,
        incidentLocation: newLocation,
      }
    });
    setShowNewModal(false);
    setNewTypes([]);
    setNewVictim('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    showToast('새 사안이 등록되었습니다. 사안 조사를 시작해주세요.');
    navigate('/investigation');
  }

  function handleCloseModal() {
    setShowNewModal(false);
    setNewTypes([]);
    setNewVictim('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
  }

  function handleContinue(c) {
    selectCase(c.id);
    const cfg = statusConfig[c.status];
    navigate(cfg.route);
  }

  const progressMap = {
    investigation: 20,
    statements: 45,
    deliberation: 70,
    packaging: 90,
    closed: 100,
  };

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">사안 대시보드</h1>
          <p className="text-on-surface-variant mt-1">학교폭력 사안 처리 현황 및 법정 기한을 관리합니다.</p>
        </div>
        <div className="relative group">
          <button
            onClick={() => {
              if (!allowCaseRegistration) {
                showToast('관리자에 의해 새 사안 등록이 제한되어 있습니다.', 'warn');
                return;
              }
              setShowNewModal(true);
            }}
            disabled={!allowCaseRegistration}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-md transition-all ${
              allowCaseRegistration
                ? 'bg-primary text-white hover:opacity-90 active:scale-95'
                : 'bg-outline-variant text-on-surface-variant cursor-not-allowed opacity-60'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            새 사안 등록
          </button>
          {!allowCaseRegistration && (
            <div className="absolute bottom-full mb-2 right-0 bg-on-surface text-surface text-xs rounded-xl px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              관리자에 의해 등록이 비활성화되어 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* Urgent Alert */}
      {urgentCase && (
        <div className="mb-6 bg-error-container border border-error/30 rounded-2xl p-5 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-error rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-error text-lg">긴급 처리 사안 (법정 기한 임박)</span>
                <span className={`text-white text-xs px-2 py-0.5 rounded-full font-bold ${urgentDeadline?.overdue ? 'bg-red-700 animate-pulse' : 'bg-error'}`}>
                  {urgentDeadline?.label || 'D-?'}
                </span>
              </div>
              <p className="text-on-error-container text-sm">
                <span className="font-bold">{urgentCase.id}호</span> — {(urgentCase.investigation.incidentType || '').replace(/,/g, ' · ') || '유형 미입력'}
                <span className="ml-3 text-on-error-container/70">학교폭력예방법 제13조: 인지 후 48시간 이내 보고 필수</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleContinue(urgentCase)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          >
            즉시 처리
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '진행 중 사안', value: cases.filter(c => c.status !== 'closed').length, icon: 'folder_open', color: 'text-primary bg-primary/10' },
          { label: '진술서 수집 중', value: cases.filter(c => c.status === 'statements').length, icon: 'history_edu', color: 'text-amber-600 bg-amber-50' },
          { label: '심의 대기', value: cases.filter(c => c.status === 'deliberation').length, icon: 'gavel', color: 'text-purple-600 bg-purple-50' },
          { label: '이번 달 종결', value: thisMonthClosed, icon: 'check_circle', color: 'text-teal-600 bg-teal-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-outline-variant p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value}건</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Case Table */}
      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-outline-variant">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-primary text-lg">전체 사안 목록</h2>
            <span className="text-sm text-on-surface-variant">{filteredCases.length}/{cases.length}건</span>
          </div>
          {/* 검색 & 필터 */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="사안번호, 학생이름, 유형, 장소 검색..."
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-outline-variant rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="all">전체 상태</option>
              <option value="investigation">사안 조사 중</option>
              <option value="statements">진술서 수집 중</option>
              <option value="deliberation">전담기구 심의</option>
              <option value="packaging">패키징 완료</option>
              <option value="closed">종결</option>
            </select>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-primary text-white">
            <tr>
              {['사안번호', '발생일시', '유형', '피해(관련)학생', '현재 단계', '진행률', '작업'].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-semibold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-[40px] block mb-2 text-outline-variant">search_off</span>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : filteredCases.map((c, i) => {
              const cfg = statusConfig[c.status] || statusConfig.closed;
              const prog = progressMap[c.status] || 0;
              return (
                <tr key={c.id} className={`hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                  <td className="px-5 py-4 font-bold text-primary text-sm">{c.id}</td>
                  <td className="px-5 py-4 text-sm">{c.investigation.incidentDate || c.createdAt}</td>
                  <td className="px-5 py-4 text-sm">{(c.investigation.incidentType || '').replace(/,/g, ' · ') || '—'}</td>
                  <td className="px-5 py-4 text-sm">{c.investigation.victimName || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary-container h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${prog}%` }} />
                      </div>
                      <span className="text-xs text-on-surface-variant w-8">{prog}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {c.status !== 'closed' ? (
                        <button
                          onClick={() => handleContinue(c)}
                          className="flex items-center gap-1 text-primary border border-primary rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-primary hover:text-white transition-all"
                        >
                          계속 진행
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant font-medium px-3 py-1.5">종결됨</span>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`${c.id}호 사안을 정말로 삭제하시겠습니까?`)) {
                            deleteCase(c.id);
                            showToast('사안이 삭제되었습니다.', 'success');
                          }
                        }}
                        className="p-1.5 text-error hover:bg-error/15 rounded-lg transition-all flex items-center justify-center"
                        title="사안 삭제"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: 'description', label: '표준 서식 다운로드', sub: '보고서·진술서·동의서 양식', action: () => window.open('https://drive.google.com/file/d/13oYNhLAbN8aZi9pOSTcnoW_0yR4_y4Wl/view?usp=sharing', '_blank') },
          { icon: 'book_2', label: '법령 및 매뉴얼', sub: '학교폭력예방법 조문 안내', action: () => window.open('https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=168327', '_blank') },
          { icon: 'support_agent', label: '전문 상담 연결', sub: '117 학교폭력 신고센터', action: () => window.open('tel:117') },
        ].map(q => (
          <button
            key={q.label}
            onClick={q.action}
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-outline-variant hover:border-primary hover:shadow-md transition-all group text-left"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center transition-all flex-shrink-0">
              <span className="material-symbols-outlined text-primary group-hover:text-white text-[24px] transition-all">{q.icon}</span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">{q.label}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{q.sub}</p>
            </div>
            <span className="ml-auto material-symbols-outlined text-outline group-hover:text-primary text-[20px] transition-all">chevron_right</span>
          </button>
        ))}
      </div>

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">add_circle</span>
              </div>
              <div>
                <h2 className="font-bold text-primary text-xl">새 사안 등록</h2>
                <p className="text-on-surface-variant text-sm">기본 정보를 입력하고 조사를 시작합니다.</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  사안 유형 <span className="text-error">*</span>
                  {newTypes.length > 0 && (
                    <span className="ml-2 normal-case text-[11px] bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                      {newTypes.length}개 선택
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {violenceTypes.map(t => {
                    const selected = newTypes.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewTypes(prev =>
                          prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                        )}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all flex items-center justify-center gap-1.5
                          ${selected
                            ? 'bg-primary text-white border-primary font-bold shadow-sm'
                            : 'border-outline-variant text-on-surface hover:border-primary hover:bg-primary/5'}`}
                      >
                        {selected && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                        {t}
                      </button>
                    );
                  })}
                </div>
                {newTypes.length > 0 && (
                  <p className="text-[11px] text-on-surface-variant mt-2 truncate">
                    선택: {newTypes.join(' · ')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">피해(관련)학생 이름 <span className="text-error">*</span></label>
                <input
                  type="text"
                  value={newVictim}
                  onChange={e => setNewVictim(e.target.value)}
                  placeholder="예: 김○○"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">발생 일자</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">발생 시각</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">발생 장소</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="예: 3학년 2반 교실"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCloseModal} className="flex-1 py-3 border border-outline-variant rounded-xl text-on-surface-variant font-bold hover:bg-surface-container transition-all">
                취소
              </button>
              <button onClick={handleCreateCase} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md">
                등록 후 조사 시작
                <span className="material-symbols-outlined text-[16px] ml-1 align-middle">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
