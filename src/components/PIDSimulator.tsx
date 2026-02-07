import { useState, useMemo, useCallback } from 'react';
import type { ValveState, TankFilledState } from '../types';
import type { Phase, Step, Rule, PhaseWithSteps, Violation } from '../education/types';
import { nodes, pipes, allValveIds, nodeMap, initialValves, initialTankFilled } from '../data/sampleData';
import { computeReachableNodes } from '../logic/computeReachableNodes';
import { parseCSV, defaultPhasesCSV, defaultStepsCSV, defaultRulesCSV } from '../education/csvParser';
import { evaluateCondition } from '../education/conditionEvaluator';
import { checkRules } from '../education/ruleCheckEngine';
import { PIDCanvas } from './PIDCanvas';
import { CSVEditorPanel } from './CSVEditorPanel';

interface LogEntry {
  time: string;
  action: string;
  target: string;
}

const s = {
  container: { display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#1a1a2e', minHeight: '100vh', fontFamily: 'sans-serif', color: '#fff' } as const,
  leftPanel: { flex: '1', display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  rightPanel: { width: '280px', display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  card: { backgroundColor: '#2d2d44', borderRadius: '8px', padding: '12px' } as const,
  title: { fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' } as const,
  btn: (color: string, disabled = false) => ({
    padding: '6px 12px', backgroundColor: disabled ? '#475569' : color, color: '#fff',
    border: 'none', borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '11px', opacity: disabled ? 0.6 : 1,
  }),
  valveBtn: (isOn: boolean) => ({
    padding: '4px 8px', backgroundColor: isOn ? '#22c55e' : '#dc2626', color: '#fff',
    border: 'none', borderRadius: '3px', cursor: 'pointer', fontFamily: 'monospace',
    fontSize: '11px', minWidth: '50px',
  }),
  phaseTab: (active: boolean) => ({
    padding: '6px 12px', backgroundColor: active ? '#3b82f6' : '#475569', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
  }),
  stepItem: (isCurrent: boolean, isComplete: boolean) => ({
    padding: '8px', backgroundColor: isCurrent ? '#1e40af' : isComplete ? '#065f46' : '#374151',
    borderRadius: '4px', marginBottom: '4px',
    borderLeft: isCurrent ? '3px solid #60a5fa' : '3px solid transparent',
  }),
  errorBox: (severity: string) => ({
    padding: '8px', backgroundColor: severity === 'critical' ? '#7f1d1d' : '#78350f',
    borderRadius: '4px', marginBottom: '4px',
    borderLeft: `3px solid ${severity === 'critical' ? '#ef4444' : '#f59e0b'}`, fontSize: '11px',
  }),
};

export function PIDSimulator() {
  // CSV データ
  const [phasesData, setPhasesData] = useState<Phase[]>(() => parseCSV<Phase>(defaultPhasesCSV));
  const [stepsData, setStepsData] = useState<Step[]>(() => parseCSV<Step>(defaultStepsCSV));
  const [rulesData, setRulesData] = useState<Rule[]>(() => parseCSV<Rule>(defaultRulesCSV));

  // シミュレーター状態
  const [valves, setValves] = useState<ValveState>(() => ({ ...initialValves }));
  const [tankFilled, setTankFilled] = useState<TankFilledState>(() => ({ ...initialTankFilled }));
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<Violation[]>([]);
  const [operationLog, setOperationLog] = useState<LogEntry[]>([]);
  const [mode, setMode] = useState<'training' | 'free'>('training');
  const [showCSVPanel, setShowCSVPanel] = useState(false);

  // フェーズ・ステップを構造化
  const phases: PhaseWithSteps[] = useMemo(() => {
    return phasesData
      .sort((a, b) => parseInt(a.order) - parseInt(b.order))
      .map(phase => ({
        ...phase,
        steps: stepsData
          .filter(st => st.phase_id === phase.phase_id)
          .sort((a, b) => parseInt(a.order) - parseInt(b.order)),
      }));
  }, [phasesData, stepsData]);

  const currentPhase = phases[currentPhaseIndex];
  const currentStep = currentPhase?.steps[currentStepIndex];

  // 到達判定
  const reachableNodes = useMemo(
    () => computeReachableNodes(nodes, pipes, valves, tankFilled),
    [valves, tankFilled],
  );

  // リセット
  const resetAll = useCallback(() => {
    setValves({ ...initialValves });
    setTankFilled({ ...initialTankFilled });
    setCurrentPhaseIndex(0);
    setCurrentStepIndex(0);
    setErrors([]);
    setOperationLog([]);
  }, []);

  // バルブ操作
  const toggleValve = useCallback((id: number) => {
    const isOpening = !valves[id];
    const action = { type: isOpening ? 'open_valve' as const : 'close_valve' as const, target: id };

    if (mode === 'training' && isOpening) {
      const violations = checkRules(action, { valves, tanks: tankFilled }, rulesData, currentPhase?.phase_id, allValveIds);
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
  }, [valves, mode, rulesData, currentPhase, tankFilled]);

  // タンク操作
  const toggleTank = useCallback((id: string) => {
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
    return evaluateCondition(currentStep.condition, { valves, tanks: tankFilled }, null, allValveIds);
  }, [currentStep, valves, tankFilled]);

  // 次のステップへ
  const goNextStep = useCallback(() => {
    if (currentStepIndex < (currentPhase?.steps.length ?? 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
      setCurrentStepIndex(0);
    }
    setErrors([]);
  }, [currentPhase, currentStepIndex, currentPhaseIndex, phases.length]);

  // CSV適用
  const handleCSVApply = useCallback((newPhases: Phase[], newSteps: Step[], newRules: Rule[]) => {
    setPhasesData(newPhases);
    setStepsData(newSteps);
    setRulesData(newRules);
    resetAll();
  }, [resetAll]);

  const isComplete = currentPhaseIndex === phases.length - 1 &&
                     currentStepIndex === (currentPhase?.steps.length ?? 0) - 1 &&
                     isStepComplete;

  return (
    <div style={s.container}>
      {showCSVPanel && (
        <CSVEditorPanel
          phasesData={phasesData} stepsData={stepsData} rulesData={rulesData}
          onApply={handleCSVApply} onClose={() => setShowCSVPanel(false)}
        />
      )}

      {/* 左パネル */}
      <div style={s.leftPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>P&ID 教育シミュレーター</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.btn('#8b5cf6')} onClick={() => setShowCSVPanel(true)}>CSV設定</button>
            <button style={s.btn(mode === 'training' ? '#3b82f6' : '#475569')} onClick={() => setMode('training')}>訓練</button>
            <button style={s.btn(mode === 'free' ? '#3b82f6' : '#475569')} onClick={() => setMode('free')}>自由</button>
            <button style={s.btn('#6b7280')} onClick={resetAll}>リセット</button>
          </div>
        </div>

        {/* フェーズタブ */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {phases.map((phase, idx) => (
            <button key={phase.phase_id} style={s.phaseTab(idx === currentPhaseIndex)}>
              {idx < currentPhaseIndex ? '\u2713 ' : ''}{phase.phase_name}
            </button>
          ))}
        </div>

        {/* 現在のステップ */}
        {mode === 'training' && currentStep && (
          <div style={{ ...s.card, backgroundColor: '#1e3a5f' }}>
            <div style={s.title}>{currentStep.step_name}</div>
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>{currentStep.instruction}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isStepComplete ? (
                <>
                  <span style={{ color: '#4ade80' }}>条件達成</span>
                  <button style={s.btn('#22c55e')} onClick={goNextStep}>
                    {currentStepIndex < (currentPhase?.steps.length ?? 0) - 1 ? '次のステップへ' :
                     currentPhaseIndex < phases.length - 1 ? '次のフェーズへ' : '完了！'}
                  </button>
                </>
              ) : (
                <span style={{ color: '#fbbf24' }}>{currentStep.condition}</span>
              )}
            </div>
          </div>
        )}

        {isComplete && mode === 'training' && (
          <div style={{ ...s.card, backgroundColor: '#065f46', textAlign: 'center' }}>
            <div style={{ fontSize: '18px' }}>全手順完了！</div>
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
        <PIDCanvas
          nodes={nodes} pipes={pipes} valves={valves} tankFilled={tankFilled}
          reachableNodes={reachableNodes} nodeMap={nodeMap}
          onToggleValve={toggleValve} onToggleTank={toggleTank}
        />
      </div>

      {/* 右パネル */}
      <div style={s.rightPanel}>
        {errors.length > 0 && (
          <div style={s.card}>
            <div style={s.title}>警告</div>
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
            <div style={s.title}>{currentPhase.phase_name}</div>
            {currentPhase.steps.map((step, idx) => (
              <div key={step.step_id} style={s.stepItem(idx === currentStepIndex, idx < currentStepIndex)}>
                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                  {idx < currentStepIndex ? '\u2713' : idx === currentStepIndex ? '\u2192' : '\u25CB'} {step.step_name}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{step.description}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...s.card, flex: 1, overflow: 'auto' }}>
          <div style={s.title}>ログ</div>
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
