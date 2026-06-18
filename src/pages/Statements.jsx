import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

const SIX_W = [
  { key: '누가', hint: '피해자, 가해자 이름/특징', patterns: ['나', '저', '학생', '○○', '이름'] },
  { key: '언제', hint: '날짜, 시간, 수업시간 등', patterns: ['월', '일', '시', '분', '때', '시간', '오전', '오후'] },
  { key: '어디서', hint: '장소(교실, 운동장 등)', patterns: ['에서', '교실', '복도', '화장실', '운동장', '학교', '학원', '버스'] },
  { key: '무엇을', hint: '어떤 행동이 있었는지', patterns: ['때렸', '욕', '빼앗', '밀었', '때리', '폭력', '말했', '했습니다', '했어요'] },
  { key: '어떻게', hint: '방법, 수단, 도구', patterns: ['손', '발', '주먹', '카카오', 'SNS', '전화', '문자', '인터넷', '반복'] },
  { key: '왜(결과)', hint: '이유 또는 피해 결과', patterns: ['아팠', '무서웠', '슬펐', '때문에', '결과', '상처', '멍', '울었'] },
];

function check6W(text) {
  return SIX_W.map(w => ({
    ...w,
    covered: w.patterns.some(p => text.includes(p)),
  }));
}

const CONSENT_ITEMS = [
  { key: 'parentConsentVictim', label: '피해(관련)학생 보호자 동의 확인', sub: '사안 조사 및 자체해결 관련 동의' },
  { key: 'parentConsentPerp', label: '가해(관련)학생 보호자 동의 확인', sub: '사안 조사 및 조치 관련 통보·동의' },
];

const GUIDE_PHRASES = [
  '저는', '피해를 입었습니다.', '그 학생이', '에서', '했습니다.',
  '두렵고 무서웠습니다.', '선생님께 알리고 싶었습니다.',
];

export default function Statements() {
  const navigate = useNavigate();
  const { currentCase, updateStatements, advanceStatus, showToast } = useCase();

  const [form, setForm] = useState(() => currentCase?.statements ?? {
    activeTab: 'victim',
    victimStatement: '',
    perpetratorStatement: '',
    witnessStatement: '',
    parentConsentVictim: false,
    parentConsentPerp: false,
    completed: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentCase) setForm(currentCase.statements);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase?.id]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const tabConfig = [
    { key: 'victim', label: '피해(관련)학생 진술', icon: 'person', stmtKey: 'victimStatement', activeBg: 'bg-error text-white' },
    { key: 'perp', label: '가해(관련)학생 진술', icon: 'person_alert', stmtKey: 'perpetratorStatement', activeBg: 'bg-primary text-white' },
    { key: 'witness', label: '목격자 진술', icon: 'groups', stmtKey: 'witnessStatement', activeBg: 'bg-secondary text-white' },
  ];

  const activeTab = tabConfig.find(t => t.key === form.activeTab) || tabConfig[0];
  const currentText = form[activeTab.stmtKey] || '';
  const w6Result = check6W(currentText);
  const w6Score = w6Result.filter(w => w.covered).length;

  const filledStatements = [form.victimStatement, form.perpetratorStatement].filter(s => s && s.length >= 30).length;
  const consentsGiven = (form.parentConsentVictim ? 1 : 0) + (form.parentConsentPerp ? 1 : 0);
  const overallProgress = Math.round(((filledStatements / 2) * 0.6 + (consentsGiven / 2) * 0.4) * 100);

  const inv = currentCase?.investigation;

  function handleSave() {
    updateStatements(form);
    showToast('임시 저장되었습니다.');
  }

  function handleNext() {
    const updated = { ...form, completed: true };
    updateStatements(updated);
    if (!form.victimStatement || form.victimStatement.length < 10) {
      showToast('피해(관련)학생 진술서가 미작성 상태입니다. 나중에 보완할 수 있습니다.', 'warn');
    } else if (!form.parentConsentVictim) {
      showToast('피해(관련)학생 보호자 동의가 미확인입니다. 나중에 보완할 수 있습니다.', 'warn');
    } else {
      showToast('진술서가 저장되었습니다. 전담기구 심의로 이동합니다.');
    }
    advanceStatus('deliberation');
    setTimeout(() => navigate('/deliberation'), 800);
  }

  function insertGuide(phrase) {
    set(activeTab.stmtKey, currentText + (currentText ? ' ' : '') + phrase);
  }

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
            <span>사안 조사</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">진술서/동의서</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">진술서 작성 및 동의서 수집</h1>
          <p className="text-on-surface-variant mt-1">관련 학생별 진술을 기록하고 보호자 동의를 확인합니다.</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-all">
          <span className="material-symbols-outlined text-[18px]">save</span>임시 저장
        </button>
      </div>

      {/* 사안 정보 요약 배너 — Investigation → Statements 데이터 자동 전달 */}
      {inv && (inv.victimName || inv.incidentType) && (
        <div className="mb-5 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-wrap gap-x-5 gap-y-2 items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">info</span>
            이전 단계(사안 조사) 정보 요약
          </div>
          {inv.incidentType && (
            <span className="flex items-center gap-1 text-xs bg-white border border-primary/30 rounded-full px-3 py-1 font-semibold text-primary">
              <span className="material-symbols-outlined text-[14px]">category</span>{(inv.incidentType || '').replace(/,/g, ' · ')}
            </span>
          )}
          {inv.victimName && (
            <span className="flex items-center gap-1 text-xs bg-error/10 border border-error/30 rounded-full px-3 py-1 font-semibold text-error">
              <span className="material-symbols-outlined text-[14px]">person</span>
              피해: {inv.victimName}{inv.victimGrade ? ` (${inv.victimGrade}학년 ${inv.victimClass || ''}반)` : ''}
            </span>
          )}
          {inv.perpetratorName && (
            <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-300 rounded-full px-3 py-1 font-semibold text-amber-700">
              <span className="material-symbols-outlined text-[14px]">person_alert</span>
              가해: {inv.perpetratorName}{inv.perpetratorGrade ? ` (${inv.perpetratorGrade}학년 ${inv.perpetratorClass || ''}반)` : ''}
            </span>
          )}
          {inv.incidentDate && (
            <span className="flex items-center gap-1 text-xs bg-white border border-outline-variant rounded-full px-3 py-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              {inv.incidentDate} {inv.incidentTime || ''}
            </span>
          )}
          {inv.incidentLocation && (
            <span className="flex items-center gap-1 text-xs bg-white border border-outline-variant rounded-full px-3 py-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">location_on</span>{inv.incidentLocation}
            </span>
          )}
          <button onClick={() => navigate('/investigation')}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline font-bold">
            <span className="material-symbols-outlined text-[14px]">edit</span>사안 조사 수정
          </button>
        </div>
      )}

      {/* Lock Warning Banner */}
      {currentCase?.isLocked && (
        <div className="mb-5 bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">lock</span>
          </div>
          <div>
            <p className="font-bold text-amber-800 text-sm">관리자에 의해 접속이 차단된 사안입니다.</p>
            <p className="text-amber-700 text-xs mt-0.5">이 사안은 현재 잠금 상태입니다. 수정 및 저장이 불가능합니다. 관리자에게 문의하세요.</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-outline-variant p-4 mb-6 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-bold">진술서 수집 진행률</span>
            <span className="font-bold text-primary">{overallProgress}%</span>
          </div>
          <div className="w-full bg-secondary-container h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-on-surface">{filledStatements}/2</p>
            <p className="text-xs text-on-surface-variant">진술서</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-on-surface">{consentsGiven}/2</p>
            <p className="text-xs text-on-surface-variant">보호자 동의</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Statement Editor */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex gap-2">
            {tabConfig.map(t => (
              <button key={t.key} onClick={() => set('activeTab', t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition-all
                  ${form.activeTab === t.key ? t.activeBg + ' border-transparent shadow-md' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                {t.label}
                {form[t.stmtKey] && form[t.stmtKey].length >= 10 && (
                  <span className="material-symbols-outlined text-[14px] text-teal-400">check_circle</span>
                )}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="bg-white rounded-2xl border border-outline-variant p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-on-surface">{activeTab.label}</h3>
              <span className="text-xs text-on-surface-variant">{currentText.length}자</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {GUIDE_PHRASES.map(p => (
                <button key={p} onClick={() => insertGuide(p)}
                  className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all">
                  + {p}
                </button>
              ))}
            </div>
            <textarea
              value={currentText}
              onChange={e => set(activeTab.stmtKey, e.target.value)}
              rows={12}
              placeholder={`${activeTab.label}을 육하원칙에 따라 상세히 기록하세요.\n\n예시: 저는 (언제) (어디서) (누가) 저에게 (무엇을) (어떻게) 했습니다. 그 이후로 (왜/결과) 었습니다.`}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="flex flex-col gap-5">
          {/* 6W Checker */}
          <div className="bg-white rounded-2xl border border-outline-variant p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-on-surface text-sm">육하원칙 체크</h3>
              <span className={`text-sm font-bold ${w6Score >= 4 ? 'text-teal-600' : w6Score >= 2 ? 'text-amber-600' : 'text-error'}`}>
                {w6Score}/6
              </span>
            </div>
            <div className="space-y-2">
              {w6Result.map(w => (
                <div key={w.key} className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-all ${w.covered ? 'bg-teal-50 border border-teal-200' : 'bg-error-container/20 border border-error/20'}`}>
                  <span className={`material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 ${w.covered ? 'text-teal-600' : 'text-error'}`}>
                    {w.covered ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <p className={`text-xs font-bold ${w.covered ? 'text-teal-700' : 'text-error'}`}>{w.key}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{w.hint}</p>
                  </div>
                </div>
              ))}
            </div>
            {w6Score < 4 && (
              <p className="text-xs text-on-surface-variant mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                💡 체크되지 않은 항목에 해당하는 내용을 추가해보세요.
              </p>
            )}
          </div>

          {/* Consent Checklist */}
          <div className="bg-white rounded-2xl border border-outline-variant p-5">
            <h3 className="font-bold text-on-surface text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
              보호자 동의 확인
            </h3>
            <div className="space-y-3">
              {CONSENT_ITEMS.map(item => (
                <label key={item.key} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all
                  ${form[item.key] ? 'border-teal-400 bg-teal-50' : 'border-outline-variant hover:border-primary/40'}`}>
                  <input type="checkbox" checked={!!form[item.key]}
                    onChange={e => set(item.key, e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-teal-600 cursor-pointer" />
                  <div>
                    <p className={`text-sm font-bold ${form[item.key] ? 'text-teal-700' : 'text-on-surface'}`}>{item.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 p-3 bg-primary/5 rounded-xl">
              <p className="text-xs text-primary font-medium flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
                보호자 서면 동의서는 별도 서식을 출력하여 수기 서명 후 보관하세요.
              </p>
            </div>
            <a href="https://drive.google.com/file/d/13oYNhLAbN8aZi9pOSTcnoW_0yR4_y4Wl/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-[16px]">download</span>
              동의서 양식 다운로드
            </a>
          </div>

          {/* Statement Summary */}
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4">
            <p className="text-xs font-bold text-primary mb-3">진술 현황</p>
            {tabConfig.map(t => (
              <div key={t.key} className="flex items-center justify-between py-2 border-b border-primary/10 last:border-0">
                <span className="text-xs text-on-surface-variant">{t.label}</span>
                <span className={`text-xs font-bold ${form[t.stmtKey] && form[t.stmtKey].length >= 10 ? 'text-teal-600' : 'text-on-surface-variant'}`}>
                  {form[t.stmtKey] ? `${form[t.stmtKey].length}자` : '미작성'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/investigation')}
          className="flex items-center gap-2 px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>사안 조사로
        </button>
        <button onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
          전담기구 심의로 이동
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
