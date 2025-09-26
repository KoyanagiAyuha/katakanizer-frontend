import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* ロゴ・説明 */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                Katakanizer
              </h3>
              <p className="text-sm text-gray-600">
                英語などの外国語をネイティブの発音に近いカタカナに変換。
                カタカナ英語から脱却して自然な発音を身につけよう。
              </p>
            </div>

            {/* リーガル */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">法的情報</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
              </ul>
            </div>

            {/* サポート */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">サポート</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Katakanizerについて
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              © 2025 Katakanizer. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
