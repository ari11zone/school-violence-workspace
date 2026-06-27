import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

const REQUIRED_DOCS = [
  { key: 'docInvestigation', label: '최종 사안 조사 보고서', sub: '사안 개요, 관련자 정보, 경위', icon: 'description', required: true },
  { key: 'docStatements', label: '학생 진술서 (피해·가해(관련)학생)', sub: '수집된 진술서 합본', icon: 'history_edu', required: true },
  { key: 'docConsents', label: '보호자 동의서 및 통지서 수령증', sub: '양측 보호자 서면 동의 확인', icon: 'assignment_turned_in', required: true },
  { key: 'docMinutes', label: '전담기구 회의록', sub: '심의 결과 및 위원 의견 요약', icon: 'groups', required: true },
  { key: 'docResolution', label: '학교장 자체해결 의결서 / 심의위 회부 결정서', sub: '최종 처리 방향 결정 문서', icon: 'gavel', required: true },
  { key: 'docEvidences', label: '증빙 자료 (사진·SNS 캡처 등)', sub: '수집된 물적 증거 목록', icon: 'photo_library', required: false },
];

const FINAL_CHECKLIST = [
  { key: 'maskPersonalInfo', label: '개인정보 마스킹 처리 확인', sub: '주민등록번호 뒷자리 및 민감정보 자동 마스킹', icon: 'shield_lock', color: 'text-error' },
  { key: 'principalApproved', label: '학교장 결재 완료', sub: '의결서에 학교장 서명 또는 전자결재 확인', icon: 'approval', color: 'text-primary' },
];

export default function Packaging() {
  const navigate = useNavigate();
  const { currentCase, updatePackaging, advanceStatus, showToast } = useCase();

  const [form, setForm] = useState(() => currentCase?.packaging ?? {
    docInvestigation: true, docStatements: true, docConsents: true,
    docEvidences: false, docMinutes: true, docResolution: true,
    maskPersonalInfo: true, principalApproved: false,
    submittedTo: '', principalName: '', note: '', completed: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentCase) setForm(currentCase.packaging);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase?.id]);

  // 자동 저장 (Auto-save)
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePackaging(form);
    }, 1000);
    return () => clearTimeout(timer);
  }, [form, updatePackaging]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const inv = currentCase?.investigation;
  const stmts = currentCase?.statements;
  const delib = currentCase?.deliberation;

  // 필수 문서 포함 여부
  const requiredDocsDone = REQUIRED_DOCS.filter(d => d.required).every(d => form[d.key]);
  const finalChecksDone = form.maskPersonalInfo && form.principalApproved;
  const readyToSubmit = requiredDocsDone && finalChecksDone && form.submittedTo;

  // 동적 문서 개수 계산
  const includedDocs = REQUIRED_DOCS.filter(d => form[d.key]).length;

  function handleSave() {
    updatePackaging(form);
    showToast('임시 저장되었습니다.');
  }

  function handleSubmit() {
    if (!form.principalApproved) {
      showToast('학교장 결재 완료를 확인해주세요.', 'error');
      return;
    }
    const updated = { ...form, completed: true };
    updatePackaging(updated);
    advanceStatus('closed');
    showToast('최종 제출이 완료되었습니다. 사안이 종결 처리됩니다.');
    setTimeout(() => navigate('/'), 1000);
  }

  // 의결서 미리보기 데이터
  const previewData = {
    caseId: currentCase?.id || '—',
    createdAt: currentCase?.createdAt || '—',
    victimName: inv?.victimName || '—',
    victimGrade: inv?.victimGrade || '',
    victimClass: inv?.victimClass || '',
    perpName: inv?.perpetratorName || '—',
    perpGrade: inv?.perpetratorGrade || '',
    perpClass: inv?.perpetratorClass || '',
    incidentType: (inv?.incidentType || '').replace(/,/g, ' · ') || '—',
    incidentDate: inv?.incidentDate || '—',
    incidentLocation: inv?.incidentLocation || '—',
    decision: delib?.decision === 'self' ? '학교장 자체해결' : delib?.decision === 'committee' ? '심의위원회 회부' : '미결정',
    deliberationDate: delib?.deliberationDate || '—',
    summary: delib?.minutes || inv?.summary || '',
  };

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
            <span>전담기구 심의</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">최종 패키징</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">사안 보고서 패키징 및 최종 제출</h1>
          <p className="text-on-surface-variant mt-1">
            수집된 모든 문서를 통합하여 교육지원청 제출용 패키지를 생성합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${readyToSubmit ? 'bg-teal-50 text-teal-700 border-teal-400' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
            <span className="material-symbols-outlined text-[16px]">{readyToSubmit ? 'check_circle' : 'pending'}</span>
            {readyToSubmit ? '제출 준비 완료' : '준비 중'}
          </span>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-[18px]">save</span>임시 저장
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

      {/* 이전 단계 요약 배너 */}
      {inv && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-4 grid grid-cols-4 gap-4">
          {[
            { icon: 'folder_open', label: '사안번호', value: currentCase?.id },
            { icon: 'category', label: '유형', value: (inv.incidentType || '').replace(/,/g, ' · ') || '—' },
            { icon: 'gavel', label: '처리방향', value: previewData.decision },
            { icon: 'calendar_today', label: '심의일자', value: delib?.deliberationDate || '미입력' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">{item.label}</p>
                <p className="text-sm font-bold text-on-surface">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: 문서 체크리스트 + 최종 확인 */}
        <div className="col-span-2 flex flex-col gap-6">

          {/* 문서 목록 */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
                <h2 className="font-bold text-primary text-lg">패키지 포함 문서 목록</h2>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${requiredDocsDone ? 'bg-teal-100 text-teal-700' : 'bg-error-container text-error'}`}>
                {includedDocs}/{REQUIRED_DOCS.length}개 포함
              </span>
            </div>
            <div className="space-y-3">
              {REQUIRED_DOCS.map(doc => {
                // 동적 상태 표시
                let statusNote = '';
                if (doc.key === 'docStatements') {
                  const filled = [stmts?.victimStatement, stmts?.perpetratorStatement].filter(s => s && s.length > 10).length;
                  statusNote = `진술서 ${filled}/2건 수집`;
                } else if (doc.key === 'docEvidences') {
                  statusNote = inv?.evidences?.length ? `${inv.evidences.length}건 수집됨` : '없음 (선택)';
                } else if (doc.key === 'docConsents') {
                  const c = (stmts?.parentConsentVictim ? 1 : 0) + (stmts?.parentConsentPerp ? 1 : 0);
                  statusNote = `보호자 동의 ${c}/2건`;
                }

                return (
                  <div key={doc.key}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
                      ${form[doc.key] ? 'bg-teal-50 border-teal-200' : 'bg-surface-container-lowest border-outline-variant'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[22px] ${form[doc.key] ? 'text-teal-600' : 'text-on-surface-variant'}`}>
                        {doc.icon}
                      </span>
                      <div>
                        <p className={`text-sm font-bold ${form[doc.key] ? 'text-teal-700' : 'text-on-surface'}`}>{doc.label}</p>
                        <p className="text-xs text-on-surface-variant">{doc.sub}{statusNote ? ` — ${statusNote}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${doc.required ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-secondary'}`}>
                        {doc.required ? '필수' : '선택'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!form[doc.key]}
                          onChange={e => set(doc.key, e.target.checked)}
                          className="sr-only peer" />
                        <div className="w-10 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 다운로드 버튼들 */}
            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={() => {
                  showToast('브라우저의 인쇄 대화상자를 이용해 PDF로 저장하세요.', 'info');
                  setTimeout(() => window.print(), 300);
                }}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">picture_as_pdf</span>
                PDF 저장 / 인쇄 (브라우저 인쇄 대화상자)
              </button>
              <p className="text-[10px] text-on-surface-variant text-center">
                기능: 인쇄 대화상자 → “대상을 PDF로 저장” 선택 시 PDF 파일로 저장됩니다.
              </p>
            </div>
          </div>

          {/* 최종 제출 전 체크리스트 */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">checklist</span>
              <h2 className="font-bold text-primary text-lg">최종 제출 전 확인</h2>
            </div>
            <div className="space-y-3 mb-5">
              {FINAL_CHECKLIST.map(item => (
                <label key={item.key}
                  className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all
                    ${form[item.key] ? 'border-teal-400 bg-teal-50' : 'border-outline-variant hover:border-primary/40'}`}>
                  <input type="checkbox" checked={!!form[item.key]}
                    onChange={e => set(item.key, e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-teal-600 cursor-pointer flex-shrink-0" />
                  <div>
                    <p className={`text-sm font-bold flex items-center gap-1.5 ${form[item.key] ? 'text-teal-700' : 'text-on-surface'}`}>
                      <span className={`material-symbols-outlined text-[16px] ${item.color}`}>{item.icon}</span>
                      {item.label}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">{item.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  제출 대상 기관 <span className="text-error">*</span>
                </label>
                <input type="text" value={form.submittedTo}
                  onChange={e => set('submittedTo', e.target.value)}
                  placeholder="예: ○○교육지원청 학교지원과"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  학교장 성명 <span className="text-error">*</span>
                </label>
                <input type="text" value={form.principalName || ''}
                  onChange={e => set('principalName', e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            {form.note !== undefined && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">비고</label>
                <textarea value={form.note}
                  onChange={e => set('note', e.target.value)}
                  rows={3}
                  placeholder="특이사항이 있으면 기록하세요."
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            )}
          </div>
        </div>

        {/* Right: 의결서 미리보기 */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden sticky top-24">
            <div className="bg-primary p-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                의결서 미리보기
              </h3>
              <p className="text-white/70 text-xs mt-1">실제 입력 데이터 기반</p>
            </div>
            <div className="p-5 max-h-[600px] overflow-y-auto">
              <div className="font-serif text-black text-sm">
                <h2 className="text-xl font-bold text-center underline underline-offset-6 mb-6">
                  {delib?.decision === 'committee' ? '심의위원회 회부 결정서' : '학교장 자체해결 의결서'}
                </h2>
                <table className="w-full border-collapse border-2 border-black text-xs mb-5">
                  <tbody>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left w-1/3">사안번호</th>
                      <td className="border border-black p-2">{previewData.caseId}</td>
                    </tr>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">접수일자</th>
                      <td className="border border-black p-2">
                    {(() => {
                      const d = new Date(previewData.createdAt);
                      return !isNaN(d.getTime()) ? d.toLocaleDateString('ko-KR') : previewData.createdAt;
                    })()}
                  </td>
                    </tr>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">피해(관련)학생</th>
                      <td className="border border-black p-2">{previewData.victimName}{previewData.victimGrade ? ` (${previewData.victimGrade}학년 ${previewData.victimClass}반)` : ''}</td>
                    </tr>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">가해(관련)학생</th>
                      <td className="border border-black p-2">{previewData.perpName}{previewData.perpGrade ? ` (${previewData.perpGrade}학년 ${previewData.perpClass}반)` : ''}</td>
                    </tr>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">사안 유형</th>
                      <td className="border border-black p-2">{(previewData.incidentType || '').replace(/,/g, ' · ')}</td>
                    </tr>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">심의 일자</th>
                      <td className="border border-black p-2">{previewData.deliberationDate}</td>
                    </tr>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">처리 방향</th>
                      <td className="border border-black p-2 font-bold">{previewData.decision}</td>
                    </tr>
                  </tbody>
                </table>

                {delib?.decision === 'self' && (
                  <div className="mb-4">
                    <h5 className="font-bold border-b-2 border-black mb-2 pb-1">자체해결 요건 충족 여부</h5>
                    <ul className="space-y-1 text-xs">
                      {[
                        { key: 'req1', label: '2주 이상 진단서 미발급' },
                        { key: 'req2', label: '재산상 피해 없거나 즉각 복구' },
                        { key: 'req3', label: '학교폭력이 지속적이지 않음' },
                        { key: 'req4', label: '보복행위가 아님' },
                      ].map(r => (
                        <li key={r.key} className="flex gap-1.5">
                          <span>{delib?.[r.key] ? '☑' : '☐'}</span>{r.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewData.summary && (
                  <div className="mb-4">
                    <h5 className="font-bold border-b-2 border-black mb-2 pb-1">전담기구 심의 결과 요약</h5>
                    <p className="text-xs leading-relaxed">{previewData.summary}</p>
                  </div>
                )}

                <div className="text-center mt-12">
                  <p className="text-sm mb-3">{previewData.deliberationDate !== '—' ? previewData.deliberationDate : new Date().toLocaleDateString('ko-KR')}</p>
                  <p className="font-bold tracking-widest mb-1">{form.principalName ? `${form.principalName} (인)` : '○○학교장 (인)'}</p>
                  {form.submittedTo && <p className="text-xs text-on-surface-variant">제출처: {form.submittedTo}</p>}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant">
              <p className="text-[10px] text-on-surface-variant text-center">
                데이터 입력 시 실시간 반영됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/deliberation')}
          className="flex items-center gap-2 px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>전담기구 심의로
        </button>
        <button onClick={handleSubmit}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-md transition-all
            ${readyToSubmit ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95' : 'bg-primary text-white hover:opacity-90 active:scale-95'}`}>
          <span className="material-symbols-outlined text-[18px]">send</span>
          {readyToSubmit ? '교육지원청 최종 제출 및 사안 종결' : '제출 및 사안 종결'}
        </button>
      </div>
    </div>
  );
}
