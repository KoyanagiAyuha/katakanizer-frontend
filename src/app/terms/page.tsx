import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">利用規約</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第1条（利用規約の適用）</h2>
              <p>本利用規約（以下「本規約」）は、Katakanizer（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーの皆様には、本規約に従って当サービスをご利用いただきます。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第2条（利用登録）</h2>
              <p>利用登録の申請は、本規約に同意の上、当社の定める方法によって行うものとします。虚偽の情報を登録した場合、当社はサービスの利用を制限することがあります。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第3条（サービスの提供）</h2>
              <p>当サービスは、英語等の外国語をネイティブスピーカーの発音に近いカタカナに変換する機能を提供します。変換結果の正確性について、当社は最善を尽くしますが、100%の精度を保証するものではありません。また、学習支援を目的としており、完全な発音の再現を保証するものではありません。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第4条（コンテンツの公開について）</h2>
              <p className="mb-3">
                <strong className="text-red-600">重要：</strong> 当サービスで変換された内容（入力テキストおよび変換結果）は、他のユーザーの学習支援を目的として、
                <strong className="text-gray-800">公開される場合があります</strong>。
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
                <li>変換履歴は他のユーザーが検索・閲覧できる状態になります</li>
                <li>人気の変換結果はトレンドとして表示される場合があります</li>
                <li>個人情報や機密情報を含むテキストは入力しないでください</li>
              </ul>
              <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                ※ プライベートな内容や著作権で保護されたコンテンツの変換はお控えください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第5条（禁止事項）</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>サーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当サービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>当サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>個人情報や機密情報を含むコンテンツを入力する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第6条（知的財産権）</h2>
              <p>当サービスで生成されたカタカナ変換結果は、学習目的での使用を前提としています。入力された英語等のコンテンツの著作権は、元のコンテンツの著作権者に帰属します。当サービスのシステム、デザイン、ロゴ等の知的財産権は当社に帰属します。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第7条（免責事項）</h2>
              <p>当社は、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しません。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第8条（サービスの変更・中断）</h2>
              <p>当社は、ユーザーに通知することなく、サービスの内容を変更または中断することができるものとします。これによってユーザーに生じた損害について、当社は一切の責任を負いません。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第9条（利用規約の変更）</h2>
              <p>当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第10条（準拠法・裁判管轄）</h2>
              <p>本規約の解釈にあたっては、日本法を準拠法とします。当サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">最終更新日：2025年9月26日</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}