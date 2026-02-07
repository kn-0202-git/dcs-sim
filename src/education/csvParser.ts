export function parseCSV<T = Record<string, string>>(text: string): T[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj as T;
  });
}

export const defaultPhasesCSV = `phase_id,phase_name,order
preparation,準備,1
operation,運転,2
shutdown,停止,3`;

export const defaultStepsCSV = `phase_id,step_id,step_name,description,instruction,condition,order
preparation,prep-1,初期状態確認,全バルブ閉確認,全バルブが閉じていることを確認してください,ALL_VALVES_CLOSED,1
preparation,prep-2,供給ライン開放,バルブ1を開ける,バルブ1を開けてください,V1=OPEN,2
preparation,prep-3,T-1経路確保,バルブ2と3を開ける,バルブ2→バルブ3の順に開けてください,V2=OPEN AND V3=OPEN,3
operation,op-1,T-1液張り確認,T-1に液が入った,T-1をクリックして液ありにしてください,T1=FILLED,1
operation,op-2,出口開放,バルブ8を開ける,バルブ8を開けてください,V8=OPEN,2
operation,op-3,T-1送液,バルブ6を開ける,バルブ6を開けてT-1から送液してください,V6=OPEN,3
shutdown,shut-1,供給停止,バルブ1を閉じる,バルブ1を閉じてください,V1=CLOSED,1
shutdown,shut-2,全バルブ閉止,全バルブを閉じる,全てのバルブを閉じてください,ALL_VALVES_CLOSED,2`;

export const defaultRulesCSV = `rule_id,rule_name,condition,error_message,severity,phases
rule-001,供給元未開放,OPENING:V2+ AND V1=CLOSED,バルブ1（供給ライン）を先に開けてください,warning,all
rule-002,空タンクT-1送液,OPENING:V6 AND T1=EMPTY,T-1が空です。液を張ってから送液してください,critical,all
rule-003,空タンクT-2送液,OPENING:V7 AND T2=EMPTY,T-2が空です。液を張ってから送液してください,critical,all
rule-004,出口未開放,OPENING:V6 AND V8=CLOSED,出口バルブ（バルブ8）を先に開けてください,warning,operation
rule-005,出口未開放,OPENING:V7 AND V8=CLOSED,出口バルブ（バルブ8）を先に開けてください,warning,operation`;
