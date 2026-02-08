/**
 * @deprecated このファイルは元のプロトタイプ実装です。
 * 全機能は以下のTypeScriptモジュールに移行済み：
 * - src/data/sampleData.ts (トポロジーデータ)
 * - src/logic/computeReachableNodes.ts (BFS到達判定)
 * - src/logic/isPipeActive.ts (配管通液判定)
 * - src/education/csvParser.ts (CSVパーサー)
 * - src/education/conditionEvaluator.ts (条件式評価)
 * - src/education/ruleCheckEngine.ts (安全ルールチェック)
 * - src/components/PIDSimulator.tsx (メインコンポーネント)
 * - src/components/PIDCanvas.tsx (SVG描画)
 * - src/components/CSVEditorPanel.tsx (CSV設定パネル)
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';

// ============================================
// デフォルト配管ネットワーク（これもCSV化可能だが今回は固定）
// ============================================

const nodes = [
  { id: 'source', x: 50, y: 200, label: '液体A\n(供給)', type: 'source' },
  { id: 'n1', x: 130, y: 200 },
  { id: 'n2', x: 210, y: 200 },
  { id: 'n3', x: 290, y: 200 },
  { id: 'n4', x: 290, y: 280 },
  { id: 'tank-T1', x: 370, y: 200, label: 'T-1', type: 'tank' },
  { id: 'tank-T2', x: 370, y: 280, label: 'T-2', type: 'tank' },
  { id: 'n5', x: 450, y: 240 },
  { id: 'outlet', x: 530, y: 240, label: '出口', type: 'outlet' },
];

const pipes = [
  { id: 'p1', from: 'source', to: 'n1', valveId: null },
  { id: 'p2', from: 'n1', to: 'n2', valveId: 1 },
  { id: 'p3', from: 'n2', to: 'n3', valveId: 2 },
  { id: 'p4', from: 'n3', to: 'tank-T1', valveId: 3 },
  { id: 'p5', from: 'n2', to: 'n4', valveId: 4 },
  { id: 'p6', from: 'n4', to: 'tank-T2', valveId: 5 },
  { id: 'p7', from: 'tank-T1', to: 'n5', valveId: 6 },
  { id: 'p8', from: 'tank-T2', to: 'n5', valveId: 7 },
  { id: 'p9', from: 'n5', to: 'outlet', valveId: 8 },
];

const allValveIds = [1, 2, 3, 4, 5, 6, 7, 8];
const allTankIds = ['tank-T1', 'tank-T2'];
const nodeMap = {};
nodes.forEach(n => { nodeMap[n.id] = n; });

// ============================================
// CSV パーサー
// ============================================

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
};

// ============================================
// 条件式パーサー・評価器
// ============================================

/*
条件式の文法:
  V1=OPEN          バルブ1が開
  V1=CLOSED        バルブ1が閉
  T1=FILLED        タンクT-1に液あり
  T1=EMPTY         タンクT-1が空
  ALL_VALVES_CLOSED 全バルブ閉
  ALL_VALVES_OPEN   全バルブ開
  
  複合条件:
  V1=OPEN AND V2=OPEN
  V1=OPEN OR V2=OPEN
  
  アクション条件（ルール用）:
  OPENING:V2       バルブ2を開けようとしている
  CLOSING:V1       バルブ1を閉じようとしている
  OPENING:V2+      バルブ2以上を開けようとしている
*/

const evaluateCondition = (conditionStr, state, action = null) => {
  if (!conditionStr) return true;
  
  const { valves, tanks } = state;
  
  // AND/OR で分割
  if (conditionStr.includes(' AND ')) {
    return conditionStr.split(' AND ').every(c => evaluateCondition(c.trim(), state, action));
  }
  if (conditionStr.includes(' OR ')) {
    return conditionStr.split(' OR ').some(c => evaluateCondition(c.trim(), state, action));
  }
  
  const cond = conditionStr.trim();
  
  // 特殊条件
  if (cond === 'ALL_VALVES_CLOSED') {
    return allValveIds.every(id => !valves[id]);
  }
  if (cond === 'ALL_VALVES_OPEN') {
    return allValveIds.every(id => valves[id]);
  }
  
  // アクション条件（ルール用）
  if (cond.startsWith('OPENING:')) {
    if (!action || action.type !== 'open_valve') return false;
    const target = cond.substring(8);
    if (target.endsWith('+')) {
      const minValve = parseInt(target.slice(1, -1));
      return action.target >= minValve;
    }
    const valveId = parseInt(target.substring(1));
    return action.target === valveId;
  }
  if (cond.startsWith('CLOSING:')) {
    if (!action || action.type !== 'close_valve') return false;
    const valveId = parseInt(cond.substring(9));
    return action.target === valveId;
  }
  
  // バルブ条件: V1=OPEN, V1=CLOSED
  const valveMatch = cond.match(/^V(\d+)=(OPEN|CLOSED)$/);
  if (valveMatch) {
    const valveId = parseInt(valveMatch[1]);
    const expected = valveMatch[2] === 'OPEN';
    return valves[valveId] === expected;
  }
  
  // タンク条件: T1=FILLED, T1=EMPTY
  const tankMatch = cond.match(/^T(\d+)=(FILLED|EMPTY)$/);
  if (tankMatch) {
    const tankId = `tank-T${tankMatch[1]}`;
    const expected = tankMatch[2] === 'FILLED';
    return tanks[tankId] === expected;
  }
  
  console.warn('Unknown condition:', cond);
  return true;
};

// ============================================
// デフォルト手順データ（CSV形式のサンプル）
// ============================================

const defaultPhasesCSV = `phase_id,phase_name,order
preparation,準備,1
operation,運転,2
shutdown,停止,3`;

const defaultStepsCSV = `phase_id,step_id,step_name,description,instruction,condition,order
preparation,prep-1,初期状態確認,全バルブ閉確認,全バルブが閉じていることを確認してください,ALL_VALVES_CLOSED,1
preparation,prep-2,供給ライン開放,バルブ1を開ける,バルブ1を開けてください,V1=OPEN,2
preparation,prep-3,T-1経路確保,バルブ2と3を開ける,バルブ2→バルブ3の順に開けてください,V2=OPEN AND V3=OPEN,3
operation,op-1,T-1液張り確認,T-1に液が入った,T-1をクリックして液ありにしてください,T1=FILLED,1
operation,op-2,出口開放,バルブ8を開ける,バルブ8を開けてください,V8=OPEN,2
operation,op-3,T-1送液,バルブ6を開ける,バルブ6を開けてT-1から送液してください,V6=OPEN,3
shutdown,shut-1,供給停止,バルブ1を閉じる,バルブ1を閉じてください,V1=CLOSED,1
shutdown,shut-2,全バルブ閉止,全バルブを閉じる,全てのバルブを閉じてください,ALL_VALVES_CLOSED,2`;

const defaultRulesCSV = `rule_id,rule_name,condition,error_message,severity,phases
rule-001,供給元未開放,OPENING:V2+ AND V1=CLOSED,バルブ1（供給ライン）を先に開けてください,warning,all
rule-002,空タンクT-1送液,OPENING:V6 AND T1=EMPTY,T-1が空です。液を張ってから送液してください,critical,all
rule-003,空タンクT-2送液,OPENING:V7 AND T2=EMPTY,T-2が空です。液を張ってから送液してください,critical,all
rule-004,出口未開放,OPENING:V6 AND V8=CLOSED,出口バルブ（バルブ8）を先に開けてください,warning,operation
rule-005,出口未開放,OPENING:V7 AND V8=CLOSED,出口バルブ（バルブ8）を先に開けてください,warning,operation`;

// ============================================
// メインコンポーネント
// ============================================

export default function TrainingSimulatorWithCSV() {
  // CSV データ
  const [phasesData, setPhasesData] = useState(() => parseCSV(defaultPhasesCSV));
  const [stepsData, setStepsData] = useState(() => parseCSV(defaultStepsCSV));
  const [rulesData, setRulesData] = useState(() => parseCSV(defaultRulesCSV));
  
  // シミュレーター状態
  const [valves, setValves] = useState(() => {
    const v = {};
    allValveIds.forEach(id => { v[id] = false; });
    return v;
  });
  const [tankFilled, setTankFilled] = useState({
    'source': true,
    'tank-T1': false,
    'tank-T2': false,
  });
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [operationLog, setOperationLog] = useState([]);
  const [mode, setMode] = useState('training');
  const [showCSVPanel, setShowCSVPanel] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  // ファイル入力ref
  const phasesFileRef = useRef(null);
  const stepsFileRef = useRef(null);
  const rulesFileRef = useRef(null);

  // フェーズ・ステップを構造化
  const phases = useMemo(() => {
    return phasesData
      .sort((a, b) => parseInt(a.order) - parseInt(b.order))
      .map(phase => ({
        ...phase,
        steps: stepsData
          .filter(s => s.phase_id === phase.phase_id)
          .sort((a, b) => parseInt(a.order) - parseInt(b.order))
      }));
  }, [phasesData, stepsData]);

  const currentPhase = phases[currentPhaseIndex];
  const currentStep = currentPhase?.steps[currentStepIndex];

  // ルールチェック
  const checkRules = useCallback((action) => {
    const state = { valves, tanks: tankFilled };
    const violations = [];
    
    rulesData.forEach(rule => {
      // フェーズフィルター
      if (rule.phases !== 'all') {
        const allowedPhases = rule.phases.split(';');
        if (!allowedPhases.includes(currentPhase?.phase_id)) return;
      }
      
      if (evaluateCondition(rule.condition, state, action)) {
        violations.push({
          id: rule.rule_id,
          name: rule.rule_name,
          message: rule.error_message,
          severity: rule.severity,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    });
    
    return violations;
  }, [valves, tankFilled, rulesData, currentPhase]);

  // バルブ操作
  const toggleValve = useCallback((id) => {
    const isOpening = !valves[id];
    const action = { type: isOpening ? 'open_valve' : 'close_valve', target: id };
    
    if (mode === 'training' && isOpening) {
      const violations = checkRules(action);
      if (violations.length > 0) {
        setErrors(prev => [...violations, ...prev].slice(0, 5));
        if (violations.some(v => v.severity === 'critical')) return;
      }
    }
    
    setValves(prev => ({ ...prev, [id]: !prev[id] }));
    setOperationLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: isOpening ? '開' : '閉',
      target: `バルブ${id}`,
    }, ...prev].slice(0, 20));
  }, [valves, mode, checkRules]);

  // タンク操作
  const toggleTank = useCallback((id) => {
    if (id === 'source') return;
    setTankFilled(prev => ({ ...prev, [id]: !prev[id] }));
    setOperationLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: !tankFilled[id] ? '液あり' : '空',
      target: nodeMap[id]?.label || id,
    }, ...prev].slice(0, 20));
  }, [tankFilled]);

  // ステップ完了チェック
  const isStepComplete = useMemo(() => {
    if (!currentStep) return false;
    const state = { valves, tanks: tankFilled };
    return evaluateCondition(currentStep.condition, state);
  }, [currentStep, valves, tankFilled]);

  // 次のステップへ
  const goNextStep = useCallback(() => {
    if (currentStepIndex < currentPhase.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
      setCurrentStepIndex(0);
    }
    setErrors([]);
  }, [currentPhase, currentStepIndex, currentPhaseIndex, phases.length]);

  // リセット
  const resetAll = () => {
    const v = {};
    allValveIds.forEach(id => { v[id] = false; });
    setValves(v);
    setTankFilled({ 'source': true, 'tank-T1': false, 'tank-T2': false });
    setCurrentPhaseIndex(0);
    setCurrentStepIndex(0);
    setErrors([]);
    setOperationLog([]);
  };

  // CSV編集用テキスト
  const [editPhasesCSV, setEditPhasesCSV] = useState('');
  const [editStepsCSV, setEditStepsCSV] = useState('');
  const [editRulesCSV, setEditRulesCSV] = useState('');
  const [editError, setEditError] = useState('');

  // CSVパネルを開く時にテキストを初期化
  const openCSVPanel = () => {
    setEditPhasesCSV(`phase_id,phase_name,order\n${phasesData.map(p => `${p.phase_id},${p.phase_name},${p.order}`).join('\n')}`);
    setEditStepsCSV(`phase_id,step_id,step_name,description,instruction,condition,order\n${stepsData.map(st => `${st.phase_id},${st.step_id},${st.step_name},${st.description},${st.instruction},${st.condition},${st.order}`).join('\n')}`);
    setEditRulesCSV(`rule_id,rule_name,condition,error_message,severity,phases\n${rulesData.map(r => `${r.rule_id},${r.rule_name},${r.condition},${r.error_message},${r.severity},${r.phases}`).join('\n')}`);
    setEditError('');
    setShowCSVPanel(true);
  };

  // CSV適用
  const applyCSV = (type) => {
    try {
      if (type === 'phases') {
        const data = parseCSV(editPhasesCSV);
        if (!data[0]?.phase_id || !data[0]?.phase_name || !data[0]?.order) {
          throw new Error('phases: phase_id, phase_name, order が必要です');
        }
        setPhasesData(data);
      }
      if (type === 'steps') {
        const data = parseCSV(editStepsCSV);
        if (!data[0]?.phase_id || !data[0]?.step_id || !data[0]?.condition) {
          throw new Error('steps: phase_id, step_id, condition が必要です');
        }
        setStepsData(data);
      }
      if (type === 'rules') {
        const data = parseCSV(editRulesCSV);
        if (!data[0]?.rule_id || !data[0]?.condition) {
          throw new Error('rules: rule_id, condition が必要です');
        }
        setRulesData(data);
      }
      setEditError('');
      resetAll();
    } catch (e) {
      setEditError(e.message);
    }
  };

  // 全て適用
  const applyAllCSV = () => {
    try {
      const pData = parseCSV(editPhasesCSV);
      const sData = parseCSV(editStepsCSV);
      const rData = parseCSV(editRulesCSV);
      setPhasesData(pData);
      setStepsData(sData);
      setRulesData(rData);
      setEditError('');
      resetAll();
      setShowCSVPanel(false);
    } catch (e) {
      setEditError('CSVのパースに失敗: ' + e.message);
    }
  };
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (type === 'phases') setEditPhasesCSV(text);
      if (type === 'steps') setEditStepsCSV(text);
      if (type === 'rules') setEditRulesCSV(text);
    };
    reader.readAsText(file);
  };

  // CSVコピー
  const copyCSV = async (data, name) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
    try {
      await navigator.clipboard.writeText(csv);
      setCopySuccess(name);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      // フォールバック：テキストエリアを選択
      alert('クリップボードにコピーできませんでした。テキストエリアから手動でコピーしてください。');
    }
  };

  // 到達判定
  const reachableNodes = useMemo(() => {
    const reachable = new Set();
    const queue = [];
    Object.entries(tankFilled).forEach(([id, filled]) => {
      if (filled) { reachable.add(id); queue.push(id); }
    });
    while (queue.length > 0) {
      const current = queue.shift();
      pipes.forEach(pipe => {
        const canPass = pipe.valveId === null || valves[pipe.valveId];
        if (!canPass) return;
        let next = null;
        if (pipe.from === current) next = pipe.to;
        if (pipe.to === current) next = pipe.from;
        if (!next || reachable.has(next)) return;
        const currentNode = nodeMap[current];
        if (currentNode?.type === 'tank' && !tankFilled[current]) return;
        reachable.add(next);
        queue.push(next);
      });
    }
    return reachable;
  }, [valves, tankFilled]);

  const isPipeActive = (pipe) => {
    const canPass = pipe.valveId === null || valves[pipe.valveId];
    return canPass && reachableNodes.has(pipe.from) && reachableNodes.has(pipe.to);
  };

  const getPipePath = (pipe) => {
    const from = nodeMap[pipe.from];
    const to = nodeMap[pipe.to];
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  };

  const getValvePosition = (pipe) => {
    const from = nodeMap[pipe.from];
    const to = nodeMap[pipe.to];
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  };

  // スタイル
  const s = {
    container: { display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#1a1a2e', minHeight: '100vh', fontFamily: 'sans-serif', color: '#fff' },
    leftPanel: { flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' },
    rightPanel: { width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' },
    card: { backgroundColor: '#2d2d44', borderRadius: '8px', padding: '12px' },
    title: { fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' },
    btn: (color, disabled) => ({ 
      padding: '6px 12px', backgroundColor: disabled ? '#475569' : color, color: '#fff', 
      border: 'none', borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '11px', opacity: disabled ? 0.6 : 1,
    }),
    valveBtn: (isOn) => ({ 
      padding: '4px 8px', backgroundColor: isOn ? '#22c55e' : '#dc2626', color: '#fff', 
      border: 'none', borderRadius: '3px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px', minWidth: '50px',
    }),
    phaseTab: (active) => ({
      padding: '6px 12px', backgroundColor: active ? '#3b82f6' : '#475569', color: '#fff',
      border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
    }),
    stepItem: (isCurrent, isComplete) => ({
      padding: '8px', backgroundColor: isCurrent ? '#1e40af' : isComplete ? '#065f46' : '#374151',
      borderRadius: '4px', marginBottom: '4px', borderLeft: isCurrent ? '3px solid #60a5fa' : '3px solid transparent',
    }),
    errorBox: (severity) => ({
      padding: '8px', backgroundColor: severity === 'critical' ? '#7f1d1d' : '#78350f',
      borderRadius: '4px', marginBottom: '4px', borderLeft: `3px solid ${severity === 'critical' ? '#ef4444' : '#f59e0b'}`, fontSize: '11px',
    }),
    csvPanel: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    csvCard: { backgroundColor: '#2d2d44', borderRadius: '12px', padding: '20px', width: '600px', maxHeight: '80vh', overflow: 'auto' },
    textarea: { width: '100%', height: '120px', backgroundColor: '#1a1a2e', color: '#fff', border: '1px solid #475569', borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '10px' },
  };

  const isComplete = currentPhaseIndex === phases.length - 1 && 
                     currentStepIndex === currentPhase?.steps.length - 1 && 
                     isStepComplete;

  return (
    <div style={s.container}>
      {/* CSVパネル */}
      {showCSVPanel && (
        <div style={s.csvPanel} onClick={() => setShowCSVPanel(false)}>
          <div style={s.csvCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>📁 CSV設定</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.btn('#22c55e')} onClick={applyAllCSV}>✓ 全て適用して閉じる</button>
                <button style={s.btn('#475569')} onClick={() => setShowCSVPanel(false)}>✕ 閉じる</button>
              </div>
            </div>
            
            {editError && (
              <div style={{ backgroundColor: '#7f1d1d', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
                ⚠️ {editError}
              </div>
            )}
            
            {/* フェーズCSV */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>フェーズ定義 (phases.csv)</div>
              <textarea 
                style={s.textarea} 
                value={editPhasesCSV}
                onChange={(e) => setEditPhasesCSV(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input type="file" accept=".csv" ref={phasesFileRef} style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'phases')} />
                <button style={s.btn('#22c55e')} onClick={() => applyCSV('phases')}>適用</button>
                <button style={s.btn('#3b82f6')} onClick={() => phasesFileRef.current.click()}>インポート</button>
                <button style={s.btn(copySuccess === 'phases' ? '#22c55e' : '#475569')} onClick={() => copyCSV(phasesData, 'phases')}>
                  {copySuccess === 'phases' ? '✓ コピー完了' : 'コピー'}
                </button>
              </div>
            </div>

            {/* ステップCSV */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>ステップ定義 (steps.csv)</div>
              <textarea 
                style={{ ...s.textarea, height: '150px' }} 
                value={editStepsCSV}
                onChange={(e) => setEditStepsCSV(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input type="file" accept=".csv" ref={stepsFileRef} style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'steps')} />
                <button style={s.btn('#22c55e')} onClick={() => applyCSV('steps')}>適用</button>
                <button style={s.btn('#3b82f6')} onClick={() => stepsFileRef.current.click()}>インポート</button>
                <button style={s.btn(copySuccess === 'steps' ? '#22c55e' : '#475569')} onClick={() => copyCSV(stepsData, 'steps')}>
                  {copySuccess === 'steps' ? '✓ コピー完了' : 'コピー'}
                </button>
              </div>
            </div>

            {/* ルールCSV */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>安全ルール定義 (rules.csv)</div>
              <textarea 
                style={{ ...s.textarea, height: '150px' }} 
                value={editRulesCSV}
                onChange={(e) => setEditRulesCSV(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input type="file" accept=".csv" ref={rulesFileRef} style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'rules')} />
                <button style={s.btn('#22c55e')} onClick={() => applyCSV('rules')}>適用</button>
                <button style={s.btn('#3b82f6')} onClick={() => rulesFileRef.current.click()}>インポート</button>
                <button style={s.btn(copySuccess === 'rules' ? '#22c55e' : '#475569')} onClick={() => copyCSV(rulesData, 'rules')}>
                  {copySuccess === 'rules' ? '✓ コピー完了' : 'コピー'}
                </button>
              </div>
            </div>

            {/* 条件式ヘルプ */}
            <div style={{ backgroundColor: '#1a1a2e', padding: '12px', borderRadius: '8px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📖 条件式の書き方</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <div><code>V1=OPEN</code> バルブ1が開</div>
                <div><code>V1=CLOSED</code> バルブ1が閉</div>
                <div><code>T1=FILLED</code> T-1に液あり</div>
                <div><code>T1=EMPTY</code> T-1が空</div>
                <div><code>ALL_VALVES_CLOSED</code> 全バルブ閉</div>
                <div><code>ALL_VALVES_OPEN</code> 全バルブ開</div>
                <div><code>OPENING:V2</code> V2を開けようとしている</div>
                <div><code>OPENING:V2+</code> V2以上を開けようとしている</div>
                <div style={{ gridColumn: 'span 2' }}><code>V1=OPEN AND V2=OPEN</code> 複合条件（AND/OR使用可）</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 左パネル */}
      <div style={s.leftPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>🎓 P&ID 教育シミュレーター v2</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.btn('#8b5cf6')} onClick={openCSVPanel}>📁 CSV設定</button>
            <button style={s.btn(mode === 'training' ? '#3b82f6' : '#475569')} onClick={() => setMode('training')}>訓練</button>
            <button style={s.btn(mode === 'free' ? '#3b82f6' : '#475569')} onClick={() => setMode('free')}>自由</button>
            <button style={s.btn('#6b7280')} onClick={resetAll}>リセット</button>
          </div>
        </div>

        {/* フェーズタブ */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {phases.map((phase, idx) => (
            <button key={phase.phase_id} style={s.phaseTab(idx === currentPhaseIndex)}>
              {idx < currentPhaseIndex ? '✓ ' : ''}{phase.phase_name}
            </button>
          ))}
        </div>

        {/* 現在のステップ */}
        {mode === 'training' && currentStep && (
          <div style={{ ...s.card, backgroundColor: '#1e3a5f' }}>
            <div style={s.title}>📋 {currentStep.step_name}</div>
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>{currentStep.instruction}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isStepComplete ? (
                <>
                  <span style={{ color: '#4ade80' }}>✓ 条件達成</span>
                  <button style={s.btn('#22c55e')} onClick={goNextStep}>
                    {currentStepIndex < currentPhase.steps.length - 1 ? '次のステップへ' : 
                     currentPhaseIndex < phases.length - 1 ? '次のフェーズへ' : '完了！'}
                  </button>
                </>
              ) : (
                <span style={{ color: '#fbbf24' }}>⏳ {currentStep.condition}</span>
              )}
            </div>
          </div>
        )}

        {isComplete && mode === 'training' && (
          <div style={{ ...s.card, backgroundColor: '#065f46', textAlign: 'center' }}>
            <div style={{ fontSize: '18px' }}>🎉 全手順完了！</div>
          </div>
        )}

        {/* バルブ制御 */}
        <div style={s.card}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>バルブ制御</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {allValveIds.map(id => (
              <button key={id} style={s.valveBtn(valves[id])} onClick={() => toggleValve(id)}>
                V{id}:{valves[id] ? 'O' : 'X'}
              </button>
            ))}
          </div>
        </div>

        {/* P&ID図 */}
        <svg width="600" height="340" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {pipes.map(pipe => (
            <path key={pipe.id} d={getPipePath(pipe)}
              stroke={isPipeActive(pipe) ? '#22d3ee' : '#9ca3af'}
              strokeWidth={isPipeActive(pipe) ? 6 : 4}
              fill="none" strokeLinecap="round" opacity={isPipeActive(pipe) ? 1 : 0.4} />
          ))}

          {pipes.filter(p => p.valveId).map(pipe => {
            const pos = getValvePosition(pipe);
            return (
              <g key={`v-${pipe.valveId}`} onClick={() => toggleValve(pipe.valveId)} style={{ cursor: 'pointer' }}>
                <circle cx={pos.x} cy={pos.y} r={14} fill={valves[pipe.valveId] ? '#22c55e' : '#dc2626'} stroke="#fff" strokeWidth={2} />
                <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">{pipe.valveId}</text>
              </g>
            );
          })}

          {nodes.filter(n => n.type).map(node => {
            const hasFill = tankFilled[node.id];
            const isReachable = reachableNodes.has(node.id);
            let fill = '#6b7280', stroke = '#9ca3af';
            if (hasFill) { fill = '#0891b2'; stroke = '#22d3ee'; }
            else if (isReachable) { fill = '#059669'; stroke = '#34d399'; }
            const w = node.type === 'source' ? 60 : node.type === 'outlet' ? 50 : 55;
            const h = node.type === 'source' ? 50 : node.type === 'outlet' ? 40 : 45;
            return (
              <g key={node.id} onClick={() => node.type === 'tank' && toggleTank(node.id)} 
                 style={{ cursor: node.type === 'tank' ? 'pointer' : 'default' }}>
                <rect x={node.x - w/2} y={node.y - h/2} width={w} height={h} rx={4} fill={fill} stroke={stroke} strokeWidth={3} />
                <text x={node.x} y={node.y} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
                  {(node.label || '').split('\n').map((line, i) => (
                    <tspan key={i} x={node.x} dy={i === 0 ? -5 : 12}>{line}</tspan>
                  ))}
                </text>
                {node.type === 'tank' && (
                  <text x={node.x} y={node.y + h/2 + 12} textAnchor="middle" fontSize="9" 
                    fill={hasFill ? '#22d3ee' : isReachable ? '#34d399' : '#9ca3af'}>
                    {hasFill ? '●液あり' : isReachable ? '○受入中' : '空'}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.filter(n => !n.type).map(node => (
            <circle key={node.id} cx={node.x} cy={node.y} r={5}
              fill={reachableNodes.has(node.id) ? '#22d3ee' : '#9ca3af'}
              opacity={reachableNodes.has(node.id) ? 1 : 0.4} />
          ))}
        </svg>
      </div>

      {/* 右パネル */}
      <div style={s.rightPanel}>
        {errors.length > 0 && (
          <div style={s.card}>
            <div style={s.title}>⚠️ 警告</div>
            {errors.map((err, i) => (
              <div key={i} style={s.errorBox(err.severity)}>
                <div style={{ fontWeight: 'bold' }}>{err.severity === 'critical' ? '🚫' : '⚠️'} {err.name}</div>
                <div>{err.message}</div>
              </div>
            ))}
            <button style={s.btn('#475569')} onClick={() => setErrors([])}>クリア</button>
          </div>
        )}

        {mode === 'training' && currentPhase && (
          <div style={s.card}>
            <div style={s.title}>📝 {currentPhase.phase_name}</div>
            {currentPhase.steps.map((step, idx) => (
              <div key={step.step_id} style={s.stepItem(idx === currentStepIndex, idx < currentStepIndex)}>
                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                  {idx < currentStepIndex ? '✓' : idx === currentStepIndex ? '→' : '○'} {step.step_name}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{step.description}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...s.card, flex: 1, overflow: 'auto' }}>
          <div style={s.title}>📜 ログ</div>
          {operationLog.map((log, i) => (
            <div key={i} style={{ fontSize: '10px', padding: '2px 0', borderBottom: '1px solid #374151' }}>
              <span style={{ color: '#64748b' }}>{log.time}</span> {log.target} → <strong>{log.action}</strong>
            </div>
          ))}
        </div>

        <div style={{ ...s.card, fontSize: '10px' }}>
          🟢開 🔴閉 💧水色=液あり 🟢緑=受入中
        </div>
      </div>
    </div>
  );
}
