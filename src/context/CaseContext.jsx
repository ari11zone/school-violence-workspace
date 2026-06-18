import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CaseContext = createContext(null);

const initialCase = (id) => ({
  id: id,
  createdAt: new Date().toLocaleDateString('ko-KR'),
  status: 'investigation', // investigation | statements | deliberation | packaging | closed
  isLocked: false,
  // 2단계: 사안 조사
  investigation: {
    caseNumber: id,
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentType: '',
    victimName: '',
    victimGrade: '',
    victimClass: '',
    perpetratorName: '',
    perpetratorGrade: '',
    perpetratorClass: '',
    summary: '',
    evidences: [],
    witnesses: '',
    completed: false,
  },
  // 3단계: 진술서/동의서
  statements: {
    activeTab: 'victim',
    victimStatement: '',
    perpetratorStatement: '',
    witnessStatement: '',
    parentConsentVictim: false,
    parentConsentPerp: false,
    completed: false,
  },
  // 4단계: 전담기구 심의
  deliberation: {
    req1: false, // 2주 미만 치료
    req2: false, // 재산 피해 없음
    req3: false, // 지속적 폭력 아님
    req4: false, // 피해학생 동의 (보복행위 아님)
    memberCheck: false, // 심의위원 3인 이상 확인
    victimAgrees: false, // 피해학생 자체해결 동의
    measures: [],
    minutes: '',
    decision: null, // 'self' | 'committee'
    deliberationDate: '',
    chairperson: '',
    completed: false,
  },
  // 5단계: 패키징
  packaging: {
    docInvestigation: true,  // 필수
    docStatements: true,     // 필수
    docConsents: true,       // 필수
    docEvidences: false,     // 선택
    docMinutes: true,        // 필수
    docResolution: true,     // 필수
    maskPersonalInfo: true,  // 개인정보 마스킹
    principalApproved: false,
    submittedTo: '',
    note: '',
    completed: false,
  },
});

const defaultCases = [
  {
    id: '2024-082',
    createdAt: '2024. 10. 23.',
    status: 'statements',
    isLocked: false,
    investigation: {
      caseNumber: '2024-082',
      incidentDate: '2024-10-22',
      incidentTime: '12:30',
      incidentLocation: '3학년 2반 교실',
      incidentType: '언어폭력·사이버불링',
      victimName: '김○○',
      victimGrade: '3',
      victimClass: '2',
      perpetratorName: '이○○',
      perpetratorGrade: '3',
      perpetratorClass: '2',
      summary: '피해학생이 점심시간에 가해학생으로부터 반복적인 언어폭력과 SNS 왕따를 당하였음.',
      evidences: [{ name: '카카오톡 캡처.jpg', type: '사진' }],
      witnesses: '같은 반 학생 박○○',
      completed: true,
    },
    statements: {
      activeTab: 'victim',
      victimStatement: '10월 22일 점심시간에 이○○가 저한테 심한 욕설을 하고 단톡방에서 저를 제외했습니다.',
      perpetratorStatement: '',
      witnessStatement: '',
      parentConsentVictim: true,
      parentConsentPerp: false,
      completed: false,
    },
    deliberation: { req1: false, req2: false, req3: false, req4: false, memberCheck: false, victimAgrees: false, measures: [], minutes: '', decision: null, deliberationDate: '', chairperson: '', completed: false },
    packaging: { docInvestigation: true, docStatements: true, docConsents: true, docEvidences: false, docMinutes: true, docResolution: true, maskPersonalInfo: true, principalApproved: false, submittedTo: '', note: '', completed: false },
  },
  {
    id: '2024-079',
    createdAt: '2024. 10. 18.',
    status: 'deliberation',
    isLocked: false,
    investigation: {
      caseNumber: '2024-079',
      incidentDate: '2024-10-17',
      incidentTime: '15:00',
      incidentLocation: '운동장',
      incidentType: '신체폭력',
      victimName: '박○○',
      victimGrade: '2',
      victimClass: '3',
      perpetratorName: '최○○',
      perpetratorGrade: '2',
      perpetratorClass: '3',
      summary: '운동장에서 축구 중 다툼으로 신체적 폭력이 발생함.',
      evidences: [],
      witnesses: '',
      completed: true,
    },
    statements: {
      activeTab: 'victim',
      victimStatement: '최○○가 축구 중 저를 발로 찼습니다. 의도적이었습니다.',
      perpetratorStatement: '실수로 부딪혔습니다. 의도한 것이 아닙니다.',
      witnessStatement: '두 학생이 공 다툼 중 신체 접촉이 있었음.',
      parentConsentVictim: true,
      parentConsentPerp: true,
      completed: true,
    },
    deliberation: { req1: false, req2: false, req3: false, req4: false, memberCheck: false, victimAgrees: false, measures: [], minutes: '', decision: null, deliberationDate: '', chairperson: '', completed: false },
    packaging: { docInvestigation: true, docStatements: true, docConsents: true, docEvidences: false, docMinutes: true, docResolution: true, maskPersonalInfo: true, principalApproved: false, submittedTo: '', note: '', completed: false },
  },
];

export function CaseProvider({ children }) {
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('school_violence_cases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved cases:', e);
      }
    }
    return defaultCases;
  });

  const [allowCaseRegistration, setAllowCaseRegistration] = useState(() => {
    const saved = localStorage.getItem('school_violence_allow_reg');
    return saved !== 'false'; // default to true
  });

  const [currentCaseId, setCurrentCaseId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const currentCase = cases.find(c => c.id === currentCaseId) || null;

  // Persist cases and registration toggle to localStorage
  useEffect(() => {
    localStorage.setItem('school_violence_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('school_violence_allow_reg', String(allowCaseRegistration));
  }, [allowCaseRegistration]);

  const toggleAllowCaseRegistration = useCallback(() => {
    setAllowCaseRegistration(prev => !prev);
  }, []);

  const toggleLockCase = useCallback((id) => {
    setCases(prev => prev.map(c =>
      c.id === id ? { ...c, isLocked: !c.isLocked } : c
    ));
    showToast('사안 잠금 상태가 변경되었습니다.');
  }, [showToast]);

  const clearClosedCases = useCallback(() => {
    setCases(prev => prev.filter(c => c.status !== 'closed'));
    showToast('종결된 사안들이 정리되었습니다.');
  }, [showToast]);

  const resetCases = useCallback(() => {
    setCases([]);
    setCurrentCaseId(null);
    showToast('모든 사안 데이터가 초기화되었습니다.');
  }, [showToast]);

  const createCase = useCallback((initialData = {}) => {
    if (!allowCaseRegistration) {
      showToast('새 사안 등록이 비활성화되어 있습니다. 관리자에게 문의하세요.', 'error');
      return null;
    }
    const currentYear = new Date().getFullYear();
    const prefix = `${currentYear}-`;
    const yearCases = cases.filter(c => c.id.startsWith(prefix));
    
    let maxSeq = 0;
    yearCases.forEach(c => {
      const seqStr = c.id.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    });
    
    const nextSeq = maxSeq + 1;
    const newId = `${currentYear}-${String(nextSeq).padStart(3, '0')}`;

    const nc = initialCase(newId);
    if (initialData.investigation) {
      nc.investigation = { ...nc.investigation, ...initialData.investigation, caseNumber: newId };
    }
    setCases(prev => [nc, ...prev]);
    setCurrentCaseId(newId);
    return newId;
  }, [cases, allowCaseRegistration, showToast]);

  const selectCase = useCallback((id) => {
    setCurrentCaseId(id);
  }, []);

  const updateInvestigation = useCallback((data) => {
    if (currentCase?.isLocked) {
      showToast('잠금 처리된 사안은 수정할 수 없습니다.', 'error');
      return;
    }
    setCases(prev => prev.map(c =>
      c.id === currentCaseId
        ? { ...c, investigation: { ...c.investigation, ...data } }
        : c
    ));
  }, [currentCaseId, currentCase?.isLocked, showToast]);

  const updateStatements = useCallback((data) => {
    if (currentCase?.isLocked) {
      showToast('잠금 처리된 사안은 수정할 수 없습니다.', 'error');
      return;
    }
    setCases(prev => prev.map(c =>
      c.id === currentCaseId
        ? { ...c, statements: { ...c.statements, ...data } }
        : c
    ));
  }, [currentCaseId, currentCase?.isLocked, showToast]);

  const updateDeliberation = useCallback((data) => {
    if (currentCase?.isLocked) {
      showToast('잠금 처리된 사안은 수정할 수 없습니다.', 'error');
      return;
    }
    setCases(prev => prev.map(c =>
      c.id === currentCaseId
        ? { ...c, deliberation: { ...c.deliberation, ...data } }
        : c
    ));
  }, [currentCaseId, currentCase?.isLocked, showToast]);

  const updatePackaging = useCallback((data) => {
    if (currentCase?.isLocked) {
      showToast('잠금 처리된 사안은 수정할 수 없습니다.', 'error');
      return;
    }
    setCases(prev => prev.map(c =>
      c.id === currentCaseId
        ? { ...c, packaging: { ...(c.packaging || {}), ...data } }
        : c
    ));
  }, [currentCaseId, currentCase?.isLocked, showToast]);

  const advanceStatus = useCallback((newStatus) => {
    if (currentCase?.isLocked) {
      showToast('잠금 처리된 사안은 수정할 수 없습니다.', 'error');
      return;
    }
    setCases(prev => prev.map(c =>
      c.id === currentCaseId ? { ...c, status: newStatus } : c
    ));
  }, [currentCaseId, currentCase?.isLocked, showToast]);

  const deleteCase = useCallback((id) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (currentCaseId === id) {
      setCurrentCaseId(null);
    }
  }, [currentCaseId]);

  return (
    <CaseContext.Provider value={{
      cases, currentCase, currentCaseId,
      toast, showToast,
      allowCaseRegistration, toggleAllowCaseRegistration,
      toggleLockCase, clearClosedCases, resetCases,
      createCase, selectCase,
      updateInvestigation, updateStatements, updateDeliberation, updatePackaging,
      advanceStatus, deleteCase,
    }}>
      {children}
    </CaseContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCase = () => useContext(CaseContext);
