import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function ContactPage() {
  // Google フォームのURL
  const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfLWGL-wXwGDnRwFohzwSbJeo0fjtcmvp1hIHENwbNQtd_wzA/viewform';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">お問い合わせ</h1>

          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <p className="text-gray-700 mb-4">
                Katakanizerに関するご質問、ご要望、不具合報告などがございましたら、お気軽にお問い合わせください。
              </p>
              <p className="text-gray-700">
                お問い合わせは以下のボタンからGoogleフォームにアクセスしてご送信ください。
              </p>
            </div>

            <div className="text-center py-8">
              <a
                href={googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                お問い合わせフォームを開く
              </a>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">お問い合わせ内容について</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">🐛 不具合報告</h3>
                  <p className="text-sm text-gray-600">
                    変換結果の誤り、エラーメッセージ、表示崩れなど、サービスの不具合を発見された場合はお知らせください。
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">💡 機能要望</h3>
                  <p className="text-sm text-gray-600">
                    新機能のアイデアや改善提案がございましたら、ぜひお聞かせください。
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">📝 一般的なお問い合わせ</h3>
                  <p className="text-sm text-gray-600">
                    使い方のご質問、その他サービスに関するお問い合わせ全般を受け付けております。
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">💼 ビジネス関連</h3>
                  <p className="text-sm text-gray-600">
                    業務提携、広告掲載、その他ビジネスに関するご提案もお待ちしております。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>ご注意：</strong>お問い合わせへの返信には数営業日かかる場合がございます。お急ぎの場合は、その旨をお問い合わせ内容に記載ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}