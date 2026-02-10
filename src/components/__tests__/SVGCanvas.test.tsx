import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Pipe, Valve, ValveState, TankFilledState } from '../../types';
import { SVGCanvas } from '../SVGCanvas';
import { COLORS } from '../../constants/colors';

const svgText = `
<svg xmlns="http://www.w3.org/2000/svg">
  <path id="pipe-1" data-from="input" data-to="tank-T1" d="M0 0" />
  <circle id="valve-1" data-pipe="pipe-1" r="5" />
  <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
</svg>
`;

describe('SVGCanvas', () => {
  const pipes: Pipe[] = [{ id: 'pipe-1', from: 'input', to: 'tank-T1' }];
  const pipeToValveMap: ReadonlyMap<string, Valve> = new Map([[ 'pipe-1', { id: 1, pipeId: 'pipe-1' } ]]);

  const renderCanvas = (valves: ValveState, tankFilled: TankFilledState, reachableNodes: Set<string>) =>
    render(
      <SVGCanvas
        svgText={svgText}
        pipes={pipes}
        valves={valves}
        tankFilled={tankFilled}
        reachableNodes={reachableNodes}
        pipeToValveMap={pipeToValveMap}
        onToggleValve={() => {}}
        onToggleTank={() => {}}
      />
    );

  it('配管の状態に応じてstroke色が更新される', async () => {
    const valves: ValveState = { 1: true };
    const tankFilled: TankFilledState = { input: true, 'tank-T1': false };
    const reachableNodes = new Set(['input', 'tank-T1']);
    const { container } = renderCanvas(valves, tankFilled, reachableNodes);

    const pipe = container.querySelector('#pipe-1');
    expect(pipe).not.toBeNull();

    await waitFor(() => {
      expect(pipe?.getAttribute('stroke')).toBe(COLORS.pipe.active);
    });
  });

  it('バルブ要素クリックでハンドラが呼ばれる', async () => {
    const onToggleValve = vi.fn();
    const valves: ValveState = { 1: false };
    const tankFilled: TankFilledState = { input: true, 'tank-T1': false };
    const reachableNodes = new Set(['input', 'tank-T1']);
    const user = userEvent.setup();

    const { container } = render(
      <SVGCanvas
        svgText={svgText}
        pipes={pipes}
        valves={valves}
        tankFilled={tankFilled}
        reachableNodes={reachableNodes}
        pipeToValveMap={pipeToValveMap}
        onToggleValve={onToggleValve}
        onToggleTank={() => {}}
      />
    );

    const valve = container.querySelector('#valve-1');
    expect(valve).not.toBeNull();
    await waitFor(() => {
      expect(valve?.getAttribute('fill')).toBe(COLORS.valve.closed);
    });
    await user.click(valve as Element);
    expect(onToggleValve).toHaveBeenCalledWith(1);
  });

  it('タンク状態に応じてfill色が更新される', async () => {
    const valves: ValveState = { 1: false };
    const tankFilled: TankFilledState = { input: true, 'tank-T1': false };
    const reachableNodes = new Set(['input', 'tank-T1']);
    const { container } = renderCanvas(valves, tankFilled, reachableNodes);
    const tank = container.querySelector('#tank-T1');

    await waitFor(() => {
      expect(tank?.getAttribute('fill')).toBe(COLORS.tank.reachedEmpty);
    });
  });
});
