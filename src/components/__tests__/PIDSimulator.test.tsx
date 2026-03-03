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

  describe('SVGアップロード', () => {
    it('draw.io(mxGraph)SVGをアップロードして適用できる', async () => {
      const user = userEvent.setup();
      const { container } = render(<PIDSimulator />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const mxGraphXml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="input" vertex="1" parent="1"/>
    <mxCell id="valve-1" vertex="1" parent="1"/>
    <mxCell id="tank-T1" vertex="1" parent="1"/>
    <mxCell id="outlet" vertex="1" parent="1"/>
    <mxCell id="pipe-1" edge="1" source="input" target="valve-1" parent="1"/>
    <mxCell id="pipe-2" edge="1" source="valve-1" target="tank-T1" parent="1"/>
    <mxCell id="pipe-3" edge="1" source="tank-T1" target="outlet" parent="1"/>
  </root>
</mxGraphModel>
      `.trim();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(mxGraphXml)}"></svg>`;
      const file = new File([svg], 'mxgraph.svg', { type: 'image/svg+xml' });

      await user.upload(input, file);

      expect(await screen.findByText(/SVG: mxgraph\.svg/)).toBeInTheDocument();
      expect(screen.queryByText('V8:X')).not.toBeInTheDocument();
      expect(screen.getByText('V1:X')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled();
    });

    it('mxGraphが不正でもdata属性が有効なら警告付きで適用できる', async () => {
      const user = userEvent.setup();
      const { container } = render(<PIDSimulator />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const invalidMx = '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>';
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(invalidMx)}">
  <path id="pipe-1" data-from="input" data-to="tank-T1" d="M0 0" />
  <path id="pipe-2" data-from="tank-T1" data-to="outlet" d="M1 1" />
  <circle id="valve-1" data-pipe="pipe-1" r="5" />
  <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
</svg>
      `.trim();
      const file = new File([svg], 'fallback.svg', { type: 'image/svg+xml' });

      await user.upload(input, file);

      expect(await screen.findByText('mxGraphの解析結果が不正のため、data-*属性の解析結果を使用しました')).toBeInTheDocument();
      expect(screen.getByText(/SVG: fallback\.svg/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled();
    });

    it('不正SVGのアップロード時はエラー表示してsampleへフォールバックする', async () => {
      const user = userEvent.setup();
      const { container } = render(<PIDSimulator />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['<svg><path></svg'], 'broken.svg', { type: 'image/svg+xml' });

      await user.upload(input, file);

      expect(await screen.findByText('SVGの解析に失敗しました')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'SVG' })).toBeDisabled();
      expect(screen.getByText('V8:X')).toBeInTheDocument();
    });
  });
});
