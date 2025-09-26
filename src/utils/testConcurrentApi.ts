// API並列実行テスト用のユーティリティ

export const testConcurrentApiCalls = async () => {
  console.log('🧪 API並列処理テスト開始...');

  const startTime = Date.now();

  try {
    // 複数のAPIを並列で実行
    const promises = [
      fetch('http://localhost:8000/api/history/recent?limit=5'),
      fetch('http://localhost:8000/'),
      fetch('http://localhost:8000/api/history/recent?limit=1'),
    ];

    const results = await Promise.all(promises);
    const endTime = Date.now();

    console.log(`✅ 並列実行完了: ${endTime - startTime}ms`);
    console.log('レスポンス状況:', results.map(r => r.status));

    return true;
  } catch (error) {
    console.error('❌ 並列実行エラー:', error);
    return false;
  }
};

// 変換中の他API実行テスト
export const testApiDuringConversion = async () => {
  console.log('🔄 変換中API実行テスト...');

  try {
    // 変換APIを開始（バックグラウンド）
    const conversionPromise = fetch('http://localhost:8000/api/convert/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'This is a test conversion that might take some time',
        title: 'Test',
        language: 'en'
      })
    });

    // 変換中に他のAPIを実行
    await new Promise(resolve => setTimeout(resolve, 100)); // 少し待つ

    const otherApiPromise = fetch('http://localhost:8000/');

    const [conversionResult, otherResult] = await Promise.all([
      conversionPromise,
      otherApiPromise
    ]);

    console.log('✅ 変換中の他API実行成功');
    console.log('変換API:', conversionResult.status);
    console.log('その他API:', otherResult.status);

    return true;
  } catch (error) {
    console.error('❌ 変換中API実行エラー:', error);
    return false;
  }
};