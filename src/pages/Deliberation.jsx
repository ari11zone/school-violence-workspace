import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

const SELF_RESOLUTION_REQS = [
  {
    key: 'req1',
    label: '2주 이상의 신체·정신적 치료가 필요한 진단서를 발급받지 않은 경우',
    sub: '의사 소견서 및 진단서 제출 여부 확인',
  },
  {
    key: 'req2',
    label: '재산상 피해가 없거나 즉각 복구된 경우',
    sub: '물적 피해 확인 및 변제 완료 확인',
  },
  {
    key: 'req3',
    label: '학교폭력이 지속적이지 않은 경우',
    sub: '단발성 우발 사건으로 판단',
  },
  {
    key: 'req4',
    label: '보복행위가 아닌 경우',
    sub: '이전 사안과의 연관성 확인',
  },
];

export default function Deliberation() {
  const navigate = useNavigate();
  const { currentCase, updateDeliberation, advanceStatus, showToast } = useCase();

  const [form, setForm] = useState(() => currentCase?.deliberation ?? {
    req1: false, req2: false, req3: false, req4: false,
    memberCheck: false, victimAgrees: false,
    measures: [], minutes: '', decision: null,
    deliberationDate: '', chairperson: '', completed: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentCase) setForm(currentCase.deliberation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase?.id]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const inv = currentCase?.investigation;
  const stmts = currentCase?.statements;

  const allReqsMet = form.req1 && form.req2 && form.req3 && form.req4;
  const allChecksOk = allReqsMet && form.memberCheck && form.victimAgrees && form.decision;

  function handleSave() {
    updateDeliberation(form);
    showToast('임시 저장되었습니다.');
  }

  function handleConfirm() {
    // 유효성 검사를 먼저 수행 (completed:true 저장 전)
    if (!form.decision) {
      showToast('처리 방향(자체해결 / 심의위 회부)을 선택해주세요.', 'error');
      return;
    }
    const updated = { ...form, completed: true };
    updateDeliberation(updated);
    advanceStatus('packaging');
    showToast('의결이 확정되었습니다. 최종 패키징 단계로 이동합니다.');
    setTimeout(() => navigate('/packaging'), 800);
  }

  // AI 초안 자동생성 (실제 데이터 기반)
  const aiSummary = allReqsMet && inv
    ? `본 사안(${inv.incidentDate || '일자미상'}, ${inv.incidentLocation || '장소미상'})은 ${(inv.incidentType || '').replace(/,/g, ' · ') || '유형미상'}으로 접수되었으며, 가해(관련)학생(${inv.perpetratorName || '미입력'})과 피해(관련)학생(${inv.victimName || '미입력'}) 간의 사안입니다. 전담기구는 자체해결 4가지 요건을 검토한 결과 전원 충족함을 확인하였습니다.`
    : null;

  const aiConclusion = form.decision === 'self'
    ? `학교폭력예방 및 대책에 관한 법률 제13조의2 제1항에 의거, 4가지 요건을 모두 충족하며 피해(관련)학생 및 보호자의 서면 동의를 득하였으므로 학교장 자체해결로 종결합니다. 추후 생활지도를 통해 재발 방지에 힘씁니다.`
    : form.decision === 'committee'
    ? `자체해결 요건을 충족하지 아니하거나 피해(관련)학생 측이 심의위원회 개최를 요청하였으므로, 학교폭력대책심의위원회에 심의를 요청합니다.`
    : null;

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
            <span>진술서/동의서</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">전담기구 심의</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">전담기구 심의 결과 및 의결서 작성</h1>
          <p className="text-on-surface-variant mt-1">자체해결 요건을 확인하고 처리 방향을 결정합니다.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-[18px]">save</span>임시 저장
          </button>
          <button onClick={() => { window.print(); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">print</span>출력
          </button>
        </div>
      </div>

      {/* Lock Warning Banner */}
      {currentCase?.isLocked && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">lock</span>
          </div>
          <div>
            <p className="font-bold text-amber-800 text-sm">관리자에 의해 접속이 차단된 사안입니다.</p>
            <p className="text-amber-700 text-xs mt-0.5">이 사안은 현재 잠금 상태입니다. 수정 및 저장이 불가능합니다. 관리자에게 문의하세요.</p>
          </div>
        </div>
      )}

      {/* 이전 단계 데이터 요약 배너 */}
      {inv && (inv.victimName || inv.incidentType) && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-wrap gap-x-5 gap-y-2 items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">summarize</span>
            수집된 사안 정보
          </div>
          {inv.incidentType && (
            <span className="flex items-center gap-1 text-xs bg-white border border-primary/30 rounded-full px-3 py-1 font-semibold text-primary">
              <span className="material-symbols-outlined text-[14px]">category</span>{(inv.incidentType || '').replace(/,/g, ' · ')}
            </span>
          )}
          {inv.victimName && (
            <span className="flex items-center gap-1 text-xs bg-error/10 border border-error/30 rounded-full px-3 py-1 font-semibold text-error">
              <span className="material-symbols-outlined text-[14px]">person</span>
              피해(관련)학생: {inv.victimName}{inv.victimGrade ? ` (${inv.victimGrade}학년 ${inv.victimClass || ''}반)` : ''}
            </span>
          )}
          {inv.perpetratorName && (
            <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-300 rounded-full px-3 py-1 font-semibold text-amber-700">
              <span className="material-symbols-outlined text-[14px]">person_alert</span>
              가해(관련)학생: {inv.perpetratorName}{inv.perpetratorGrade ? ` (${inv.perpetratorGrade}학년 ${inv.perpetratorClass || ''}반)` : ''}
            </span>
          )}
          {stmts && (
            <span className={`flex items-center gap-1 text-xs rounded-full px-3 py-1 font-semibold border ${stmts.parentConsentVictim ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-error/10 text-error border-error/30'}`}>
              <span className="material-symbols-outlined text-[14px]">{stmts.parentConsentVictim ? 'check_circle' : 'cancel'}</span>
              피해(관련)학생 보호자 동의 {stmts.parentConsentVictim ? '완료' : '미완'}
            </span>
          )}
          {stmts && (
            <span className={`flex items-center gap-1 text-xs rounded-full px-3 py-1 font-semibold border ${stmts.parentConsentPerp ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
              <span className="material-symbols-outlined text-[14px]">{stmts.parentConsentPerp ? 'check_circle' : 'warning'}</span>
              가해(관련)학생 보호자 동의 {stmts.parentConsentPerp ? '완료' : '미완'}
            </span>
          )}
        </div>
      )}

      {/* 진술 요약 (Statements 데이터 전달) */}
      {stmts && (stmts.victimStatement || stmts.perpetratorStatement) && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          {stmts.victimStatement && (
            <div className="bg-error/5 border border-error/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-error mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person</span>피해(관련)학생 진술 요약
              </p>
              <p className="text-xs text-on-surface leading-relaxed line-clamp-3">{stmts.victimStatement}</p>
            </div>
          )}
          {stmts.perpetratorStatement && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person_alert</span>가해(관련)학생 진술 요약
              </p>
              <p className="text-xs text-on-surface leading-relaxed line-clamp-3">{stmts.perpetratorStatement}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* 자체해결 4가지 요건 체크 */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">fact_check</span>
              <h2 className="font-bold text-primary text-lg">학교장 자체해결 4가지 요건 확인</h2>
              <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${allReqsMet ? 'bg-teal-100 text-teal-700' : 'bg-error-container text-error'}`}>
                {[form.req1, form.req2, form.req3, form.req4].filter(Boolean).length}/4 충족
              </span>
            </div>
            <div className="space-y-3">
              {SELF_RESOLUTION_REQS.map(req => (
                <label key={req.key}
                  className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all
                    ${form[req.key] ? 'border-teal-400 bg-teal-50' : 'border-outline-variant hover:border-primary/40 bg-surface-container-lowest'}`}>
                  <input type="checkbox" checked={!!form[req.key]}
                    onChange={e => set(req.key, e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-teal-600 cursor-pointer flex-shrink-0" />
                  <div>
                    <p className={`text-sm font-bold leading-snug ${form[req.key] ? 'text-teal-700' : 'text-on-surface'}`}>{req.label}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{req.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            {allReqsMet && (
              <div className="mt-4 p-3 bg-teal-50 border border-teal-300 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-[20px]">check_circle</span>
                <p className="text-sm font-bold text-teal-700">4가지 요건 모두 충족 — 학교장 자체해결 가능</p>
              </div>
            )}
          </div>

          {/* 추가 확인 체크 */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
              <h2 className="font-bold text-primary text-lg">추가 확인 사항</h2>
            </div>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all
                ${form.memberCheck ? 'border-teal-400 bg-teal-50' : 'border-outline-variant hover:border-primary/40'}`}>
                <input type="checkbox" checked={!!form.memberCheck}
                  onChange={e => set('memberCheck', e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-teal-600 cursor-pointer flex-shrink-0" />
                <div>
                  <p className={`text-sm font-bold ${form.memberCheck ? 'text-teal-700' : 'text-on-surface'}`}>
                    전담기구 위원 3인 이상 참석 확인
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">학교폭력예방법 제14조: 전담기구 심의 정족수 충족</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all
                ${form.victimAgrees ? 'border-teal-400 bg-teal-50' : 'border-outline-variant hover:border-primary/40'}`}>
                <input type="checkbox" checked={!!form.victimAgrees}
                  onChange={e => set('victimAgrees', e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-teal-600 cursor-pointer flex-shrink-0" />
                <div>
                  <p className={`text-sm font-bold ${form.victimAgrees ? 'text-teal-700' : 'text-on-surface'}`}>
                    피해(관련)학생 및 보호자 자체해결 서면 동의 확인
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">자체해결 동의서 원본 보관 필수 (법령 제13조의2)</p>
                </div>
              </label>
            </div>
          </div>

          {/* 처리 방향 선택 */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">gavel</span>
              <h2 className="font-bold text-primary text-lg">처리 방향 결정 <span className="text-error text-sm">*필수</span></h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => set('decision', 'self')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${form.decision === 'self' ? 'border-teal-500 bg-teal-50' : 'border-outline-variant hover:border-teal-400'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${form.decision === 'self' ? 'bg-teal-500' : 'bg-teal-100'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${form.decision === 'self' ? 'text-white' : 'text-teal-600'}`}>home</span>
                </div>
                <p className={`font-bold text-sm ${form.decision === 'self' ? 'text-teal-700' : 'text-on-surface'}`}>학교장 자체해결</p>
                <p className="text-xs text-on-surface-variant mt-1">4가지 요건 충족 시 학교 내 자체 종결</p>
                {form.decision === 'self' && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-600">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>선택됨
                  </span>
                )}
              </button>
              <button onClick={() => set('decision', 'committee')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${form.decision === 'committee' ? 'border-purple-500 bg-purple-50' : 'border-outline-variant hover:border-purple-400'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${form.decision === 'committee' ? 'bg-purple-500' : 'bg-purple-100'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${form.decision === 'committee' ? 'text-white' : 'text-purple-600'}`}>account_balance</span>
                </div>
                <p className={`font-bold text-sm ${form.decision === 'committee' ? 'text-purple-700' : 'text-on-surface'}`}>심의위원회 회부</p>
                <p className="text-xs text-on-surface-variant mt-1">요건 미충족 또는 피해(관련)학생이 심의 요청 시</p>
                {form.decision === 'committee' && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-purple-600">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>선택됨
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* 심의 회의록 */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">description</span>
              <h2 className="font-bold text-primary text-lg">전담기구 회의록 요약</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">심의 일자</label>
                <input type="date" value={form.deliberationDate}
                  onChange={e => set('deliberationDate', e.target.value)}
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">위원장 성명</label>
                <input type="text" value={form.chairperson}
                  onChange={e => set('chairperson', e.target.value)}
                  placeholder="예: 김○○ 교감"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-primary focus:ring-2" />
              </div>
            </div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">회의 내용 요약</label>
            <textarea value={form.minutes}
              onChange={e => set('minutes', e.target.value)}
              rows={6}
              placeholder="전담기구 위원들의 주요 논의 사항 및 의견을 요약하여 기록하세요."
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          {/* AI 의결서 초안 */}
          <div className="bg-primary-container rounded-2xl overflow-hidden relative">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary opacity-20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white text-[22px]">auto_awesome</span>
                  <h2 className="font-bold text-white text-lg">AI 기반 의결서 초안</h2>
                </div>
                {!aiSummary && (
                  <span className="text-xs text-white/60">4가지 요건 체크 후 자동생성</span>
                )}
              </div>
              {aiSummary ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-2">심의 결과 요약</label>
                    <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white text-sm leading-relaxed">
                      {aiSummary}
                    </div>
                  </div>
                  {aiConclusion && (
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-2">학교장 종결 사유 및 후속 조치</label>
                      <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white text-sm leading-relaxed">
                        {aiConclusion}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-white/50">
                  <span className="material-symbols-outlined text-[40px] mb-2 block">pending</span>
                  <p className="text-sm">자체해결 요건 체크 후<br />실제 사안 데이터 기반 초안이 자동 생성됩니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 완료 상태 요약 */}
          <div className={`rounded-2xl border-2 p-5 ${allChecksOk ? 'bg-teal-50 border-teal-400' : 'bg-white border-outline-variant'}`}>
            <p className="font-bold text-sm mb-3 flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${allChecksOk ? 'text-teal-600' : 'text-on-surface-variant'}`}>
                {allChecksOk ? 'task_alt' : 'checklist'}
              </span>
              <span className={allChecksOk ? 'text-teal-700' : 'text-on-surface'}>
                {allChecksOk ? '모든 확인 완료 — 의결 확정 가능' : '확인 진행 현황'}
              </span>
            </p>
            {[
              { label: '자체해결 요건 4가지', done: allReqsMet },
              { label: '전담기구 위원 정족수', done: form.memberCheck },
              { label: '피해(관련)학생 보호자 동의', done: form.victimAgrees },
              { label: '처리 방향 결정', done: !!form.decision },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 py-1.5">
                <span className={`material-symbols-outlined text-[16px] ${item.done ? 'text-teal-500' : 'text-outline-variant'}`}>
                  {item.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={`text-xs ${item.done ? 'text-teal-700 font-medium' : 'text-on-surface-variant'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/statements')}
          className="flex items-center gap-2 px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>진술서/동의서로
        </button>
        <button onClick={handleConfirm}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
          의결 확정 및 최종 패키징으로
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
