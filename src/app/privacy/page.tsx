import BackToHomeButton from '@/components/ui/BackToHomeButton';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="flex-grow py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">プライバシーポリシー</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <p className="mb-4">
                Katakanizer（以下「当サービス」）は、外国語のネイティブ発音をカタカナで学習支援するサービスとして、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第1条（個人情報の収集）</h2>
              <p>当サービスは、以下の方法でユーザーの情報を収集することがあります：</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>ユーザーが利用登録をする際に、ユーザー名、メールアドレス等の情報を収集します</li>
                <li>サービス利用時に、変換履歴（英語等の入力テキスト）、利用頻度等の情報を収集します</li>
                <li>Cookie及び類似技術を使用して、アクセス情報を収集します</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第2条（個人情報の利用目的）</h2>
              <p>収集した個人情報は、以下の目的で利用します：</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに回答するため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                <li>サービスの改善、新サービスの開発のため</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第3条（Cookieの使用）</h2>
              <p>当サービスは、以下の目的でCookieを使用します：</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>ログイン状態の保持</li>
                <li>セキュリティの確保</li>
                <li>サービスの利用状況の分析</li>
                <li>サービスの改善</li>
              </ul>
              <p className="mt-3">ユーザーは、ブラウザの設定によりCookieを無効にすることができますが、その場合、当サービスの一部の機能が利用できなくなる可能性があります。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第4条（第三者提供）</h2>
              <p>当サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません：</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第5条（広告について）</h2>
              <p>当サービスは、将来的にGoogle AdSenseを使用して広告を配信する予定です。広告配信を開始する際は、Cookieを使用して、ユーザーの過去のアクセス情報に基づいて広告が配信される場合があります。</p>
              <p className="mt-2">広告配信開始後は、ユーザーは<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Googleの広告設定</a>から、パーソナライズド広告を無効にすることができます。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第6条（アクセス解析ツール）</h2>
              <p>当サービスは、将来的にGoogleアナリティクス等のアクセス解析ツールを使用する可能性があります。導入時には、Cookieを使用してユーザーのアクセス情報を収集しますが、個人を特定する情報は収集しません。</p>
              <p className="mt-2">アクセス解析ツールを導入する際は、本ポリシーを更新してお知らせします。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第7条（個人情報の開示・訂正・削除）</h2>
              <p>ユーザーは、当サービスに対し、自己の個人情報の開示、訂正、削除を求めることができます。詳細については、お問い合わせフォームよりご連絡ください。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第8条（プライバシーポリシーの変更）</h2>
              <p>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">第9条（お問い合わせ）</h2>
              <p>本ポリシーに関するお問い合わせは、お問い合わせフォームよりお願いいたします。</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">最終更新日：2025年9月26日</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}