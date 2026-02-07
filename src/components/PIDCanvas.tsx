import type { PIDNode, Pipe, ValveState, TankFilledState } from '../types';
import { COLORS, PIPE_INACTIVE_OPACITY } from '../constants/colors';
import { isPipeActive } from '../logic/isPipeActive';

interface PIDCanvasProps {
  nodes: PIDNode[];
  pipes: Pipe[];
  valves: ValveState;
  tankFilled: TankFilledState;
  reachableNodes: Set<string>;
  nodeMap: Record<string, PIDNode>;
  onToggleValve: (id: number) => void;
  onToggleTank: (id: string) => void;
}

export function PIDCanvas({
  nodes, pipes, valves, tankFilled, reachableNodes, nodeMap,
  onToggleValve, onToggleTank,
}: PIDCanvasProps) {
  const getPipePath = (pipe: Pipe) => {
    const from = nodeMap[pipe.from];
    const to = nodeMap[pipe.to];
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  };

  const getValvePosition = (pipe: Pipe) => {
    const from = nodeMap[pipe.from];
    const to = nodeMap[pipe.to];
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  };

  return (
    <svg width="600" height="340" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* 配管 */}
      {pipes.map(pipe => {
        const active = isPipeActive(pipe, valves, reachableNodes);
        return (
          <path key={pipe.id} d={getPipePath(pipe)}
            stroke={active ? COLORS.pipe.active : COLORS.pipe.inactive}
            strokeWidth={active ? 6 : 4}
            fill="none" strokeLinecap="round"
            opacity={active ? 1 : PIPE_INACTIVE_OPACITY} />
        );
      })}

      {/* バルブ */}
      {pipes.filter(p => p.valveId !== null).map(pipe => {
        const pos = getValvePosition(pipe);
        const isOpen = valves[pipe.valveId!];
        return (
          <g key={`v-${pipe.valveId}`} onClick={() => onToggleValve(pipe.valveId!)} style={{ cursor: 'pointer' }}>
            <circle cx={pos.x} cy={pos.y} r={14}
              fill={isOpen ? COLORS.valve.open : COLORS.valve.closed}
              stroke="#fff" strokeWidth={2} />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">
              {pipe.valveId}
            </text>
          </g>
        );
      })}

      {/* タンク・ソース・アウトレット */}
      {nodes.filter(n => n.type).map(node => {
        const hasFill = tankFilled[node.id];
        const isReachable = reachableNodes.has(node.id);
        let fill: string = COLORS.tank.empty;
        let stroke = '#9ca3af';
        if (hasFill) { fill = COLORS.tank.filled; stroke = '#22d3ee'; }
        else if (isReachable) { fill = COLORS.tank.reachedEmpty; stroke = '#34d399'; }
        const w = node.type === 'source' ? 60 : node.type === 'outlet' ? 50 : 55;
        const h = node.type === 'source' ? 50 : node.type === 'outlet' ? 40 : 45;
        return (
          <g key={node.id} onClick={() => node.type === 'tank' && onToggleTank(node.id)}
             style={{ cursor: node.type === 'tank' ? 'pointer' : 'default' }}>
            <rect x={node.x - w/2} y={node.y - h/2} width={w} height={h}
              rx={4} fill={fill} stroke={stroke} strokeWidth={3} />
            <text x={node.x} y={node.y} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
              {(node.label || '').split('\n').map((line, i) => (
                <tspan key={i} x={node.x} dy={i === 0 ? -5 : 12}>{line}</tspan>
              ))}
            </text>
            {node.type === 'tank' && (
              <text x={node.x} y={node.y + h/2 + 12} textAnchor="middle" fontSize="9"
                fill={hasFill ? '#22d3ee' : isReachable ? '#34d399' : '#9ca3af'}>
                {hasFill ? '\u25CF\u6DB2\u3042\u308A' : isReachable ? '\u25CB\u53D7\u5165\u4E2D' : '\u7A7A'}
              </text>
            )}
          </g>
        );
      })}

      {/* 接続点 */}
      {nodes.filter(n => !n.type).map(node => (
        <circle key={node.id} cx={node.x} cy={node.y} r={5}
          fill={reachableNodes.has(node.id) ? COLORS.junction.active : COLORS.junction.inactive}
          opacity={reachableNodes.has(node.id) ? 1 : PIPE_INACTIVE_OPACITY} />
      ))}
    </svg>
  );
}
