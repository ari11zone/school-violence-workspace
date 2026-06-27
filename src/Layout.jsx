import { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useCase } from './context/CaseContext';

const navItems = [
  { to: '/', icon: 'dashboard', label: '대시보드', exact: true, statusKey: null },
  { to: '/investigation', icon: 'search', label: '사안 조사', step: 1, statusKey: 'investigation' },
  { to: '/statements', icon: 'history_edu', label: '진술서/동의서', step: 2, statusKey: 'statements' },
  { to: '/deliberation', icon: 'gavel', label: '전담기구 심의', step: 3, statusKey: 'deliberation' },
  { to: '/packaging', icon: 'inventory_2', label: '최종 패키징', step: 4, statusKey: 'packaging' },
];

// 48시간 D-Day 카운터 계산
function calcDeadline(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (isNaN(created.getTime())) return null;
  const deadline = new Date(created.getTime() + 48 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = deadline - now;
  if (diffMs <= 0) return { overdue: true, hours: 0, minutes: 0 };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { overdue: false, hours, minutes };
}

// 단계 완료 여부 판단
function isStepCompleted(currentCase, statusKey) {
  if (!currentCase || !statusKey) return false;
  const stageOrder = ['investigation', 'statements', 'deliberation', 'packaging', 'closed'];
  const caseStageIdx = stageOrder.indexOf(currentCase.status);
  const itemStageIdx = stageOrder.indexOf(statusKey);
  if (itemStageIdx < caseStageIdx) return true;
  if (itemStageIdx === caseStageIdx) return currentCase[statusKey]?.completed === true;
  return false;
}

export default function Layout() {
  const location = useLocation();
  const { toast, currentCase } = useCase();

  const [today, setToday] = useState(() =>
    new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
    })
  );

  // deadline을 useMemo로 파생 - 현재사안 createdAt 기준 실시간 계산
  // (today 상태가 1분마다 갱신되뮼서 재렌더링됨)
  const deadline = useMemo(
    () => calcDeadline(currentCase?.createdAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCase?.createdAt, today] // today 구독 → 1분마다 자동 재계산
  );

  // 날짜 실시간 업데이트 (1분마다) — deadline도 함께 코엄동알 재계산
  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-on-surface bg-background min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-primary shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">shield_person</span>
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">
              {new URLSearchParams(window.location.search).get('school') && new URLSearchParams(window.location.search).get('school') !== 'default'
                ? `${new URLSearchParams(window.location.search).get('school')}학교 ` 
                : ''}학폭 사안처리 시스템
            </span>
            {currentCase && (
              <span className="ml-3 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                현재 사안: {currentCase.id}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">{today}</span>
          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-all border border-white/20 ml-2">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            관리자 페이지
          </Link>
        </div>
      </header>

      {/* Side Nav */}
      <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col z-40 bg-primary-container w-60 shadow-lg border-r border-primary/20">
        <div className="px-4 py-5 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">gavel</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">사안처리 단계</p>
              <p className="text-white/50 text-xs">4단계 프로세스</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 py-3 px-2">
          {navItems.map(({ to, icon, label, exact, step, statusKey }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            const completed = isStepCompleted(currentCase, statusKey);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${active
                    ? 'bg-primary text-white shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-all ${active ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                  {icon}
                </span>
                <span>{label}</span>
                <div className="ml-auto flex items-center gap-1">
                  {completed && (
                    <span className={`material-symbols-outlined text-[16px] ${active ? 'text-white' : 'text-teal-300'}`}>
                      check_circle
                    </span>
                  )}
                  {step && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}>
                      {step}단계
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="px-3 py-4 border-t border-primary/20">
          {/* 법정 기한 D-Day 카운터 */}
          <div className={`border rounded-xl p-3 mb-3 ${
            deadline?.overdue
              ? 'bg-error/20 border-error/60'
              : deadline && deadline.hours < 12
              ? 'bg-amber-500/20 border-amber-400/60'
              : 'bg-error-container/20 border-error/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`material-symbols-outlined text-[16px] ${deadline?.overdue ? 'text-red-300 animate-pulse' : 'text-red-400'}`}>schedule</span>
              <span className={`text-xs font-bold ${deadline?.overdue ? 'text-red-300' : 'text-red-400'}`}>법정 기한 안내</span>
            </div>
            {currentCase && deadline ? (
              deadline.overdue ? (
                <p className="text-red-300 text-xs font-bold animate-pulse">⚠ 48시간 기한 초과!</p>
              ) : (
                <p className="text-white/80 text-xs leading-relaxed">
                  잔여 <span className="font-bold text-amber-300">{deadline.hours}시간 {deadline.minutes}분</span>
                  <br /><span className="text-white/50 text-[10px]">사안 인지 후 48시간 이내 보고</span>
                </p>
              )
            ) : (
              <p className="text-white/80 text-xs leading-relaxed">
                사안 인지 후 <span className="font-bold text-red-400">48시간 이내</span> 교육지원청 보고 완료 필수
              </p>
            )}
          </div>
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg text-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            로그아웃
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-60 mt-16 min-h-[calc(100vh-4rem)] bg-background">
        <Outlet />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-primary' : toast.type === 'error' ? 'bg-error' : toast.type === 'warn' ? 'bg-amber-500' : 'bg-secondary'}`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'warn' ? 'warning' : 'info'}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
