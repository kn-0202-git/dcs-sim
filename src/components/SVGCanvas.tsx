import { useEffect, useRef } from 'react';
import type { Pipe, Valve, ValveState, TankFilledState } from '../types';
import { COLORS, PIPE_INACTIVE_OPACITY } from '../constants/colors';
import { isPipeActive } from '../logic/isPipeActive';

interface SVGCanvasProps {
  svgText: string;
  pipes: Pipe[];
  valves: ValveState;
  tankFilled: TankFilledState;
  reachableNodes: Set<string>;
  pipeToValveMap: ReadonlyMap<string, Valve>;
  onToggleValve: (id: number) => void;
  onToggleTank: (id: string) => void;
}

const SHAPE_SELECTOR = 'path,circle,rect,ellipse,polygon,polyline,line';

const parseTrailingNumber = (value: string | null): number | null => {
  if (!value) return null;
  const match = value.match(/(\d+)$/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isInteger(num) ? num : null;
};

const applyToShapes = (element: Element, apply: (shape: SVGElement) => void) => {
  if (element instanceof SVGElement) {
    apply(element);
  }
  element.querySelectorAll(SHAPE_SELECTOR).forEach(child => {
    if (child instanceof SVGElement) apply(child);
  });
};

export function SVGCanvas({
  svgText, pipes, valves, tankFilled, reachableNodes, pipeToValveMap, onToggleValve, onToggleTank,
}: SVGCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = svgText;
  }, [svgText]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';

    // 配管の描画状態更新
    pipes.forEach(pipe => {
      const element = svg.querySelector<SVGElement>(`#${pipe.id}`);
      if (!element) return;
      const active = isPipeActive(pipe, valves, reachableNodes, pipeToValveMap);
      const stroke = active ? COLORS.pipe.active : COLORS.pipe.inactive;
      const strokeWidth = active ? '6' : '4';
      const opacity = active ? '1' : String(PIPE_INACTIVE_OPACITY);
      applyToShapes(element, shape => {
        shape.setAttribute('stroke', stroke);
        shape.setAttribute('stroke-width', strokeWidth);
        shape.setAttribute('stroke-linecap', 'round');
        shape.setAttribute('opacity', opacity);
        if (shape.tagName !== 'text') {
          shape.setAttribute('fill', 'none');
        }
      });
    });

    const cleanupHandlers: Array<() => void> = [];

    // バルブ操作
    const valveElements = Array.from(svg.querySelectorAll<SVGElement>('[data-pipe]'));
    valveElements.forEach(element => {
      const valveId = parseTrailingNumber(element.getAttribute('id'));
      if (valveId == null) return;
      const isOpen = valves[valveId] === true;
      const fill = isOpen ? COLORS.valve.open : COLORS.valve.closed;
      applyToShapes(element, shape => {
        if (shape.tagName !== 'text') {
          shape.setAttribute('fill', fill);
        }
      });
      element.style.cursor = 'pointer';
      const handler = () => onToggleValve(valveId);
      element.addEventListener('click', handler);
      cleanupHandlers.push(() => element.removeEventListener('click', handler));
    });

    // タンクの描画 + クリック操作
    const tankElements = Array.from(svg.querySelectorAll<SVGElement>('[data-tank-id]'));
    tankElements.forEach(element => {
      const nodeId = element.getAttribute('id');
      if (!nodeId) return;
      const hasFill = tankFilled[nodeId];
      const isReachable = reachableNodes.has(nodeId);
      const fill = hasFill ? COLORS.tank.filled : isReachable ? COLORS.tank.reachedEmpty : COLORS.tank.empty;
      const stroke = hasFill ? '#22d3ee' : isReachable ? '#34d399' : '#9ca3af';
      applyToShapes(element, shape => {
        if (shape.tagName !== 'text') {
          shape.setAttribute('fill', fill);
          shape.setAttribute('stroke', stroke);
          shape.setAttribute('stroke-width', '3');
        }
      });
      element.style.cursor = 'pointer';
      const handler = () => onToggleTank(nodeId);
      element.addEventListener('click', handler);
      cleanupHandlers.push(() => element.removeEventListener('click', handler));
    });

    return () => cleanupHandlers.forEach(clean => clean());
  }, [pipes, valves, tankFilled, reachableNodes, pipeToValveMap, onToggleValve, onToggleTank, svgText]);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: '#f8f9fa', borderRadius: '6px', padding: '8px', minHeight: '340px' }}
    />
  );
}
