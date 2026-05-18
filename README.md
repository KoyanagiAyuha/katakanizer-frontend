# Katakanizer Frontend

英語などの外国語を、ネイティブスピーカーの発音に近いカタカナに変換する学習支援ツール「Katakanizer」のフロントエンドです。

- フレームワーク: [Next.js](https://nextjs.org) 16 (App Router)
- UI: React 19 / Tailwind CSS 4
- 認証: Firebase Authentication
- ホスティング: Vercel

## セットアップ

依存パッケージのインストール（パッケージマネージャは Yarn）:

```bash
yarn install
```

環境変数ファイルを作成します:

```bash
cp .env.example .env
```

`.env` に以下の値を設定してください:

| 変数名 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | バックエンドAPIのベースURL（例: `http://localhost:8000`） |
| `NEXT_PUBLIC_SITE_URL` | 本番サイトのURL。OGP画像などの絶対URL解決に使用（例: `https://katakanizer.lydear.com`） |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase プロジェクトID |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 認証ドメイン |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase APIキー |

## 開発

```bash
yarn dev
```

[http://localhost:3000](http://localhost:3000) を開くと確認できます。

## ビルド

```bash
yarn build   # 本番ビルド
yarn start   # 本番ビルドの起動
yarn lint    # ESLint
```

## デプロイ

Vercel にホスティングしています。上記の環境変数を Vercel のプロジェクト設定（Environment Variables）に登録してください。`main` ブランチへのプッシュで自動デプロイされます。
