import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Katakanizerについて</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">サービス概要</h2>
              <p className="text-gray-600 leading-relaxed">
                Katakanizerは、英語、フランス語、スペイン語、中国語、韓国語などの外国語をネイティブスピーカーの発音に近いカタカナに変換する革新的な発音学習支援ツールです。
                最新のAI技術（GPT-5）を活用し、日本人が陥りがちなカタカナ英語から脱却し、より自然な発音を身につけるお手伝いをします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">主な特徴</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">🎯 ネイティブ発音</h3>
                  <p className="text-sm text-gray-600">
                    実際の英語ネイティブの発音をカタカナで正確に再現
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">🤖 AI技術</h3>
                  <p className="text-sm text-gray-600">
                    GPT-5による高精度な音声変換で、文脈に応じた適切な発音を提案
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">📚 学習支援</h3>
                  <p className="text-sm text-gray-600">
                    カタカナ英語から脱却し、より自然な発音習得をサポート
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">🌏 多言語対応</h3>
                  <p className="text-sm text-gray-600">
                    英語、フランス語、スペイン語、中国語、韓国語など多言語に対応済み
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">こんな方におすすめ</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3">▶</span>
                  <div>
                    <strong className="text-gray-700">英語学習者</strong>
                    <p className="text-sm text-gray-600 mt-1">ネイティブの発音に近づきたい方、カタカナ英語を改善したい方</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3">▶</span>
                  <div>
                    <strong className="text-gray-700">ビジネスパーソン</strong>
                    <p className="text-sm text-gray-600 mt-1">国際会議やプレゼンで正しい発音を身につけたい方</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3">▶</span>
                  <div>
                    <strong className="text-gray-700">教育関係者</strong>
                    <p className="text-sm text-gray-600 mt-1">生徒に正しい発音を指導したい英語教師、講師の方</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">▶</span>
                  <div>
                    <strong className="text-gray-700">洋楽ファン</strong>
                    <p className="text-sm text-gray-600 mt-1">好きな曲の歌詞を正しい発音で歌いたい方</p>
                  </div>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">具体的な使用例</h2>
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <div className="border-l-4 border-pink-500 pl-4">
                  <p className="font-semibold text-gray-700">“an apple”</p>
                  <p className="text-sm text-gray-600">✗ アン・アップル → ✓ アナポー</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold text-gray-700">&ldquo;McDonald&rsquo;s&rdquo;</p>
                  <p className="text-sm text-gray-600">✗ マクドナルド → ✓ マクダーノズ</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-700">“water”</p>
                  <p className="text-sm text-gray-600">✗ ウォーター → ✓ ワーラー</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold text-gray-700">“Thank you”</p>
                  <p className="text-sm text-gray-600">✗ サンキュー → ✓ センキュー</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">開発の背景</h2>
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Katakanizerは、日本人が英語をより自然に話せるようになることを目指して開発されました。
                </p>
                <p className="text-gray-600">
                  カタカナ英語から脱却し、ネイティブに近い発音を身につけることで、
                  グローバルなコミュニケーションがよりスムーズになることを願っています。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">今後の展開</h2>
              <div className="space-y-3">
                <div className="p-4 border-l-4 border-pink-500 bg-pink-50">
                  <h3 className="font-semibold text-gray-700 mb-1">🎧 音声機能</h3>
                  <p className="text-sm text-gray-600">ネイティブ発音の音声再生機能、発音練習機能</p>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                  <h3 className="font-semibold text-gray-700 mb-1">📱 モバイルアプリ</h3>
                  <p className="text-sm text-gray-600">iOS、Androidネイティブアプリの開発</p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h3 className="font-semibold text-gray-700 mb-1">📚 学習機能</h3>
                  <p className="text-sm text-gray-600">発音テスト、進捗管理、個人レッスン機能</p>
                </div>
              </div>
            </section>

            <div className="mt-12 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg text-center">
              <p className="text-gray-700 font-medium">
                より良いサービスを提供するため、皆様のご意見・ご要望をお待ちしております
              </p>
              <a
                href="/contact"
                className="inline-block mt-4 bg-white text-purple-600 font-medium py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                お問い合わせはこちら
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}