'use client';

import { useState } from 'react';

interface LineMapping {
  line: string;
  casual: string;
  formal: string;
}

interface ConvertResult {
  title?: string;
  casual_katakana: string;
  formal_katakana: string;
  word_mappings: LineMapping[];
  cached: boolean;
}

interface ResultDisplayProps {
  result: ConvertResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [displayMode, setDisplayMode] = useState<'standard' | 'ruby'>('ruby');
  const [rubyStyle, setRubyStyle] = useState<'casual' | 'formal'>('casual');

  const renderRubyText = () => {
    if (!result.word_mappings || result.word_mappings.length === 0) {
      return <p className="text-gray-600">行マッピングが利用できません</p>;
    }

    return (
      <div className="text-lg leading-relaxed space-y-3">
        {result.word_mappings.map((mapping, index) => (
          <div key={index} className="block">
            <ruby className="inline-block">
              <span className="text-gray-900 font-medium text-base">
                {mapping.line}
              </span>
              <rt className={`text-xs font-normal ${
                rubyStyle === 'casual' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {rubyStyle === 'casual' ? mapping.casual : mapping.formal}
              </rt>
            </ruby>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {result.title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📝 {result.title}</h3>
        </div>
      )}
      
      {/* 表示モード選択 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setDisplayMode('ruby')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              displayMode === 'ruby'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📖 ルビ表示
          </button>
          <button
            onClick={() => setDisplayMode('standard')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              displayMode === 'standard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📄 通常表示
          </button>
        </div>

        {displayMode === 'ruby' && (
          <div className="flex gap-2">
            <button
              onClick={() => setRubyStyle('casual')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                rubyStyle === 'casual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              🗣️ カジュアル
            </button>
            <button
              onClick={() => setRubyStyle('formal')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                rubyStyle === 'formal'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-600 hover:bg-green-50'
              }`}
            >
              🎯 フォーマル
            </button>
          </div>
        )}
      </div>

      {/* 結果表示 */}
      {displayMode === 'ruby' ? (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className={`text-sm font-semibold mb-3 ${
            rubyStyle === 'casual' ? 'text-blue-700' : 'text-green-700'
          }`}>
            {rubyStyle === 'casual' ? '🗣️ カジュアル読み（ルビ表示）' : '🎯 フォーマル読み（ルビ表示）'}
          </h4>
          {renderRubyText()}
          <p className={`text-xs mt-3 ${
            rubyStyle === 'casual' ? 'text-blue-600' : 'text-green-600'
          }`}>
            {rubyStyle === 'casual' 
              ? 'ネイティブが話すような自然な音'
              : '正確で丁寧な発音'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">🗣️ カジュアル読み</h4>
            <div className="text-xl font-bold text-blue-900 break-words">
              {result.casual_katakana}
            </div>
            <p className="text-xs text-blue-600 mt-2">ネイティブが話すような自然な音</p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-semibold text-green-700 mb-2">🎯 フォーマル読み</h4>
            <div className="text-xl font-bold text-green-900 break-words">
              {result.formal_katakana}
            </div>
            <p className="text-xs text-green-600 mt-2">正確で丁寧な発音</p>
          </div>
        </div>
      )}
      
      {result.cached && (
        <div className="text-center">
          <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
            💾 キャッシュから高速取得
          </p>
        </div>
      )}
    </div>
  );
}