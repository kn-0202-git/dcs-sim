import { useState, useRef } from 'react';
import type { Phase, Step, Rule } from '../education/types';
import { parseCSV } from '../education/csvParser';

interface CSVEditorPanelProps {
  phasesData: Phase[];
  stepsData: Step[];
  rulesData: Rule[];
  onApply: (phases: Phase[], steps: Step[], rules: Rule[]) => void;
  onClose: () => void;
}

const btnStyle = (color: string) => ({
  padding: '6px 12px', backgroundColor: color, color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
});

const textareaStyle = {
  width: '100%', height: '120px', backgroundColor: '#1a1a2e', color: '#fff',
  border: '1px solid #475569', borderRadius: '4px', padding: '8px',
  fontFamily: 'monospace', fontSize: '10px',
};

function dataToCSV(data: Record<string, string>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  return [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
}

export function CSVEditorPanel({ phasesData, stepsData, rulesData, onApply, onClose }: CSVEditorPanelProps) {
  const [editPhasesCSV, setEditPhasesCSV] = useState(() => dataToCSV(phasesData));
  const [editStepsCSV, setEditStepsCSV] = useState(() => dataToCSV(stepsData));
  const [editRulesCSV, setEditRulesCSV] = useState(() => dataToCSV(rulesData));
  const [editError, setEditError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const phasesFileRef = useRef<HTMLInputElement>(null);
  const stepsFileRef = useRef<HTMLInputElement>(null);
  const rulesFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (type === 'phases') setEditPhasesCSV(text);
      if (type === 'steps') setEditStepsCSV(text);
      if (type === 'rules') setEditRulesCSV(text);
    };
    reader.readAsText(file);
  };

  const applyCSV = (type: string) => {
    try {
      if (type === 'phases') {
        const data = parseCSV<Phase>(editPhasesCSV);
        if (!data[0]?.phase_id || !data[0]?.phase_name || !data[0]?.order) {
          throw new Error('phases: phase_id, phase_name, order が必要です');
        }
        onApply(data, stepsData, rulesData);
      }
      if (type === 'steps') {
        const data = parseCSV<Step>(editStepsCSV);
        if (!data[0]?.phase_id || !data[0]?.step_id || !data[0]?.condition) {
          throw new Error('steps: phase_id, step_id, condition が必要です');
        }
        onApply(phasesData, data, rulesData);
      }
      if (type === 'rules') {
        const data = parseCSV<Rule>(editRulesCSV);
        if (!data[0]?.rule_id || !data[0]?.condition) {
          throw new Error('rules: rule_id, condition が必要です');
        }
        onApply(phasesData, stepsData, data);
      }
      setEditError('');
    } catch (e) {
      setEditError((e as Error).message);
    }
  };

  const applyAllCSV = () => {
    try {
      const pData = parseCSV<Phase>(editPhasesCSV);
      const sData = parseCSV<Step>(editStepsCSV);
      const rData = parseCSV<Rule>(editRulesCSV);
      onApply(pData, sData, rData);
      setEditError('');
      onClose();
    } catch (e) {
      setEditError('CSVのパースに失敗: ' + (e as Error).message);
    }
  };

  const copyCSV = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(name);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      alert('クリップボードにコピーできませんでした。');
    }
  };

  const csvSection = (
    label: string, value: string, onChange: (v: string) => void,
    type: string, fileRef: React.RefObject<HTMLInputElement | null>, height?: string,
  ) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{label}</div>
      <textarea style={{ ...textareaStyle, height: height || '120px' }} value={value} onChange={e => onChange(e.target.value)} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input type="file" accept=".csv" ref={fileRef} style={{ display: 'none' }} onChange={e => handleFileUpload(e, type)} />
        <button style={btnStyle('#22c55e')} onClick={() => applyCSV(type)}>適用</button>
        <button style={btnStyle('#3b82f6')} onClick={() => fileRef.current?.click()}>インポート</button>
        <button style={btnStyle(copySuccess === type ? '#22c55e' : '#475569')} onClick={() => copyCSV(value, type)}>
          {copySuccess === type ? '\u2713 コピー完了' : 'コピー'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#2d2d44', borderRadius: '12px', padding: '20px',
        width: '600px', maxHeight: '80vh', overflow: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>CSV設定</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={btnStyle('#22c55e')} onClick={applyAllCSV}>全て適用して閉じる</button>
            <button style={btnStyle('#475569')} onClick={onClose}>閉じる</button>
          </div>
        </div>

        {editError && (
          <div style={{ backgroundColor: '#7f1d1d', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
            {editError}
          </div>
        )}

        {csvSection('フェーズ定義 (phases.csv)', editPhasesCSV, setEditPhasesCSV, 'phases', phasesFileRef)}
        {csvSection('ステップ定義 (steps.csv)', editStepsCSV, setEditStepsCSV, 'steps', stepsFileRef, '150px')}
        {csvSection('安全ルール定義 (rules.csv)', editRulesCSV, setEditRulesCSV, 'rules', rulesFileRef, '150px')}

        <div style={{ backgroundColor: '#1a1a2e', padding: '12px', borderRadius: '8px', fontSize: '11px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>条件式の書き方</div>
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
  );
}
