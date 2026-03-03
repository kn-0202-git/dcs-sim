import { useState, useMemo, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { ValveState, TankFilledState } from '../types';
import type { Phase, Step, Rule, PhaseWithSteps, Violation } from '../education/types';
import { nodes as sampleNodes, pipes as samplePipes, valves as sampleValves } from '../data/sampleData';
import type { DerivedHelpers } from '../data/deriveHelpers';
import { deriveHelpers } from '../data/deriveHelpers';
import { validateTopology } from '../data/topologyValidator';
import { computeReachableNodes } from '../logic/computeReachableNodes';
import { parseCSV, defaultPhasesCSV, defaultStepsCSV, defaultRulesCSV } from '../education/csvParser';
import { evaluateCondition } from '../education/conditionEvaluator';
import { checkRules } from '../education/ruleCheckEngine';
import { PIDCanvas } from './PIDCanvas';
import { SVGCanvas } from './SVGCanvas';
import { CSVEditorPanel } from './CSVEditorPanel';
import { buildSvgTopology, type SVGTopology } from '../svg/svgTopology';

interface LogEntry {
  time: string;
  action: string;
  target: string;
}

interface SVGStatus {
  fileName?: string;
  errors: string[];
  warnings: string[];
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

const sampleTopology = {
  nodes: sampleNodes,
  pipes: samplePipes,
  valves: sampleValves,
  helpers: deriveHelpers(sampleNodes, sampleValves),
};

// dev モードでトポロジーの整合性を検証
if (import.meta.env.DEV) {
  const validation = validateTopology(sampleTopology.nodes, sampleTopology.pipes, sampleTopology.valves);
  if (!validation.valid) {
    console.error('Topology validation errors:', validation.errors);
  }
}

export function PIDSimulator() {
  // CSV データ
  const [phasesData, setPhasesData] = useState<Phase[]>(() => parseCSV<Phase>(defaultPhasesCSV));
  const [stepsData, setStepsData] = useState<Step[]>(() => parseCSV<Step>(defaultStepsCSV));
  const [rulesData, setRulesData] = useState<Rule[]>(() => parseCSV<Rule>(defaultRulesCSV));

  const [dataSource, setDataSource] = useState<'sample' | 'svg'>('sample');
  const [svgText, setSvgText] = useState('');
  const [svgTopology, setSvgTopology] = useState<SVGTopology | null>(null);
  const [svgStatus, setSvgStatus] = useState<SVGStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // シミュレーター状態
  const [valves, setValves] = useState<ValveState>(() => ({ ...sampleTopology.helpers.initialValves }));
  const [tankFilled, setTankFilled] = useState<TankFilledState>(() => ({ ...sampleTopology.helpers.initialTankFilled }));
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

  const activeTopology = dataSource === 'svg' && svgTopology ? svgTopology : sampleTopology;
  const { nodes: activeNodes, pipes: activePipes, helpers: activeHelpers } = activeTopology;

  // 到達判定
  const reachableNodes = useMemo(
    () => computeReachableNodes(activeNodes, activePipes, valves, tankFilled, activeHelpers.pipeToValveMap),
    [activeNodes, activePipes, valves, tankFilled, activeHelpers],
  );

  // リセット
  const resetAllWith = useCallback((helpers: DerivedHelpers) => {
    setValves({ ...helpers.initialValves });
    setTankFilled({ ...helpers.initialTankFilled });
    setCurrentPhaseIndex(0);
    setCurrentStepIndex(0);
    setErrors([]);
    setOperationLog([]);
  }, []);

  const resetAll = useCallback(() => {
    resetAllWith(activeHelpers);
  }, [resetAllWith, activeHelpers]);

  // バルブ操作
  const toggleValve = useCallback((id: number) => {
    const isOpening = !valves[id];
    const action = { type: isOpening ? 'open_valve' as const : 'close_valve' as const, target: id };

    if (mode === 'training' && isOpening) {
      try {
        const violations = checkRules(action, { valves, tanks: tankFilled }, rulesData, currentPhase?.phase_id, activeHelpers.allValveIds, activeHelpers.tankIdMap);
        if (violations.length > 0) {
          setErrors(prev => [...violations, ...prev].slice(0, 5));
          if (violations.some(v => v.severity === 'critical')) return;
        }
      } catch (e) {
        console.error('Rule check failed:', e);
      }
    }

    setValves(prev => ({ ...prev, [id]: !prev[id] }));
    setOperationLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: isOpening ? '開' : '閉',
      target: `バルブ${id}`,
    }, ...prev].slice(0, 20));
  }, [valves, mode, rulesData, currentPhase, tankFilled, activeHelpers]);

  // タンク操作
  const toggleTank = useCallback((id: string) => {
    if (activeHelpers.nodeMap[id]?.type !== 'tank') return;
    setTankFilled(prev => ({ ...prev, [id]: !prev[id] }));
    setOperationLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: !tankFilled[id] ? '液あり' : '空',
      target: activeHelpers.nodeMap[id]?.label || id,
    }, ...prev].slice(0, 20));
  }, [tankFilled, activeHelpers]);

  // ステップ完了チェック
  const isStepComplete = useMemo(() => {
    if (!currentStep) return false;
    return evaluateCondition(currentStep.condition, { valves, tanks: tankFilled }, null, activeHelpers.allValveIds, activeHelpers.tankIdMap);
  }, [currentStep, valves, tankFilled, activeHelpers]);

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

  const handleSvgUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      try {
        const result = await buildSvgTopology(text);
        if (!result.valid || !result.topology) {
          setSvgStatus({ fileName: file.name, errors: result.errors, warnings: result.warnings });
          setSvgTopology(null);
          setSvgText('');
          setDataSource('sample');
          return;
        }

        setSvgStatus({ fileName: file.name, errors: [], warnings: result.warnings });
        setSvgTopology(result.topology);
        setSvgText(text);
        setDataSource('svg');
        resetAllWith(result.topology.helpers);
      } catch {
        setSvgStatus({
          fileName: file.name,
          errors: ['SVG読み込み中に予期しないエラーが発生しました'],
          warnings: [],
        });
        setSvgTopology(null);
        setSvgText('');
        setDataSource('sample');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [resetAllWith]);

  const switchToSample = useCallback(() => {
    setDataSource('sample');
    resetAllWith(sampleTopology.helpers);
  }, [resetAllWith]);

  const switchToSvg = useCallback(() => {
    if (!svgTopology) return;
    setDataSource('svg');
    resetAllWith(svgTopology.helpers);
  }, [resetAllWith, svgTopology]);

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
            <input ref={fileInputRef} type="file" accept=".svg" onChange={handleSvgUpload} style={{ display: 'none' }} />
            <button style={s.btn('#10b981')} onClick={() => fileInputRef.current?.click()}>SVG読み込み</button>
            <button style={s.btn(dataSource === 'sample' ? '#3b82f6' : '#475569')} onClick={switchToSample}>標準</button>
            <button
              style={s.btn(dataSource === 'svg' ? '#3b82f6' : '#475569', !svgTopology)}
              onClick={switchToSvg}
              disabled={!svgTopology}
            >
              SVG
            </button>
            <button style={s.btn(mode === 'training' ? '#3b82f6' : '#475569')} onClick={() => setMode('training')}>訓練</button>
            <button style={s.btn(mode === 'free' ? '#3b82f6' : '#475569')} onClick={() => setMode('free')}>自由</button>
            <button style={s.btn('#6b7280')} onClick={resetAll}>リセット</button>
          </div>
        </div>

        {svgStatus?.fileName && (
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
            SVG: {svgStatus.fileName} {dataSource === 'svg' ? '(適用中)' : ''}
          </div>
        )}

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

        {svgStatus && (svgStatus.errors.length > 0 || svgStatus.warnings.length > 0) && (
          <div style={s.card}>
            <div style={s.title}>SVG読み込み結果</div>
            {svgStatus.errors.map((err, i) => (
              <div key={`svg-err-${i}`} style={s.errorBox('critical')}>{err}</div>
            ))}
            {svgStatus.warnings.map((warn, i) => (
              <div key={`svg-warn-${i}`} style={s.errorBox('warning')}>{warn}</div>
            ))}
          </div>
        )}

        {/* バルブ制御 */}
        <div style={s.card}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>バルブ制御</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {activeHelpers.allValveIds.map(id => (
              <button key={id} style={s.valveBtn(valves[id])} onClick={() => toggleValve(id)}>
                V{id}:{valves[id] ? 'O' : 'X'}
              </button>
            ))}
          </div>
        </div>

        {/* P&ID図 */}
        {dataSource === 'svg' && svgText ? (
          <SVGCanvas
            svgText={svgText}
            pipes={activePipes}
            valves={valves}
            tankFilled={tankFilled}
            reachableNodes={reachableNodes}
            pipeToValveMap={activeHelpers.pipeToValveMap}
            onToggleValve={toggleValve}
            onToggleTank={toggleTank}
          />
        ) : (
          <PIDCanvas
            nodes={activeNodes}
            pipes={activePipes}
            valves={valves}
            tankFilled={tankFilled}
            reachableNodes={reachableNodes}
            nodeMap={activeHelpers.nodeMap}
            pipeToValveMap={activeHelpers.pipeToValveMap}
            onToggleValve={toggleValve}
            onToggleTank={toggleTank}
          />
        )}
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
