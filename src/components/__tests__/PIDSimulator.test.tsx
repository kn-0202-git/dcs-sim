import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PIDSimulator } from '../PIDSimulator';

describe('PIDSimulator', () => {
  describe('初期レンダリング', () => {
    it('タイトルが表示される', () => {
      render(<PIDSimulator />);
      expect(screen.getByText('P&ID 教育シミュレーター')).toBeInTheDocument();
    });

    it('全8バルブボタンが閉状態で表示される', () => {
      render(<PIDSimulator />);
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(`V${i}:X`)).toBeInTheDocument();
      }
    });

    it('モードボタンが表示される', () => {
      render(<PIDSimulator />);
      expect(screen.getByText('訓練')).toBeInTheDocument();
      expect(screen.getByText('自由')).toBeInTheDocument();
    });

    it('フェーズタブが表示される', () => {
      render(<PIDSimulator />);
      // 「準備」はフェーズタブと右パネルの両方に表示されるためgetAllByTextを使用
      expect(screen.getAllByText('準備').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('運転').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('停止').length).toBeGreaterThanOrEqual(1);
    });

    it('訓練モードで最初のステップ指示が表示される', () => {
      render(<PIDSimulator />);
      expect(screen.getByText('全バルブが閉じていることを確認してください')).toBeInTheDocument();
    });
  });

  describe('バルブ操作', () => {
    it('バルブボタンクリックで開閉が切り替わる', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      const v1Button = screen.getByText('V1:X');
      await user.click(v1Button);
      expect(screen.getByText('V1:O')).toBeInTheDocument();
    });

    it('バルブボタン2回クリックで元に戻る', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      const v1Button = screen.getByText('V1:X');
      await user.click(v1Button);
      expect(screen.getByText('V1:O')).toBeInTheDocument();

      await user.click(screen.getByText('V1:O'));
      expect(screen.getByText('V1:X')).toBeInTheDocument();
    });
  });

  describe('モード切替', () => {
    it('自由モードに切り替えるとステップ指示が非表示になる', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      expect(screen.getByText('全バルブが閉じていることを確認してください')).toBeInTheDocument();

      await user.click(screen.getByText('自由'));
      expect(screen.queryByText('全バルブが閉じていることを確認してください')).not.toBeInTheDocument();
    });

    it('訓練モードに戻すとステップ指示が再表示される', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      await user.click(screen.getByText('自由'));
      expect(screen.queryByText('全バルブが閉じていることを確認してください')).not.toBeInTheDocument();

      await user.click(screen.getByText('訓練'));
      expect(screen.getByText('全バルブが閉じていることを確認してください')).toBeInTheDocument();
    });
  });

  describe('リセット', () => {
    it('リセットでバルブが全閉に戻る', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      // V1を開く
      await user.click(screen.getByText('V1:X'));
      expect(screen.getByText('V1:O')).toBeInTheDocument();

      // リセット
      await user.click(screen.getByText('リセット'));
      expect(screen.getByText('V1:X')).toBeInTheDocument();
    });
  });

  describe('訓練フロー', () => {
    it('初期状態でALL_VALVES_CLOSED条件が達成されている', () => {
      render(<PIDSimulator />);
      expect(screen.getByText('条件達成')).toBeInTheDocument();
    });

    it('次のステップへ進める', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      // 初期状態で条件達成 → 次のステップへ
      const nextButton = screen.getByText('次のステップへ');
      await user.click(nextButton);

      // 2番目のステップ「供給ライン開放」が表示される
      expect(screen.getByText('バルブ1を開けてください')).toBeInTheDocument();
    });
  });

  describe('ルール違反', () => {
    it('V6を開くとT1空でcriticalエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      // まずV1を開く（rule-001回避のため）
      await user.click(screen.getByText('V1:X'));

      // V6を開く（T1が空なのでrule-002が発動）
      await user.click(screen.getByText('V6:X'));

      // criticalエラー表示を確認
      expect(screen.getByText(/T-1が空です/)).toBeInTheDocument();
    });

    it('criticalルール違反ではバルブが開かない', async () => {
      const user = userEvent.setup();
      render(<PIDSimulator />);

      // V1を開く
      await user.click(screen.getByText('V1:X'));

      // V6を開こうとする（critical → ブロック）
      await user.click(screen.getByText('V6:X'));

      // V6はまだ閉のまま
      expect(screen.getByText('V6:X')).toBeInTheDocument();
    });
  });
});
