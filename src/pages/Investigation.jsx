import { Fragment, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

const INCIDENT_TYPES = ['언어폭력', '신체폭력', '사이버불링', '금품갈취', '강요·협박', '성폭력', '따돌림', '기타'];
const GRADES = ['1', '2', '3', '4', '5', '6'];
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const REQUIRED_FIELDS = [
  { key: 'incidentDate', label: '발생 일자' },
  { key: 'incidentTime', label: '발생 시각' },
  { key: 'incidentLocation', label: '발생 장소' },
  { key: 'incidentType', label: '사안 유형' },
  { key: 'victimName', label: '피해학생 이름' },
  { key: 'victimGrade', label: '피해학생 학년' },
  { key: 'perpetratorName', label: '가해학생 이름' },
  { key: 'perpetratorGrade', label: '가해학생 학년' },
  { key: 'summary', label: '사안 개요' },
];

function StepProgress({ current }) {
  const steps = ['기초 정보', '관련자 정보', '증거 수집', '요약 확인'];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <Fragment key={s}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < current ? 'bg-primary text-white' : i === current ? 'border-2 border-primary text-primary bg-white' : 'border-2 border-outline-variant text-on-surface-variant bg-white'}`}>
              {i < current ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === current ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < current ? 'bg-primary' : 'bg-outline-variant'}`} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function FieldLabel({ label, required }) {
  return (
    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-error normal-case">*필수</span>}
    </label>
  );
}

export default function Investigation() {
  const navigate = useNavigate();
  const { currentCase, updateInvestigation, advanceStatus, showToast, createCase, selectCase } = useCase();

  const [form, setForm] = useState(() =>
    currentCase?.investigation ?? {
      caseNumber: '', incidentDate: '', incidentTime: '', incidentLocation: '',
      incidentType: '', victimName: '', victimGrade: '', victimClass: '',
      perpetratorName: '', perpetratorGrade: '', perpetratorClass: '',
      summary: '', evidences: [], witnesses: '', completed: false,
    }
  );

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showEvidenceInput, setShowEvidenceInput] = useState(false);
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] = useState('사진');
  const selectedFileRef = useRef(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  // Ensure there is a current case
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current && !currentCase) {
      initRef.current = true;
      const id = createCase();
      selectCase(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync form when case changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentCase) setForm(currentCase.investigation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase?.id]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  function validate(fields) {
    const errs = {};
    fields.forEach(({ key, label }) => {
      if (!form[key] || form[key] === '') errs[key] = `${label}을(를) 입력하세요.`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleToggleType(type) {
    const selectedTypes = form.incidentType ? form.incidentType.split('·') : [];
    let updatedTypes;
    if (selectedTypes.includes(type)) {
      updatedTypes = selectedTypes.filter(t => t !== type);
    } else {
      updatedTypes = [...selectedTypes, type];
    }
    set('incidentType', updatedTypes.join('·'));
  }

  function handleSave() {
    updateInvestigation(form);
    showToast('임시 저장되었습니다.');
  }

  function handleNextStep() {
    const stepFields = [
      [REQUIRED_FIELDS[0], REQUIRED_FIELDS[1], REQUIRED_FIELDS[2], REQUIRED_FIELDS[3]],
      [REQUIRED_FIELDS[4], REQUIRED_FIELDS[5], REQUIRED_FIELDS[6], REQUIRED_FIELDS[7]],
      [],
      [REQUIRED_FIELDS[8]],
    ];
    const isValid = validate(stepFields[step]);
    if (!isValid) {
      showToast('일부 필수 항목이 비어 있습니다. 나중에 보완할 수 있습니다.', 'warn');
    }
    updateInvestigation(form);
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      // Final step: save and navigate
      const completed = { ...form, completed: isValid };
      updateInvestigation(completed);
      advanceStatus('statements');
      showToast('사안 조사가 저장되었습니다. 진술서 작성으로 이동합니다.');
      setTimeout(() => navigate('/statements'), 800);
    }
  }


  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedFileRef.current = file;
    setEvidenceName(file.name);

    // 확장자 기반 유형 자동 매핑
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      setEvidenceType('사진');
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
      setEvidenceType('동영상');
    } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) {
      setEvidenceType('녹음');
    } else if (['pdf', 'hwp', 'docx', 'txt', 'xlsx', 'pptx'].includes(ext)) {
      setEvidenceType('기타문서');
    } else {
      setEvidenceType('기타문서');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFileUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function addEvidence() {
    if (!evidenceName.trim()) return;
    const ev = {
      name: evidenceName,
      type: evidenceType,
      fileUrl: selectedFileUrl,
      addedAt: new Date().toLocaleTimeString('ko-KR')
    };
    set('evidences', [...(form.evidences || []), ev]);
    setEvidenceName('');
    selectedFileRef.current = null;
    setSelectedFileUrl('');
    setShowEvidenceInput(false);
    showToast('증거 자료가 추가되었습니다.');
  }

  function removeEvidence(i) {
    set('evidences', (form.evidences || []).filter((_, idx) => idx !== i));
  }


  const completedFields = REQUIRED_FIELDS.filter(f => form[f.key] && form[f.key] !== '').length;
  const progress = Math.round((completedFields / REQUIRED_FIELDS.length) * 100);

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
            <span>대시보드</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">사안 조사 입력</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">사안 조사 상세 입력</h1>
          <p className="text-on-surface-variant mt-1">객관적 사실에 근거한 정확한 정보를 입력해주세요.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-[18px]">save</span>임시 저장
          </button>
          <a href="https://drive.google.com/file/d/13oYNhLAbN8aZi9pOSTcnoW_0yR4_y4Wl/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">print</span>양식 출력
          </a>
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

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-outline-variant p-5 mb-6 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-on-surface">입력 완성도</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-secondary-container h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-sm text-on-surface-variant">
          {REQUIRED_FIELDS.length}개 중 <span className="font-bold text-primary">{completedFields}개</span> 완료
        </div>
        {progress === 100 && (
          <div className="flex items-center gap-1 text-sm text-teal-600 font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>모든 필수 항목 완료!
          </div>
        )}
      </div>

      <StepProgress current={step} />

      {/* Step 0: 기초 정보 */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-outline-variant p-6 col-span-2">
            <h2 className="font-bold text-primary text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">event</span>사건 기본 정보
            </h2>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <FieldLabel label="발생 일자" required />
                <input type="date" value={form.incidentDate}
                  onChange={e => set('incidentDate', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.incidentDate ? 'border-error' : 'border-outline-variant'}`} />
                {errors.incidentDate && <p className="text-error text-xs mt-1">{errors.incidentDate}</p>}
              </div>
              <div>
                <FieldLabel label="발생 시각" required />
                <input type="time" value={form.incidentTime}
                  onChange={e => set('incidentTime', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.incidentTime ? 'border-error' : 'border-outline-variant'}`} />
                {errors.incidentTime && <p className="text-error text-xs mt-1">{errors.incidentTime}</p>}
              </div>
              <div>
                <FieldLabel label="발생 장소" required />
                <input type="text" value={form.incidentLocation} placeholder="예: 3학년 2반 교실"
                  onChange={e => set('incidentLocation', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.incidentLocation ? 'border-error' : 'border-outline-variant'}`} />
                {errors.incidentLocation && <p className="text-error text-xs mt-1">{errors.incidentLocation}</p>}
              </div>
            </div>
            <div className="mt-5">
              <FieldLabel label="사안 유형" required />
              <div className="flex flex-wrap gap-2">
                {INCIDENT_TYPES.map(t => {
                  const selectedTypes = form.incidentType ? form.incidentType.split('·') : [];
                  const isSelected = selectedTypes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleType(t)}
                      className={`px-4 py-2 rounded-xl text-sm border font-medium transition-all flex items-center gap-1.5
                        ${isSelected
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'border-outline-variant text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'}`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                      {t}
                    </button>
                  );
                })}
              </div>
              {errors.incidentType && <p className="text-error text-xs mt-1">{errors.incidentType}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: 관련자 정보 */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Victim */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <h2 className="font-bold text-error text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person</span>피해학생 정보
            </h2>
            <div className="space-y-4">
              <div>
                <FieldLabel label="이름" required />
                <input type="text" value={form.victimName} placeholder="예: 김○○ (이니셜 사용 권장)"
                  onChange={e => set('victimName', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.victimName ? 'border-error' : 'border-outline-variant'}`} />
                {errors.victimName && <p className="text-error text-xs mt-1">{errors.victimName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="학년" required />
                  <select value={form.victimGrade} onChange={e => set('victimGrade', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.victimGrade ? 'border-error' : 'border-outline-variant'}`}>
                    <option value="">선택</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}학년</option>)}
                  </select>
                  {errors.victimGrade && <p className="text-error text-xs mt-1">{errors.victimGrade}</p>}
                </div>
                <div>
                  <FieldLabel label="반" />
                  <select value={form.victimClass} onChange={e => set('victimClass', e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">선택</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}반</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Perpetrator */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <h2 className="font-bold text-primary text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person_alert</span>가해학생 정보
            </h2>
            <div className="space-y-4">
              <div>
                <FieldLabel label="이름" required />
                <input type="text" value={form.perpetratorName} placeholder="예: 이○○ (이니셜 사용 권장)"
                  onChange={e => set('perpetratorName', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.perpetratorName ? 'border-error' : 'border-outline-variant'}`} />
                {errors.perpetratorName && <p className="text-error text-xs mt-1">{errors.perpetratorName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="학년" required />
                  <select value={form.perpetratorGrade} onChange={e => set('perpetratorGrade', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.perpetratorGrade ? 'border-error' : 'border-outline-variant'}`}>
                    <option value="">선택</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}학년</option>)}
                  </select>
                  {errors.perpetratorGrade && <p className="text-error text-xs mt-1">{errors.perpetratorGrade}</p>}
                </div>
                <div>
                  <FieldLabel label="반" />
                  <select value={form.perpetratorClass} onChange={e => set('perpetratorClass', e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">선택</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}반</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-outline-variant p-6 col-span-2">
            <FieldLabel label="목격자 및 참고인" />
            <input type="text" value={form.witnesses} placeholder="예: 같은 반 학생 박○○, 복도에 있던 최○○"
              onChange={e => set('witnesses', e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      )}

      {/* Step 2: 증거 수집 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-outline-variant p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-primary text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">photo_library</span>증거 자료 수집
            </h2>
            <button onClick={() => setShowEvidenceInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-[16px]">add</span>증거 추가
            </button>
          </div>

          {showEvidenceInput && (
            <div className="mb-4 p-4 bg-surface-container-low rounded-xl border border-primary/30">
              <div className="mb-3">
                <FieldLabel label="실제 파일 선택" />
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-2">
                  <FieldLabel label="파일명 또는 설명" required />
                  <input type="text" value={evidenceName} onChange={e => setEvidenceName(e.target.value)}
                    placeholder="예: 카카오톡 대화 캡처.jpg"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <FieldLabel label="유형" />
                  <select value={evidenceType} onChange={e => setEvidenceType(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {['사진', '동영상', '녹음', 'SNS 캡처', '기타문서'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => {
                  setShowEvidenceInput(false);
                  selectedFileRef.current = null;
                  setSelectedFileUrl('');
                }} className="px-4 py-2 border border-outline-variant rounded-xl text-sm">취소</button>
                <button onClick={addEvidence} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">추가</button>
              </div>
            </div>
          )}

          {(form.evidences || []).length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline-variant">attach_file</span>
              <p className="mt-2 text-sm">등록된 증거 자료가 없습니다. 위 버튼을 눌러 추가해주세요.</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">증거가 없어도 다음 단계로 진행할 수 있습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(form.evidences || []).map((ev, i) => {
                const targetUrl = ev.fileUrl || 'data:text/plain;charset=utf-8,' + encodeURIComponent(`[학폭 사안증거] ${ev.name}\n등록 시각: ${ev.addedAt}\n\n시스템에 파일이 등록되지 않은 이전 임시 증거이거나 목업 데이터입니다. 새로 파일을 등록하시면 실제 내용이 표시됩니다.`);
                const isImage = ev.type === '사진' && ev.fileUrl;
                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isImage ? (
                        <img src={ev.fileUrl} alt={ev.name} className="w-12 h-12 object-cover rounded-lg border border-outline-variant" />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined">
                            {ev.type === '동영상' ? 'movie' : ev.type === '녹음' ? 'mic' : 'description'}
                          </span>
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <button 
                          onClick={() => setPreviewItem({ ...ev, fileUrl: ev.fileUrl || targetUrl })}
                          className="font-medium text-on-surface text-sm truncate text-left hover:text-primary hover:underline block w-full" 
                          title={`${ev.name} (클릭 시 미리보기)`}
                        >
                          {ev.name}
                        </button>
                        <p className="text-xs text-on-surface-variant">{ev.type} · {ev.addedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setPreviewItem({ ...ev, fileUrl: ev.fileUrl || targetUrl })}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center justify-center"
                        title="바로 열기 (미리보기)"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <a 
                        href={targetUrl} 
                        download={ev.name}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center justify-center"
                        title="다운로드"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </a>
                      <button onClick={() => removeEvidence(i)} className="text-error hover:bg-error-container rounded-lg p-1.5 transition-all" title="삭제">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          )}
        </div>
      )}


      {/* Step 3: 요약 확인 */}
      {step === 3 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 bg-white rounded-2xl border border-outline-variant p-6">
            <h2 className="font-bold text-primary text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">summarize</span>사안 개요 (AI 초안 지원)
            </h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>육하원칙 체크리스트
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: '누가', check: !!form.victimName && !!form.perpetratorName },
                  { key: '언제', check: !!form.incidentDate },
                  { key: '어디서', check: !!form.incidentLocation },
                  { key: '무엇을', check: !!form.incidentType },
                  { key: '어떻게', check: form.summary.length > 20 },
                  { key: '왜(경위)', check: form.summary.length > 50 },
                ].map(({ key, check }) => (
                  <div key={key} className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${check ? 'bg-teal-50 text-teal-700' : 'bg-error-container/30 text-error'}`}>
                    <span className="material-symbols-outlined text-[16px]">{check ? 'check_circle' : 'radio_button_unchecked'}</span>
                    {key}
                  </div>
                ))}
              </div>
            </div>
            <FieldLabel label="사안 개요" required />
            <textarea value={form.summary} rows={8}
              onChange={e => set('summary', e.target.value)}
              placeholder="육하원칙에 따라 사안의 전말을 상세히 작성하세요. 예) 2024년 10월 22일 점심시간에 3학년 2반 교실에서 이○○가 김○○에게 반복적으로 욕설을 하였고, SNS 단체 채팅방에서 강제 퇴장시켰다..."
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${errors.summary ? 'border-error' : 'border-outline-variant'}`} />
            {errors.summary && <p className="text-error text-xs mt-1">{errors.summary}</p>}
            <p className="text-right text-xs text-on-surface-variant mt-1">{form.summary.length}자</p>
          </div>

          {/* Summary Preview */}
          <div className="col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h3 className="font-bold text-primary text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">preview</span>입력 정보 최종 확인
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                ['사안번호', form.caseNumber || '자동생성'],
                ['발생일시', form.incidentDate && form.incidentTime ? `${form.incidentDate} ${form.incidentTime}` : '—'],
                ['발생장소', form.incidentLocation || '—'],
                ['사안유형', form.incidentType || '—'],
                ['피해학생', form.victimName ? `${form.victimName} (${form.victimGrade}학년 ${form.victimClass}반)` : '—'],
                ['가해학생', form.perpetratorName ? `${form.perpetratorName} (${form.perpetratorGrade}학년 ${form.perpetratorClass}반)` : '—'],
                ['증거자료', `${(form.evidences || []).length}건`],
                ['목격자', form.witnesses || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-white rounded-xl p-3 border border-outline-variant">
                  <p className="text-xs text-on-surface-variant mb-0.5">{k}</p>
                  <p className="font-medium text-on-surface text-sm">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/')}
          className="flex items-center gap-2 px-5 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {step === 0 ? '대시보드로' : '이전 단계'}
        </button>
        <button onClick={handleNextStep}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
          {step < 3 ? '다음 단계' : '진술서 작성으로 이동'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4 relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-primary truncate max-w-[70%]">{previewItem.name}</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={previewItem.fileUrl} 
                  download={previewItem.name} 
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center justify-center"
                  title="다운로드"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </a>
                <button onClick={() => setPreviewItem(null)} className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1.5">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>
            
            <div className="bg-surface-container rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] max-h-[400px]">
              {previewItem.type === '사진' && (
                <img src={previewItem.fileUrl} alt={previewItem.name} className="max-w-full max-h-[400px] object-contain" />
              )}
              {previewItem.type === '동영상' && (
                <video src={previewItem.fileUrl} controls className="max-w-full max-h-[400px]" />
              )}
              {previewItem.type === '녹음' && (
                <div className="p-8 w-full text-center">
                  <span className="material-symbols-outlined text-[48px] text-primary mb-3 block animate-pulse">mic</span>
                  <audio src={previewItem.fileUrl} controls className="w-full" />
                </div>
              )}
              {['기타문서', 'SNS 캡처', '기타'].includes(previewItem.type) && (
                <div className="p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2 block">description</span>
                  <p className="text-sm">미리보기를 지원하지 않는 파일 형식입니다.</p>
                  <a href={previewItem.fileUrl} download={previewItem.name} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all">
                    <span className="material-symbols-outlined text-[16px]">download</span>다운로드
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

