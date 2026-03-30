# Beat Fader Hook Audio 1

1段階目の土台です。

入っているもの:
- Next.js 最小構成
- 画面モック
- パラメータ型
- 初期値
- TENPO / MEGURI の対応表
- TANE 生成
- 表4項目から内部7項目を導く関数

まだ入っていないもの:
- Web Audio API の再生エンジン
- 実際のループ生成
- 保存機能
- NFT ミント処理

## 起動

```bash
npm install
npm run dev
```

## 次に作る予定

- `lib/audio/` に再生エンジン追加
- `lib/generator/` にループ生成追加
- UI と音の接続
